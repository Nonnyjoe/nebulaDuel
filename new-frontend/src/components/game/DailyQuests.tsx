interface Quest {
  id: string;
  title: string;
  desc: string;
  reward: string;
  progress: number; // 0-100
  done?: boolean;
}

const QUESTS: Quest[] = [
  { id: "q1", title: "First Strike",   desc: "Win 1 duel today",                 reward: "+40 pts",       progress: 100, done: true },
  { id: "q2", title: "Element Triad",  desc: "Field 3 unique elements in a squad", reward: "+80 pts",     progress: 66 },
  { id: "q3", title: "Storm Hunter",   desc: "KO a Storm-element enemy",          reward: "+120 pts · 1 CTSI", progress: 30 },
  { id: "q4", title: "Campaign Push",  desc: "Clear a campaign level",            reward: "+160 pts",     progress: 0 },
];

export function DailyQuests() {
  const cleared = QUESTS.filter((q) => q.done).length;
  return (
    <div className="glass-panel clip-bevel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">// DAILY OPS</div>
          <h2 className="font-display text-2xl italic uppercase tracking-tight">Today&apos;s Quests</h2>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-primary text-glow">{cleared}/{QUESTS.length}</div>
          <div className="font-mono-display text-[9px] text-muted-foreground uppercase tracking-widest">cleared</div>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {QUESTS.map((q) => (
          <div key={q.id} className={`p-3 bg-panel-2/50 border-l-2 ${q.done ? "border-primary" : "border-primary/30"}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-display text-sm uppercase tracking-tight truncate">{q.title}</span>
              <span className={`font-mono-display text-[9px] uppercase tracking-widest ${q.done ? "text-primary" : "text-muted-foreground"}`}>
                {q.reward}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mb-2">{q.desc}</div>
            <div className="h-1 bg-panel clip-stat overflow-hidden">
              <div
                className={`h-full ${q.done ? "bg-primary glow-cyan-sm" : "bg-primary/60"}`}
                style={{ width: `${q.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] font-mono-display text-muted-foreground uppercase tracking-widest text-center">
        Resets in 04:12:47 · Streak day 7
      </div>
    </div>
  );
}
