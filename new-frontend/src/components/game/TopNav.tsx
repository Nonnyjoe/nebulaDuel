import { Link, useLocation } from "react-router-dom";
import { WalletHUD } from "./WalletHUD";
import { SoundToggle } from "./SoundToggle";

const LINKS = [
  { to: "/", label: "01_Home" },
  { to: "/campaign", label: "02_Campaign" },
  { to: "/duels", label: "03_Duels" },
  { to: "/market", label: "04_Market" },
  { to: "/codex", label: "05_Codex" },
  { to: "/leaderboard", label: "06_Ranks" },
  { to: "/profile", label: "07_Profile" },
] as const;

export function TopNav() {
  const path = useLocation().pathname;
  return (
    <nav className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-primary/10 bg-panel/60 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4 md:gap-12 min-w-0">
        <Link to="/" className="flex items-center gap-2 font-display text-xl md:text-2xl tracking-tight text-primary text-glow shrink-0">
          <span className="grid size-6 place-items-center bg-primary rotate-45">
            <span className="size-2 bg-background -rotate-45" />
          </span>
          NEBULA DUEL
        </Link>
        <div className="hidden md:flex gap-7 font-mono-display text-[11px] tracking-tight">
          {LINKS.map((l) => {
            const active = l.to === "/" ? path === "/" : path.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  active
                    ? "text-primary border-b border-primary pb-1 text-glow"
                    : "text-muted-foreground hover:text-foreground transition-colors pb-1 border-b border-transparent"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SoundToggle />
        <WalletHUD />
      </div>
    </nav>
  );
}
