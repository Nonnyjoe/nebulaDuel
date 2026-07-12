import type { Element } from "@/lib/game-data";
import { ELEMENT_TOKEN } from "@/lib/game-data";

const ICONS: Record<Element, string> = {
  Fire: "▲",
  Water: "◆",
  Nature: "✦",
  Storm: "⚡",
  Psychic: "◉",
  Shadow: "◐",
  Neutral: "○",
};

export function ElementBadge({ element, size = "sm" }: { element: Element; size?: "sm" | "md" }) {
  const token = ELEMENT_TOKEN[element];
  const sizeCls = size === "md" ? "text-xs px-2.5 py-1" : "text-[9px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 font-display italic uppercase tracking-wider ${sizeCls}`}
      style={{ background: `var(--color-${token})`, color: "var(--background)" }}
    >
      <span className="not-italic">{ICONS[element]}</span>
      {element}
    </span>
  );
}
