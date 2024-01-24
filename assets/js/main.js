(function ($) {
	"use strict";


/*==============================
    Nested jQuery Active List
--------------------------------
    01. Preloader
    02. Mobile Menu
    03. Data Background
    04. Data Color
    05. Sticky Menu
    06. Scroll to Top
    07. Scroll Up
    08. Search Active
    09. Click Sound Active
    10. OffCanvas Active
    11. Gallery Active
    12. Project Active
    13. Third Slider Active
    14. Trending Active
    15. Streamers Active
    16. Brand Active
    17. Intersection Observer
    18. Brand effect
    19. Button Icon Draw
    20. parallaxMouse Active
    21. Odometer Active
    22. Magnific Popup
    23. Jarallax Active
    24. Countdown Active
    25. Parallax Active
    26. Slider Range Active
    27. Cart Active
    28. Click to Active
    29. servicesTab Active
    30. FaqTab Active
    31. SplitText Active
    32. GSAP Active
    33. Wow Active

================================*/



/*==========================================
	=           Preloader          =
============================================*/
function preloader() {
	$('.tg-preloader').delay(0).fadeOut();
};

$(window).on('load', function () {
	preloader();
    mainSlider();
	wowAnimation();
    splitText();
    tg_title_animation();
});



//navtabs active class add & remove
	$('ul.nav-tabs li button').on('click', function () {
		$('.tab-content .tab-pane').removeClass('active');
	});
	$('ul.nav-tabs li button').on('click', function () {
		$('.tab-content .tab-pane').addClass('active');
	});


/*===========================================
	=           Mobile Menu          =
=============================================*/
//SubMenu Dropdown Toggle
if ($('.tgmenu__wrap li.menu-item-has-children ul').length) {
	$('.tgmenu__wrap .navigation li.menu-item-has-children').append('<div class="dropdown-btn"><span class="plus-line"></span></div>');
}

//Mobile Nav Hide Show
if ($('.tgmobile__menu').length) {

	var mobileMenuContent = $('.tgmenu__wrap .tgmenu__main-menu').html();
	$('.tgmobile__menu .tgmobile__menu-box .tgmobile__menu-outer').append(mobileMenuContent);

	//Dropdown Button
	$('.tgmobile__menu li.menu-item-has-children .dropdown-btn').on('click', function () {
		$(this).toggleClass('open');
		$(this).prev('ul').slideToggle(300);
	});
	//Menu Toggle Btn
	$('.mobile-nav-toggler').on('click', function () {
		$('body').addClass('mobile-menu-visible');
	});

	//Menu Toggle Btn
	$('.tgmobile__menu-backdrop, .tgmobile__menu .close-btn').on('click', function () {
		$('body').removeClass('mobile-menu-visible');
	});
}


/*===========================================
     =          Data Background        =
=============================================*/
$("[data-background]").each(function () {
	$(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
})

/*===========================================
	=           Data Color             =
=============================================*/
$("[data-bg-color]").each(function () {
	$(this).css("background-color", $(this).attr("data-bg-color"));
});


/*===========================================
	   =         Sticky Menu     =
=============================================*/
function stickyHeader() {

    var $window = $(window);
    var lastScrollTop = 0;
    var $headerID = $('#sticky-header');
    var headerHeight = $headerID.outerHeight() + 30;

    $window.scroll(function () {
        var windowTop = $window.scrollTop();

        if (windowTop >= headerHeight) {
            $headerID.addClass('tg-sticky-menu');
        } else {
            $headerID.removeClass('tg-sticky-menu');
            $headerID.removeClass('sticky-menu__show');
        }

        if ($headerID.hasClass('tg-sticky-menu')) {
            if (windowTop < lastScrollTop) {
                $headerID.addClass('sticky-menu__show');
            } else {
                $headerID.removeClass('sticky-menu__show');
            }
        }

        lastScrollTop = windowTop;
    });
};
stickyHeader();


/*===========================================
	=          Scroll to Top      =
=============================================*/
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 245) {
		$('.scroll-to-target').removeClass('open');

	} else {
		$('.scroll-to-target').addClass('open');
	}
});


/*===========================================
	=    		 Scroll Up  	         =
=============================================*/
if ($('.scroll-to-target').length) {
  $(".scroll-to-target").on('click', function () {
    var target = $(this).attr('data-target');
    // animate
    $('html, body').animate({
      scrollTop: $(target).offset().top
    }, 0);

  });
}

/*===========================================
	=            Search Active            =
=============================================*/
if($('.tgmenu__action .search').length) {
    $('.tgmenu__action .search').on('click', function() {
        $('body').addClass('search__active');
        return false
    });
    $('.search__close').on('click', function() {
        $('body').removeClass('search__active');
    });
}


/*===========================================
	=        Click Sound Active		      =
=============================================*/
$('.search a, .tg-btn-1, .side-toggle-icon, .mobile-nav-toggler, .dropdown-btn').on('click', () => new Audio('assets/audio/click.wav').play());
$('.search__close, .offCanvas__toggle, .offCanvas__overlay, .close-btn').on('click', () => new Audio('assets/audio/remove.wav').play());
$('.about__tab-wrap ul button').on('click', () => new Audio('assets/audio/tab.mp3').play());


/*===========================================
	=            OffCanvas Active     =
=============================================*/
$('.side-toggle-icon').on('click', function () {
	$('body').addClass('offCanvas__menu-visible');
});
$('.offCanvas__overlay, .offCanvas__toggle').on('click', function () {
	$('body').removeClass('offCanvas__menu-visible');
});


/*==========================================
	=        Gallery Active		      =
=============================================*/
var $swiperSelector = $('.gallery-active');

$swiperSelector.each(function(index) {
    var $this = $(this);
    $this.addClass('swiper-slider-' + index);

    var dragSize = $this.data('drag-size') ? $this.data('drag-size') : 200;
    var freeMode = $this.data('free-mode') ? $this.data('free-mode') : false;
    var loop = $this.data('loop') ? $this.data('loop') : true;
    var slidesDesktop = $this.data('slides-desktop') ? $this.data('slides-desktop') : 1;
    var slidesTablet = $this.data('slides-tablet') ? $this.data('slides-tablet') : 1;
    var slidesMobile = $this.data('slides-mobile') ? $this.data('slides-mobile') : 1;
    var spaceBetween = $this.data('space-between') ? $this.data('space-between'): 1;

    var swiper = new Swiper('.swiper-slider-' + index, {
      direction: 'horizontal',
      loop: loop,
      freeMode: freeMode,
      centeredSlides: true,
      spaceBetween: spaceBetween,
      observer: true,
        observeParents: true,
      breakpoints: {
        1920: {
          slidesPerView: slidesDesktop
        },
        992: {
          slidesPerView: slidesTablet
        },
        320: {
           slidesPerView: slidesMobile
        }
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
        dragSize: dragSize
      }
   });
});


/*==========================================
	=        Project Active		      =
=============================================*/
var $swiperSelector = $('.project-active');

$swiperSelector.each(function(index) {
    var $this = $(this);
    $this.addClass('swiper-slider-' + index);

    var dragSize = $this.data('drag-size') ? $this.data('drag-size') : 24;
    var freeMode = $this.data('free-mode') ? $this.data('free-mode') : false;
    var loop = $this.data('loop') ? $this.data('loop') : true;
    var slidesDesktop = $this.data('slides-desktop') ? $this.data('slides-desktop') : 4;
    var slidesLaptop = $this.data('slides-laptop') ? $this.data('slides-laptop') : 4;
    var slidesTablet = $this.data('slides-tablet') ? $this.data('slides-tablet') : 3;
    var slidesSmall = $this.data('slides-small') ? $this.data('slides-small') : 3;
    var slidesMobile = $this.data('slides-mobile') ? $this.data('slides-mobile') : 2;
    var slidesXs = $this.data('slides-xs') ? $this.data('slides-xs') : 1.5;
    var spaceBetween = $this.data('space-between') ? $this.data('space-between'): 15;

    var swiper = new Swiper('.swiper-slider-' + index, {
      direction: 'horizontal',
      loop: loop,
      freeMode: freeMode,
      spaceBetween: spaceBetween,
        observer: true,
        observeParents: true,
      breakpoints: {
        1920: {
          slidesPerView: slidesDesktop
        },
        1200: {
          slidesPerView: slidesLaptop
        },
        992: {
          slidesPerView: slidesTablet
        },
        768: {
          slidesPerView: slidesSmall
        },
        576: {
           slidesPerView: slidesMobile,
           centeredSlides: true,
           centeredSlidesBounds: true,
        },
        0: {
           slidesPerView: slidesXs,
           centeredSlides: true,
           centeredSlidesBounds: true,
        }
      },
      navigation: {
        nextEl: '.slider-button-next',
        prevEl: '.slider-button-prev'
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
        dragSize: dragSize
      }
   });
});


/*=============================================
	=        Third Slider Active		      =
=============================================*/
function mainSlider() {
	$('.slider-active').slick({
		autoplay: false,
		autoplaySpeed: 10000,
		dots: false,
		fade: true,
		arrows: false,
		responsive: [
			{
                breakpoint: 767,
                settings: {
                    dots: false,
                    arrows: false
                }
            },
		]
	})
	.slickAnimation();
}


/*=============================================
	=        Trending Active		      =
=============================================*/
var trendSwiper = new Swiper('.trendingNft-active', {
    // Optional parameters
          observer: true,
        observeParents: true,
    loop: true,
    slidesPerView: 3,
    spaceBetween: 30,
    breakpoints: {
        '1500': {
            slidesPerView: 3,
        },
        '1200': {
            slidesPerView: 3,
        },
        '992': {
            slidesPerView: 2,
        },
        '768': {
            slidesPerView: 2,
        },
        '576': {
            slidesPerView: 1,
        },
        '0': {
            slidesPerView: 1,
        },
    },
    // Navigation arrows
    navigation: {
        nextEl: ".slider-button-next",
        prevEl: ".slider-button-prev",
    },
});


/*=============================================
	=        Streamers Active		      =
=============================================*/
var streamersSwiper = new Swiper('.streamers-active', {
    // Optional parameters
          observer: true,
        observeParents: true,
    loop: true,
    slidesPerView: 5,
    spaceBetween: 20,
    breakpoints: {
        '1500': {
            slidesPerView: 5,
        },
        '1200': {
            slidesPerView: 4,
        },
        '992': {
            slidesPerView: 4,
        },
        '768': {
            slidesPerView: 3,
        },
        '576': {
            slidesPerView: 2,
        },
        '0': {
            slidesPerView: 1.5,
            centeredSlides: true,
            centeredSlidesBounds: true,
        },
    },
    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    // Navigation arrows
    navigation: {
        nextEl: ".slider-button-next",
        prevEl: ".slider-button-prev",
    },
});


/*=============================================
	=    		Brand Active		      =
=============================================*/
$('.brand-active').slick({
	dots: false,
	infinite: true,
	speed: 500,
	autoplay: true,
	arrows: false,
	slidesToShow: 6,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=        Intersection Observer         =
=============================================*/
if (!!window.IntersectionObserver) {
let observer = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
	if (entry.isIntersecting) {
		entry.target.classList.add("active-footer");
		//entry.target.src = entry.target.dataset.src;
		observer.unobserve(entry.target);
	}});
}, {
	rootMargin: "0px 0px -100px 0px"
});
    document.querySelectorAll('.has-footer-animation').forEach(block => {
        observer.observe(block)
    });
} else {
    document.querySelectorAll('.has-footer-animation').forEach(block => {
        block.classList.remove('has-footer-animation')
    });
}


/*=============================================
	=           Brand effect         =
=============================================*/
var democol = $('.brand-active .col, .slider__brand-list li');
democol.on({
	mouseenter: function () {
		$(this).siblings().stop().fadeTo(300, 0.3);
	},
	mouseleave: function () {
		$(this).siblings().stop().fadeTo(300, 1);
	}
});


/*==================================
          Button Icon Draw
====================================*/
var $svgIconBox = $('.tg-svg');
$svgIconBox.each(function() {
    var $this = $(this),
        $svgIcon = $this.find('.svg-icon'),
        $id = $svgIcon.attr('id'),
        $icon = $svgIcon.data('svg-icon');
    var $vivus = new Vivus($id, { duration: 180, file: $icon });
    $this.on('mouseenter', function () {
        $vivus.reset().play();
    });
});


/*=============================================
	=        parallaxMouse Active          =
=============================================*/
function parallaxMouse() {
	if ($('.parallax').length) {
		var scene = document.querySelectorAll('.parallax');
		for (var i = 0; i < scene.length; i++) {
			var parallaxInstance = new Parallax(scene[i], {
				relativeInput: true,
				hoverOnly: true,
				selector: '.tg-layer',
				pointerEvents: true,
			});
		}
	};
};
parallaxMouse();


/*=============================================
	=    		Odometer Active  	       =
=============================================*/
$('.odometer').appear(function (e) {
	var odo = $(".odometer");
	odo.each(function () {
		var countNumber = $(this).attr("data-count");
		$(this).html(countNumber);
	});
});


/*=============================================
	=    		Magnific Popup		      =
=============================================*/
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
		enabled: true
	},
    zoom: {
        enabled: false,
        duration: 300, // don't foget to change the duration also in CSS
        opener: function(element) {
            return element.find('img');
        }
    }
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


/*=============================================
	=          Jarallax Active         =
=============================================*/
$('.tg-jarallax').jarallax({
    speed: 0.2,
});


/*=============================================
	=    	  Countdown Active  	         =
=============================================*/
$('[data-countdown]').each(function () {
	var $this = $(this), finalDate = $(this).data('countdown');
	$this.countdown(finalDate, function (event) {
		$this.html(event.strftime('<div class="time-count day"><span>%D</span>Day</div><div class="time-count hour"><span>%H</span>hour</div><div class="time-count min"><span>%M</span>min</div><div class="time-count sec"><span>%S</span>sec</div>'));
	});
});


/*=============================================
	=          Parallax Active         =
=============================================*/
(function () {
  var parallax = $('.tg-parallax');

  if (parallax.length) {
    parallax.each(function () {
      var _this = $(this),
        scale = _this.data('scale'),
        orientation = _this.data('orientation');

      new simpleParallax(_this[0], {
        scale: scale,
        orientation: orientation,
        delay: 1,
        overflow: true,
        transition: 'cubic-bezier(0,0,0,1)'
      });
    });
  }
})();


/*=============================================
	=    	 Slider Range Active  	         =
=============================================*/
$("#slider-range").slider({
	range: true,
	min: 10,
	max: 500,
	values: [80, 380],
	slide: function (event, ui) {
		$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
	}
});
$("#amount").val("$" + $("#slider-range").slider("values", 0) + " - $" + $("#slider-range").slider("values", 1));


/*===========================================
     =           Cart Active            =
=============================================*/
$('.qtybutton-box span').on("click", function () {
	var $input = $(this).parents('.num-block').find('input.in-num');
	if ($(this).hasClass('minus')) {
		var count = parseFloat($input.val()) - 1;
		count = count < 1 ? 1 : count;
		if (count < 2) {
			$(this).addClass('dis');
		}
		else {
			$(this).removeClass('dis');
		}
		$input.val(count);
	}
	else {
		var count = parseFloat($input.val()) + 1
		$input.val(count);
		if (count > 1) {
			$(this).parents('.num-block').find(('.minus')).removeClass('dis');
		}
	}
	$input.change();
	return false;
});

/*===========================================
    =          Click to Active        =
=============================================*/
$('.shop__details-model li').on('click', function (event) {
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
	event.preventDefault();
});


/*===========================================
	=        servicesTab Active         =
=============================================*/
$('.services__wrapper .services__item').on('mouseover', function(){
    var li = $(this),
    ul = li.parent(),
    wrap = li.closest('.services-row'),
    tab_content = $('.services__images', wrap),
    current_index = li.index();
    ul.find('.services__item').removeClass('active');
    li.addClass('active');
    tab_content.find( ".services__images-item" ).removeClass('active').eq( current_index ).addClass('active');

}).on('mouseout', function(){
    var li = $(this);
    var li = $(this),
    ul = li.parent(),
    wrap = li.closest('.services-row'),
    tab_content = $('.services__images', wrap),
    current_index = li.index();
    if(ul.find('.active').length > 1){
        li.removeClass('active');
    }
    if(tab_content.find('.tab-pan.active').length > 1){
        tab_content.find( ".services__images-item" ).eq( current_index ).removeClass('active');
    }
});


/*===========================================
	=        FaqTab Active         =
=============================================*/
$('.faq__wrapper .accordion-item').on('click', function(){
    var li = $(this),
    ul = li.parent(),
    wrap = li.closest('.faq-rows'),
    tab_content = $('.services__images', wrap),
    current_index = li.index();
    ul.find('.services__item').removeClass('active');
    li.addClass('active');
    tab_content.find( ".services__images-item" ).removeClass('active').eq( current_index ).addClass('active');

}).on('mouseout', function(){
    var li = $(this);
    var li = $(this),
    ul = li.parent(),
    wrap = li.closest('.faq-rows'),
    tab_content = $('.services__images', wrap),
    current_index = li.index();
    if(ul.find('.active').length > 1){
        li.removeClass('active');
    }
    if(tab_content.find('.tab-pan.active').length > 1){
        tab_content.find( ".services__images-item" ).eq( current_index ).removeClass('active');
    }
});


/*===========================================
	=          SplitText Active         =
=============================================*/
function splitText() {
    $(".tg__animate-text").each(function () {
        var a = $(this),
            d = a.text().split(""),
            c = a.data("wait");
        c || (c = 0);
        var b = a.data("speed");
        b || (b = 4),
        (b /= 100),
        a.html("<em>321...</em>").addClass("ready"),
        a.waypoint({
            handler: function () {
                a.hasClass("stop") ||
                (a.addClass("stop"),
                setTimeout(function () {
                    a.text(""),
                        $.each(d, function (d, e) {
                            var c = document.createElement("span");
                            (c.textContent = e), (c.style.animationDelay = d * b + "s"), a.append(c);
                        });
                }, c));
            },
            offset: "90%",
        });
    });
};
if($(window).width()<768){
    $(".roadMap__list li").addClass('mobileView').removeClass('tg__animate-text');
}


/*=============================================
	=          GSAP Active         =
=============================================*/
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.config({
    nullTargetWarn: false,
    trialWarn: false
});

function tg_title_animation() {

    var tg_var = jQuery('.tg__heading-wrapper');
    if (!tg_var.length) {
        return;
    }
    const quotes = document.querySelectorAll(".tg__heading-wrapper .tg-element-title");

    quotes.forEach(quote => {

        //Reset if needed
        if (quote.animation) {
            quote.animation.progress(1).kill();
            quote.split.revert();
        }

        var getclass = quote.closest('.tg__heading-wrapper').className;
        var animation = getclass.split('animation-');
        if (animation[1] == "style4") return

        quote.split = new SplitText(quote, {
            type: "lines,words,chars",
            linesClass: "split-line"
        });
        gsap.set(quote, { perspective: 400 });

        if (animation[1] == "style1") {
            gsap.set(quote.split.chars, {
                opacity: 0,
                y: "90%",
                rotateX: "-40deg"
            });
        }
        if (animation[1] == "style2") {
            gsap.set(quote.split.chars, {
                opacity: 0,
                x: "50"
            });
        }
        if (animation[1] == "style3") {
            gsap.set(quote.split.chars, {
                opacity: 0,
            });
        }
        quote.animation = gsap.to(quote.split.chars, {
            scrollTrigger: {
                trigger: quote,
                start: "top 90%",
            },
            x: "0",
            y: "0",
            rotateX: "0",
            opacity: 1,
            duration: 1,
            ease: Back.easeOut,
            stagger: .02
        });
    });
}
ScrollTrigger.addEventListener("refresh", tg_title_animation);


/*=============================================
	=    		 Wow Active  	         =
=============================================*/
function wowAnimation() {
	var wow = new WOW({
		boxClass: 'wow',
		animateClass: 'animated',
		offset: 0,
		mobile: false,
		live: true
	});
	wow.init();
}


})(jQuery);