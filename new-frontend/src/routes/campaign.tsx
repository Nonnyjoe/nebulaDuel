import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { PageHeader } from "@/components/game/PageHeader";
import { ElementBadge } from "@/components/game/ElementBadge";
import { BIOME_THEMES } from "@/lib/cartesi/game-types";
import { useCampaignLevels, useCampaignProgress } from "@/hooks/game";
import { useWallet } from "@/hooks/useWallet";

export default function Campaign() {
  useDocumentTitle("Campaign — Nebula Duel");
  const { address } = useWallet();
  const { data: levels, isLoading } = useCampaignLevels();
  const { data: progress } = useCampaignProgress(address);

  const cleared = progress?.campaign_progress ?? 0;
  const wins = progress?.campaign_wins ?? 0;
  const total = levels?.length ?? 0;

  return (
    <GameLayout>
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <PageHeader
          eyebrow="The Nebula Gauntlet"
          title="The"
          accent="Campaign"
          blurb="Levels across six hostile realms. Every map favors an element — read the terrain, pick your warriors, and march on the Throne of Eternity."
          right={
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Cleared", v: `${String(cleared).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, c: "primary" },
                { l: "Victories", v: String(wins).padStart(2, "0"), c: "nature" },
                { l: "Rank", v: progress?.titles?.[0] ?? "Initiate", c: "legendary" },
              ].map((s) => (
                <div key={s.l} className="glass-panel clip-chrome-sm px-4 py-3 min-w-[110px]">
                  <div className="text-[9px] font-mono-display text-muted-foreground uppercase tracking-widest">{s.l}</div>
                  <div className="font-display text-lg" style={{ color: `var(--color-${s.c})` }}>{s.v}</div>
                </div>
              ))}
            </div>
          }
        />

        {isLoading ? (
          <div className="glass-panel clip-chrome p-12 grid place-items-center font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3" />
            Loading campaign…
          </div>
        ) : !levels?.length ? (
          <div className="glass-panel clip-chrome p-12 text-center font-mono-display text-xs uppercase tracking-widest text-muted-foreground">
            Campaign data unavailable — is the node running?
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent -translate-x-px" />
            <div className="space-y-6">
              {levels.map((lvl, i) => {
                const theme = BIOME_THEMES[lvl.biome];
                const status = lvl.id <= cleared ? "cleared" : lvl.id === cleared + 1 ? "current" : "locked";
                const isCurrent = status === "current";
                const isCleared = status === "cleared";
                const isLocked = status === "locked";
                const side = i % 2 === 0 ? "left" : "right";
                return (
                  <div key={lvl.id} className="grid md:grid-cols-2 gap-6 items-center animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`${side === "right" ? "md:order-2" : ""} relative flex items-center gap-4`}>
                      <div className={`size-20 grid place-items-center clip-hex shrink-0 ${
                        isCleared ? "bg-nature/20 border border-nature text-nature" :
                        isCurrent ? "bg-primary/20 border border-primary text-primary animate-pulse-glow glow-cyan-sm" :
                        "bg-panel-2 border border-foreground/10 text-muted-foreground"
                      }`}>
                        <span className="font-display text-2xl">{isCleared ? "✓" : String(lvl.id).padStart(2, "0")}</span>
                      </div>
                      <div className="md:hidden flex-1 min-w-0">
                        <div className="font-display text-lg uppercase truncate">{lvl.name}</div>
                        <div className="text-[10px] font-mono-display text-muted-foreground truncate">{theme.label}</div>
                      </div>
                    </div>

                    <div className={`${side === "right" ? "md:order-1 md:text-right" : ""}`}>
                      <div className={`glass-panel clip-chrome p-5 border-l-2 ${isCurrent ? "border-primary glow-cyan-sm" : isCleared ? "border-nature" : "border-foreground/10 opacity-70"}`}>
                        <div className={`flex flex-wrap items-baseline justify-between gap-2 mb-2 ${side === "right" ? "md:flex-row-reverse" : ""}`}>
                          <h3 className="font-display text-xl md:text-2xl uppercase tracking-tight">{lvl.name}{lvl.is_boss ? " ★" : ""}</h3>
                          <span className="font-mono-display text-[10px] text-primary uppercase">+{lvl.reward_points} pts</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{lvl.lore}</p>
                        <div className={`flex flex-wrap gap-2 mb-4 ${side === "right" ? "md:justify-end" : ""}`}>
                          <span className="text-[10px] font-mono-display text-muted-foreground bg-panel-2 px-2 py-1 uppercase">Boost</span>
                          <ElementBadge element={theme.boosted} />
                          <span className="text-[10px] font-mono-display text-muted-foreground bg-panel-2 px-2 py-1 uppercase ml-2">Dampen</span>
                          <ElementBadge element={theme.dampened} />
                        </div>
                        <div className={`flex items-center gap-3 ${side === "right" ? "md:justify-end" : ""}`}>
                          {(isCurrent || isCleared) && (
                            <Link to={`/create-duel?mode=campaign&level=${lvl.id}`} className={`px-5 py-2 font-display text-xs uppercase tracking-widest clip-chrome-sm transition ${isCurrent ? "bg-primary text-primary-foreground hover:brightness-110" : "border border-nature/40 text-nature hover:bg-nature/10"}`}>
                              {isCurrent ? "Engage →" : `Replay · ${lvl.retry_cost} pts`}
                            </Link>
                          )}
                          {isLocked && (
                            <span className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground">◐ Locked</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
