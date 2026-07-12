import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "nebula:onboarded:v1";

const STEPS = [
  {
    eyebrow: "// 01 · RECRUIT",
    title: "Forge Your Roster",
    body: "Every warrior carries an element, signature move and rarity. Stronger and rarer warriors hit harder and unlock new tactics.",
    cta: "Open Market",
    to: "/market" as const,
  },
  {
    eyebrow: "// 02 · ASSEMBLE",
    title: "Three Warriors. One Squad.",
    body: "Pick three warriors and a targeting doctrine — Executioner, Assassin, Duelist or Opportunist. Your call shapes every turn.",
    cta: "Build a Squad",
    to: "/create-duel" as const,
  },
  {
    eyebrow: "// 03 · RESOLVE",
    title: "Verifiable, Cinematic Combat",
    body: "Battles play out in a deterministic rollup — replayable in 3D, settled on-chain. Win to claim the pot. Learn either way.",
    cta: "Enter Arena",
    to: "/campaign" as const,
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  if (!open) return null;
  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4 bg-background/80 backdrop-blur-sm animate-fade-up">
      <div className="relative w-full max-w-lg glass-panel clip-bevel p-8 border border-primary/40 glow-cyan-sm">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
        <div className="absolute top-3 right-3 z-10">
          <button onClick={close} aria-label="Skip" className="text-[10px] font-mono-display text-muted-foreground hover:text-foreground uppercase tracking-widest">Skip ✕</button>
        </div>

        <div className="relative">
          <div className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase mb-2">{s.eyebrow}</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase italic tracking-tight mb-4 text-glow">{s.title}</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-8">{s.body}</p>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 transition-all ${i === step ? "w-8 bg-primary glow-cyan-sm" : "w-4 bg-foreground/15"}`}
                />
              ))}
            </div>
            <span className="font-mono-display text-[10px] uppercase tracking-widest text-muted-foreground">
              {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-3 border border-foreground/15 font-display uppercase text-sm tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/40 clip-chrome-sm">
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(x => x + 1)} className="ml-auto px-6 py-3 bg-primary text-primary-foreground font-display uppercase text-sm tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm">
                Next →
              </button>
            ) : (
              <Link to={s.to} onClick={close} className="ml-auto px-6 py-3 bg-primary text-primary-foreground font-display uppercase text-sm tracking-widest clip-chrome-sm hover:brightness-110 glow-cyan-sm">
                {s.cta} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
