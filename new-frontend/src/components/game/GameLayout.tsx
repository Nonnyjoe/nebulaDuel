import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Ticker } from "./Ticker";
import { Onboarding } from "./Onboarding";
import { CreatePlayerDialog } from "./CreatePlayerDialog";

export function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ambient grid */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none [background:radial-gradient(800px_400px_at_20%_-10%,oklch(0.86_0.18_200/0.18),transparent),radial-gradient(600px_400px_at_90%_110%,oklch(0.72_0.27_320/0.12),transparent)]" />

      <Ticker />
      <TopNav />

      <main className="relative flex-1">{children}</main>

      <footer className="relative px-6 md:px-8 py-4 border-t border-primary/10 bg-panel/80 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto_1fr] gap-4 items-center text-[10px] font-mono-display text-muted-foreground uppercase tracking-widest">
          <div>NEBULA_DUEL · v3.0 · ROLLUPS_V2</div>
          <div className="hidden md:flex gap-6 justify-center">
            <a href="#" className="hover:text-primary transition-colors">Discord</a>
            <a href="#" className="hover:text-primary transition-colors">Docs</a>
            <a href="#" className="hover:text-primary transition-colors">Whitepaper</a>
          </div>
          <div className="text-right flex items-center gap-2 justify-end">
            <span className="size-1.5 rounded-full bg-nature animate-pulse-glow" />
            LATENCY · 24MS · STABLE
          </div>
        </div>
      </footer>

      <Onboarding />
      <CreatePlayerDialog />
    </div>
  );
}
