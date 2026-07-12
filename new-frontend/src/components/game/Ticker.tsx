const ITEMS = [
  "SYSTEM STATUS · OPTIMAL",
  "NEBULA SECTOR 7 UNLOCKED",
  "DUEL #4912 RESOLVED · WINNER 0x71C...8E24 +24 CTSI",
  "NEW WARRIOR DROP · VESPERA DUSK · LEGENDARY",
  "AI DIFFICULTY · HARD ENABLED",
  "CAMPAIGN ACT II LIVE",
  "TOP STREAK · ARCHON · 14W",
];

export function Ticker() {
  const line = ITEMS.join("  //  ") + "  //  ";
  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 py-1.5 overflow-hidden whitespace-nowrap relative">
      <div className="inline-block animate-ticker font-mono-display text-[10px] tracking-[0.2em] text-primary uppercase">
        <span className="mr-12">{line}</span>
        <span className="mr-12">{line}</span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
