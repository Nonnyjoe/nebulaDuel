import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { GameLayout } from "@/components/game/GameLayout";
import { WarriorCard } from "@/components/game/WarriorCard";
import { ElementBadge } from "@/components/game/ElementBadge";
import { EventFeed } from "@/components/game/EventFeed";
import { DailyQuests } from "@/components/game/DailyQuests";
import { DailyReward } from "@/components/game/DailyReward";
import { WARRIORS } from "@/lib/game-data";
import { useAvailableDuels, useAllDuels, usePvpLeaderboard, usePlayerNames } from "@/hooks/game";
import { isAiDuel } from "@/lib/cartesi/duels";
import heroImg from "@/assets/hero-warrior.jpg";
import squadBg from "@/assets/squad-bg.jpg";

const ZERO = "0x0000000000000000000000000000000000000000";
const short = (a?: string) => (!a || a === ZERO ? "Open" : `${a.slice(0, 5)}…${a.slice(-2)}`);

export default function Home() {
  useDocumentTitle("Nebula Duel — Enter the Arena");
  const featured = WARRIORS.slice(0, 4);
  const available = useAvailableDuels();
  const all = useAllDuels();
  const { data: ranks } = usePvpLeaderboard();
  const { nameFor } = usePlayerNames();

  const liveDuels = [...(available.data ?? []), ...(all.data ?? []).filter((d) => d.is_completed)]
    .slice(0, 4)
    .map((d) => ({
      id: d.id,
      player1: nameFor(d.duel_creator) || short(d.duel_creator),
      player2: isAiDuel(d) ? "Nebula AI" : nameFor(d.duel_opponent) || short(d.duel_opponent),
      stake: d.has_staked ? d.stake_amount : 0,
      status: d.is_completed ? "finished" : !d.duel_opponent || d.duel_opponent === ZERO ? "pending" : "live",
    }));

  const topGamers = (ranks ?? []).slice(0, 5).map((r) => ({
    rank: r.rank,
    handle: r.monika || short(r.wallet_address),
    address: `${r.wallet_address.slice(0, 6)}…${r.wallet_address.slice(-4)}`,
    points: r.rating,
    wins: r.total_wins,
  }));
  return (
    <GameLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={squadBg} alt="" className="size-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="size-2 rounded-full bg-destructive animate-pulse-glow" />
              <span className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">LIVE · ACT II ENGAGED</span>
            </div>
            <h1 className="font-display text-6xl md:text-8xl tracking-tighter italic uppercase leading-[0.85] mb-6">
              Three Warriors.<br />
              <span className="text-primary text-glow">One Strategy.</span><br />
              Verifiable Victory.
            </h1>
            <p className="max-w-[52ch] text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
              An on-chain auto-battler resolved inside a deterministic rollup. Assemble a squad of three,
              choose how they hunt, and watch the machine decide who walks home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/create-duel"
                className="group relative px-10 py-4 bg-primary text-primary-foreground font-display text-lg uppercase tracking-widest italic clip-chrome-sm hover:brightness-110 hover:scale-[1.02] active:scale-95 transition-all glow-cyan-sm"
              >
                Initiate Duel
                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/campaign"
                className="px-10 py-4 border border-primary/40 text-primary font-display text-lg uppercase tracking-widest italic clip-chrome-sm hover:bg-primary/10 transition-all"
              >
                Enter Campaign
              </Link>
            </div>

            {/* live stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
              {[
                { label: "Active Duels", value: "1,284" },
                { label: "Warriors Forged", value: "9,712" },
                { label: "Total Staked", value: "48.2K" },
              ].map((s) => (
                <div key={s.label} className="glass-panel clip-chrome-sm p-3">
                  <div className="text-[9px] font-mono-display text-muted-foreground uppercase tracking-widest">{s.label}</div>
                  <div className="font-display text-2xl text-primary text-glow">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative aspect-[4/5] glass-panel clip-bevel p-2 glow-cyan">
              <img src={heroImg} alt="Featured warrior" className="size-full object-cover" width={1024} height={1280} />
              <div className="absolute inset-2 scanline opacity-50 pointer-events-none" />
              {/* corner brackets */}
              <span className="absolute top-3 left-3 size-6 border-t-2 border-l-2 border-primary" />
              <span className="absolute top-3 right-3 size-6 border-t-2 border-r-2 border-primary" />
              <span className="absolute bottom-3 left-3 size-6 border-b-2 border-l-2 border-primary" />
              <span className="absolute bottom-3 right-3 size-6 border-b-2 border-r-2 border-primary" />

              {/* spec card */}
              <div className="absolute left-4 bottom-4 right-4 glass-hud clip-chrome p-4 border-l-2 border-primary">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[9px] font-mono-display text-primary/70 uppercase tracking-widest">Featured · Legendary</div>
                    <div className="font-display text-2xl tracking-tight uppercase">Archon Ray</div>
                  </div>
                  <ElementBadge element="Storm" />
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono-display text-[10px] mt-3">
                  <div><div className="text-muted-foreground">HP</div><div className="text-foreground">92</div></div>
                  <div><div className="text-muted-foreground">ATK</div><div className="text-foreground">18</div></div>
                  <div><div className="text-muted-foreground">STR</div><div className="text-foreground">14</div></div>
                  <div><div className="text-muted-foreground">SPD</div><div className="text-primary">16</div></div>
                </div>
              </div>
            </div>
            {/* floating callouts */}
            <div className="hidden lg:block absolute -left-10 top-12 glass-hud clip-chrome-sm px-3 py-2 animate-float">
              <div className="text-[9px] font-mono-display text-primary uppercase">+180% STRIKE</div>
              <div className="text-[10px] text-muted-foreground">Thunderclap power</div>
            </div>
            <div className="hidden lg:block absolute -right-6 bottom-32 glass-hud clip-chrome-sm px-3 py-2 animate-float [animation-delay:1s]">
              <div className="text-[9px] font-mono-display text-storm uppercase">STORM ELEMENT</div>
              <div className="text-[10px] text-muted-foreground">Beats Psychic · Water</div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DUELS + LEADERBOARD */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div className="glass-panel clip-chrome p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-destructive animate-pulse-glow" />
                <span className="font-mono-display text-[10px] tracking-[0.25em] text-destructive uppercase">Now Broadcasting</span>
              </div>
              <h2 className="font-display text-3xl italic uppercase tracking-tight">Live Duels</h2>
            </div>
            <Link to="/duels" className="text-[11px] font-mono-display text-primary hover:text-glow uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-2">
            {liveDuels.length === 0 ? (
              <div className="px-4 py-8 text-center font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
                No duels broadcasting — be the first to <Link to="/create-duel" className="text-primary">create one</Link>.
              </div>
            ) : liveDuels.map((d) => (
              <div key={d.id} className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-4 items-center px-4 py-3 bg-panel-2/50 border border-primary/5 hover:border-primary/30 transition-colors font-mono-display text-xs">
                <span className={`size-2 rounded-full ${d.status === "live" ? "bg-destructive animate-pulse-glow" : d.status === "pending" ? "bg-storm" : "bg-muted-foreground"}`} />
                <span className="text-foreground">{d.player1}</span>
                <span className="text-primary font-display italic text-base">VS</span>
                <span className="text-foreground">{d.player2}</span>
                <span className="text-primary text-glow">{d.stake ? `${d.stake} CTSI` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel clip-chrome p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono-display text-[10px] tracking-[0.25em] text-primary uppercase">Hall of Champions</span>
              <h2 className="font-display text-3xl italic uppercase tracking-tight mt-1">Top Gamers</h2>
            </div>
          </div>
          <div className="space-y-2">
            {topGamers.length === 0 ? (
              <div className="px-3 py-8 text-center font-mono-display text-[11px] uppercase tracking-widest text-muted-foreground">
                No champions ranked yet.
              </div>
            ) : topGamers.map((g) => (
              <div key={g.rank} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center px-3 py-3 bg-panel-2/50 border-l-2" style={{ borderColor: g.rank === 1 ? "var(--color-legendary)" : g.rank === 2 ? "var(--color-epic)" : g.rank === 3 ? "var(--color-rare)" : "transparent" }}>
                <span className="font-display text-xl text-primary w-6">{String(g.rank).padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="font-display text-sm tracking-tight uppercase truncate">{g.handle}</div>
                  <div className="font-mono-display text-[10px] text-muted-foreground truncate">{g.address}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-base text-primary text-glow">{g.points.toLocaleString()}</div>
                  <div className="font-mono-display text-[9px] text-muted-foreground uppercase">{g.wins}W</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY REWARD */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-8 pt-4">
        <DailyReward />
      </section>

      {/* DAILY OPS + LIVE FEED */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-8 py-4 grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <DailyQuests />
        <EventFeed />
      </section>

      {/* FEATURED ROSTER */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono-display text-[10px] tracking-[0.25em] text-primary uppercase mb-2">Featured Roster</div>
            <h2 className="font-display text-4xl md:text-5xl italic uppercase tracking-tight">New Drops · This Cycle</h2>
          </div>
          <Link to="/market" className="hidden md:block text-[11px] font-mono-display text-primary hover:text-glow uppercase tracking-widest">Open Market →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((w, i) => (
            <div key={w.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <WarriorCard warrior={w} />
            </div>
          ))}
        </div>
      </section>

      {/* COMBAT LOOP */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-8 py-20">
        <div className="glass-panel clip-bevel p-8 md:p-12">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10">
            <div>
              <div className="font-mono-display text-[10px] tracking-[0.25em] text-primary uppercase mb-2">// PROTOCOL</div>
              <h2 className="font-display text-4xl md:text-5xl italic uppercase tracking-tight">The Loop</h2>
              <p className="text-sm text-muted-foreground mt-4">Strategy in. Simulation out. Result verifiable by anyone.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { n: "01", t: "Recruit", d: "Forge or buy warriors. Each has an element, super power, and rarity." },
                { n: "02", t: "Assemble", d: "Pick three for your squad. Element triangles & speed shape the fight." },
                { n: "03", t: "Strategize", d: "Choose how your team hunts: Executioner, Assassin, Duelist, Opportunist." },
                { n: "04", t: "Resolve", d: "Cartesi Rollups simulates the duel deterministically. Replay in 3D." },
              ].map((s) => (
                <div key={s.n} className="bg-panel-2/40 border-l-2 border-primary/40 p-4 hover:border-primary transition-colors">
                  <div className="font-mono-display text-xs text-primary mb-1">{s.n}</div>
                  <div className="font-display text-xl uppercase tracking-tight mb-1">{s.t}</div>
                  <div className="text-xs text-muted-foreground">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </GameLayout>
  );
}
