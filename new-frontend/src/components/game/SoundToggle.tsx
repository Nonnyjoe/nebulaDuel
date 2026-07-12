import { useEffect, useState } from "react";
import { audio, playSfx } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMuted] = useState(audio.muted);
  const [vol, setVol] = useState(audio.volume);

  useEffect(() => { audio.unlock(); }, []);

  return (
    <div className="flex items-center gap-2 px-2 py-1 glass-hud clip-chrome-sm">
      <button
        type="button"
        onClick={() => {
          audio.unlock();
          const next = !muted;
          audio.setMuted(next);
          setMuted(next);
          if (!next) playSfx("ui");
        }}
        aria-label={muted ? "Unmute" : "Mute"}
        className="size-7 grid place-items-center text-primary hover:text-primary-foreground hover:bg-primary/20 transition-colors"
      >
        <span className="font-mono-display text-xs">{muted ? "✕" : "♪"}</span>
      </button>
      <input
        type="range" min={0} max={100} value={Math.round(vol * 100)}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          audio.setVolume(v); setVol(v);
          if (muted) { audio.setMuted(false); setMuted(false); }
        }}
        className="w-16 h-1 accent-primary"
        aria-label="Volume"
      />
    </div>
  );
}
