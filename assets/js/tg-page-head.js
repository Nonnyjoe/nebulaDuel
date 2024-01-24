const ENABLE_PAGE_REVEALER = true;
const ENABLE_PAGE_PRELOADER = true;

const ENABLE_PAGE_REVEALER_USED = ENABLE_PAGE_REVEALER && localStorage.getItem('page-revealer') === 'show';

// Page Revealer
if (ENABLE_PAGE_REVEALER) {
    const easing = 'cubic-bezier(0.8, 0, 0.2, 1)';
    const duration = 1.1; // seconds

    const revealer = document.createElement('div');
    revealer.classList.add('page-revealer');
    document.documentElement.append(revealer);
    window.addEventListener('pageshow', () => {
        revealer.style.visibility = '';
        revealer.style.transform = '';
        revealer.style.transformOrigin = '';
    });

    ENABLE_PAGE_REVEALER_USED && (async () => {
        localStorage.removeItem('page-revealer');
        revealer.style.transition = '';
        revealer.style.visibility = 'visible';
        revealer.style.transform = 'scaleY(1)';
        revealer.style.transformOrigin = 'center bottom';
        await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        await new Promise(r => requestAnimationFrame(r));
        revealer.style.transition = 'transform ' + duration + 's ' + easing;
        revealer.style.transform = 'scaleY(0)';
        revealer.style.transformOrigin = 'center top';
        await new Promise(r => setTimeout(r, duration * 1100));
        revealer.style.visibility = '';
        revealer.style.transform = '';
        revealer.style.transformOrigin = '';
    })();
    /**
     *
     * @param {HTMLAnchorElement} anchor
     */
    const shouldShowRevealer = anchor => {
        const isSameOrigin = location.protocol === anchor.protocol && location.origin === anchor.origin;
        // revealer works only when navigating to the same domain
        if (!isSameOrigin) return false;
        if (anchor.target === '_blank') return false;
        const isSamePage = location.pathname === anchor.pathname && location.search === anchor.search;
        // revealer works when changing page
        if (!isSamePage) return true;
        const hasHash = anchor.hash || anchor.href !== anchor.origin + anchor.pathname + anchor.search + anchor.hash;
        // revealer don't work when anchor has hash
        if (hasHash) return false;
        return true;
    };
    document.addEventListener('click', async e => {
        /** @type {HTMLElement} */
        // @ts-ignore
        const el = e.target;
        const anchor = el.closest('a');
        if (anchor && anchor instanceof HTMLAnchorElement && !e.defaultPrevented && shouldShowRevealer(anchor)) {
            e.preventDefault();
            revealer.style.transition = 'transform ' + duration + 's ' + easing;
            revealer.style.visibility = 'visible';
            revealer.style.transform = 'scaleY(1)';
            revealer.style.transformOrigin = 'center bottom';
            await new Promise(r => setTimeout(r, duration * 1000));
            localStorage.setItem('page-revealer', 'show');
            location.href = anchor.href;
        }
    });
}

// Page Preloader
if (!ENABLE_PAGE_REVEALER_USED && ENABLE_PAGE_PRELOADER) {
    const easing = 'cubic-bezier(0.8, 0, 0.2, 1)';
    const duration = 1.1; // seconds
    const preloader = document.createElement('div');
    preloader.classList.add('tg-preloader');
    preloader.innerHTML = `
        <div class="tg-loading">
            <div></div><div></div><div></div><div></div>
        </div>
    `;
    document.documentElement.classList.add('show-preloader');
    document.documentElement.append(preloader);
    const t0 = Date.now();
    (async () => {
        await new Promise(r => document.addEventListener('DOMContentLoaded', r));
        document.documentElement.classList.remove('show-preloader');
        await new Promise(r => requestAnimationFrame(r));
        await new Promise(r => setTimeout(r, Math.max(0, 500 - (Date.now() - t0))));
        preloader.style.transition = 'opacity ' + duration + 's ' + easing;
        preloader.style.opacity = '0';
        await new Promise(r => setTimeout(r, duration * 1000));
        preloader.remove();
    })();
}