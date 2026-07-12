import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  accent,
  blurb,
  right,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  blurb?: string;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 mb-10 animate-fade-up">
      <div className="min-w-0">
        {eyebrow && (
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-primary/60" />
            <span className="font-mono-display text-[10px] tracking-[0.3em] text-primary uppercase">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-display text-4xl md:text-6xl tracking-tight italic uppercase leading-none">
          {title}{accent && <span className="text-primary text-glow ml-3">{accent}</span>}
        </h1>
        {blurb && <p className="mt-4 max-w-[60ch] text-sm text-muted-foreground font-mono-display tracking-tight">{blurb}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
