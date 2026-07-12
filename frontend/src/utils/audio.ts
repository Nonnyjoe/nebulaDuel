/**
 * NebulaDuel audio engine — 100% synthesized with the Web Audio API.
 * No asset downloads, no licensing, instant load.
 *
 * - Music: per-biome ambient loops (layered oscillators + slow LFO swells)
 * - SFX: elemental power casts, hits, crits, KO, victory/defeat stingers
 * - Master mute + volume persisted in localStorage
 */

type SfxName =
  | "hit"
  | "crit"
  | "ko"
  | "dodge"
  | "burn"
  | "stun"
  | "heal"
  | "shield"
  | "victory"
  | "defeat"
  | "click"
  | "round"
  | "power_Storm"
  | "power_Fire"
  | "power_Nature"
  | "power_Water"
  | "power_Psychic"
  | "power_Shadow"
  | "power_Neutral";

export type BiomeName =
  | "VerdantWilds"
  | "VolcanicForge"
  | "AbyssalDepths"
  | "StormSpire"
  | "AstralPlane"
  | "VoidNexus";

const STORAGE_KEY = "nebula_audio";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicNodes: AudioNode[] = [];
  private musicTimer: number | null = null;
  private currentBiome: BiomeName | null = null;

  muted: boolean;
  volume: number;

  constructor() {
    let saved: { muted?: boolean; volume?: number } = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      /* ignore */
    }
    this.muted = saved.muted ?? false;
    this.volume = saved.volume ?? 0.6;
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.35;
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.9;
      this.sfxBus.connect(this.master);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ muted: this.muted, volume: this.volume }),
      );
    } catch {
      /* ignore */
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : this.volume,
        this.ctx.currentTime,
        0.05,
      );
    }
    this.persist();
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx && !this.muted) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.persist();
  }

  // -------------------------------------------------------------------------
  // Music
  // -------------------------------------------------------------------------

  /** Biome moods: root frequency, scale intervals (semitones), tempo feel. */
  private biomeMood(biome: BiomeName): {
    root: number;
    chord: number[];
    pulse: number;
    bright: number;
  } {
    switch (biome) {
      case "VerdantWilds":
        return { root: 196.0, chord: [0, 7, 12, 16], pulse: 2.2, bright: 900 };
      case "VolcanicForge":
        return { root: 110.0, chord: [0, 5, 7, 10], pulse: 1.4, bright: 600 };
      case "AbyssalDepths":
        return { root: 146.8, chord: [0, 3, 7, 12], pulse: 2.8, bright: 500 };
      case "StormSpire":
        return { root: 164.8, chord: [0, 5, 10, 14], pulse: 1.1, bright: 1200 };
      case "AstralPlane":
        return { root: 220.0, chord: [0, 4, 9, 14], pulse: 3.2, bright: 1500 };
      case "VoidNexus":
        return { root: 98.0, chord: [0, 1, 6, 12], pulse: 2.0, bright: 400 };
    }
  }

  startMusic(biome: BiomeName) {
    const ctx = this.ensureContext();
    if (!ctx || !this.musicBus) return;
    if (this.currentBiome === biome && this.musicNodes.length) return;
    this.stopMusic();
    this.currentBiome = biome;

    const mood = this.biomeMood(biome);
    const semitone = (n: number) => mood.root * Math.pow(2, n / 12);

    // Pad: detuned saw pair through a lowpass, slow LFO on filter.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = mood.bright;
    filter.Q.value = 0.8;
    filter.connect(this.musicBus);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 1 / (mood.pulse * 4);
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = mood.bright * 0.45;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    const padGain = ctx.createGain();
    padGain.gain.value = 0;
    padGain.gain.setTargetAtTime(0.16, ctx.currentTime, 2.0); // slow fade-in
    padGain.connect(filter);

    mood.chord.forEach((interval, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = semitone(interval) / 2;
      osc.detune.value = i * 4 - 6;
      const g = ctx.createGain();
      g.gain.value = 0.25;
      osc.connect(g);
      g.connect(padGain);
      osc.start();
      this.musicNodes.push(osc, g);
    });
    this.musicNodes.push(filter, lfo, lfoGain, padGain);

    // Sub-bass heartbeat.
    const beat = () => {
      if (!this.ctx || this.currentBiome !== biome) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(mood.root / 2, t);
      osc.frequency.exponentialRampToValueAtTime(mood.root / 4, t + 0.3);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.32, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(g);
      g.connect(this.musicBus!);
      osc.start(t);
      osc.stop(t + 0.6);
    };
    beat();
    this.musicTimer = window.setInterval(beat, mood.pulse * 1000);
  }

  stopMusic() {
    if (this.musicTimer != null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    for (const node of this.musicNodes) {
      try {
        if (node instanceof OscillatorNode) node.stop();
        node.disconnect();
      } catch {
        /* already stopped */
      }
    }
    this.musicNodes = [];
    this.currentBiome = null;
  }

  // -------------------------------------------------------------------------
  // SFX
  // -------------------------------------------------------------------------

  private noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private blip(
    ctx: AudioContext,
    out: AudioNode,
    type: OscillatorType,
    f0: number,
    f1: number,
    dur: number,
    gain: number,
    when = 0,
  ) {
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, f0), t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private whoosh(
    ctx: AudioContext,
    out: AudioNode,
    fCenter: number,
    dur: number,
    gain: number,
    when = 0,
  ) {
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, dur + 0.1);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(fCenter / 3, t);
    filter.frequency.exponentialRampToValueAtTime(fCenter, t + dur * 0.6);
    filter.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(out);
    src.start(t);
    src.stop(t + dur + 0.1);
  }

  play(name: SfxName) {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxBus || this.muted) return;
    const out = this.sfxBus;

    switch (name) {
      case "click":
        this.blip(ctx, out, "square", 700, 500, 0.06, 0.18);
        break;
      case "round":
        this.blip(ctx, out, "triangle", 440, 660, 0.18, 0.25);
        this.blip(ctx, out, "triangle", 660, 880, 0.18, 0.2, 0.12);
        break;
      case "hit":
        this.whoosh(ctx, out, 800, 0.12, 0.5);
        this.blip(ctx, out, "square", 180, 60, 0.12, 0.45, 0.02);
        break;
      case "crit":
        this.whoosh(ctx, out, 1500, 0.16, 0.6);
        this.blip(ctx, out, "square", 320, 70, 0.2, 0.6, 0.02);
        this.blip(ctx, out, "sawtooth", 900, 200, 0.25, 0.3, 0.05);
        break;
      case "ko":
        this.blip(ctx, out, "sawtooth", 300, 40, 0.7, 0.55);
        this.whoosh(ctx, out, 300, 0.6, 0.4, 0.05);
        break;
      case "dodge":
        this.whoosh(ctx, out, 2200, 0.18, 0.35);
        break;
      case "burn":
        this.whoosh(ctx, out, 600, 0.35, 0.3);
        break;
      case "stun":
        this.blip(ctx, out, "sine", 1200, 400, 0.3, 0.3);
        this.blip(ctx, out, "sine", 900, 300, 0.3, 0.25, 0.1);
        break;
      case "heal":
        this.blip(ctx, out, "sine", 500, 1000, 0.3, 0.3);
        this.blip(ctx, out, "sine", 700, 1400, 0.3, 0.25, 0.12);
        break;
      case "shield":
        this.blip(ctx, out, "triangle", 250, 500, 0.25, 0.35);
        break;
      case "victory":
        [523, 659, 784, 1047].forEach((f, i) =>
          this.blip(ctx, out, "triangle", f, f, 0.3, 0.35, i * 0.16),
        );
        break;
      case "defeat":
        [392, 311, 262, 196].forEach((f, i) =>
          this.blip(ctx, out, "sawtooth", f, f * 0.97, 0.4, 0.3, i * 0.22),
        );
        break;
      case "power_Storm":
        this.blip(ctx, out, "sawtooth", 2000, 100, 0.3, 0.5);
        this.whoosh(ctx, out, 3000, 0.25, 0.45, 0.02);
        break;
      case "power_Fire":
        this.whoosh(ctx, out, 500, 0.5, 0.55);
        this.blip(ctx, out, "sawtooth", 150, 80, 0.4, 0.35, 0.05);
        break;
      case "power_Nature":
        this.whoosh(ctx, out, 1200, 0.4, 0.35);
        this.blip(ctx, out, "sine", 600, 900, 0.35, 0.3, 0.1);
        break;
      case "power_Water":
        this.whoosh(ctx, out, 900, 0.45, 0.45);
        this.blip(ctx, out, "sine", 300, 150, 0.4, 0.3, 0.08);
        break;
      case "power_Psychic":
        this.blip(ctx, out, "sine", 400, 1600, 0.5, 0.35);
        this.blip(ctx, out, "sine", 420, 1680, 0.5, 0.3, 0.04);
        break;
      case "power_Shadow":
        this.blip(ctx, out, "sawtooth", 200, 50, 0.5, 0.45);
        this.whoosh(ctx, out, 250, 0.5, 0.35, 0.05);
        break;
      case "power_Neutral":
        this.whoosh(ctx, out, 1000, 0.3, 0.4);
        this.blip(ctx, out, "square", 400, 200, 0.25, 0.3, 0.05);
        break;
    }
  }

  playPower(element: string) {
    const allowed = [
      "Storm",
      "Fire",
      "Nature",
      "Water",
      "Psychic",
      "Shadow",
      "Neutral",
    ];
    const el = allowed.includes(element) ? element : "Neutral";
    this.play(`power_${el}` as SfxName);
  }
}

/** Singleton — import and use anywhere. */
const audio = new AudioEngine();
export default audio;
