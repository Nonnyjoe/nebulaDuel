// Lightweight Web-Audio synth — no asset downloads, instant playback.
// Each move has a distinct timbre built from oscillators + noise + filters.

import type { SfxKind } from "./moves";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let volume = 0.5;

const LS_KEY = "nd.audio";

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const v = JSON.parse(raw);
      muted = !!v.muted;
      volume = typeof v.volume === "number" ? v.volume : 0.5;
    }
  } catch { /* noop */ }
}
load();

function save() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_KEY, JSON.stringify({ muted, volume })); } catch { /* noop */ }
}

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext =
      (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const audio = {
  unlock() { ensure(); },
  get muted() { return muted; },
  get volume() { return volume; },
  setMuted(v: boolean) {
    muted = v;
    if (master) master.gain.value = muted ? 0 : volume;
    save();
  },
  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v));
    if (master && !muted) master.gain.value = volume;
    save();
  },
};

function envOsc(opts: {
  freq: number; type?: OscillatorType; dur?: number;
  attack?: number; release?: number; gain?: number; sweepTo?: number;
}) {
  const c = ensure();
  if (!c || !master) return;
  const { freq, type = "sine", dur = 0.3, attack = 0.005, release = 0.15, gain = 0.3, sweepTo } = opts;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + attack + dur + release);
  osc.connect(g).connect(master);
  osc.start();
  osc.stop(c.currentTime + attack + dur + release + 0.05);
}

function noise(opts: { dur?: number; gain?: number; lp?: number; hp?: number } = {}) {
  const c = ensure();
  if (!c || !master) return;
  const { dur = 0.3, gain = 0.3, lp, hp } = opts;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.value = gain;
  let node: AudioNode = src;
  if (lp) {
    const f = c.createBiquadFilter();
    f.type = "lowpass"; f.frequency.value = lp;
    node.connect(f); node = f;
  }
  if (hp) {
    const f = c.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = hp;
    node.connect(f); node = f;
  }
  node.connect(g).connect(master);
  src.start();
}

export function playSfx(kind: SfxKind) {
  if (muted) return;
  switch (kind) {
    case "thunder":
      noise({ dur: 0.4, gain: 0.5, hp: 1200 });
      envOsc({ freq: 220, type: "sawtooth", dur: 0.2, sweepTo: 60, gain: 0.4 });
      break;
    case "fire":
      noise({ dur: 0.5, gain: 0.35, lp: 1800, hp: 300 });
      envOsc({ freq: 110, type: "sawtooth", dur: 0.3, sweepTo: 60, gain: 0.18 });
      break;
    case "vine":
      envOsc({ freq: 600, type: "triangle", dur: 0.15, sweepTo: 200, gain: 0.3 });
      setTimeout(() => envOsc({ freq: 300, type: "triangle", dur: 0.1, sweepTo: 700, gain: 0.22 }), 80);
      break;
    case "water":
      noise({ dur: 0.45, gain: 0.4, lp: 1400 });
      envOsc({ freq: 800, type: "sine", dur: 0.3, sweepTo: 200, gain: 0.15 });
      break;
    case "sleep":
      envOsc({ freq: 880, type: "sine", dur: 0.4, sweepTo: 440, gain: 0.25 });
      setTimeout(() => envOsc({ freq: 660, type: "sine", dur: 0.3, sweepTo: 330, gain: 0.2 }), 150);
      break;
    case "psychic":
      envOsc({ freq: 1200, type: "sine", dur: 0.4, sweepTo: 200, gain: 0.25 });
      envOsc({ freq: 1800, type: "triangle", dur: 0.4, sweepTo: 300, gain: 0.15 });
      break;
    case "buff":
      [400, 600, 800, 1000].forEach((f, i) =>
        setTimeout(() => envOsc({ freq: f, type: "sine", dur: 0.12, gain: 0.22 }), i * 60),
      );
      break;
    case "shadow":
      envOsc({ freq: 90, type: "sawtooth", dur: 0.5, sweepTo: 50, gain: 0.35 });
      envOsc({ freq: 280, type: "triangle", dur: 0.4, sweepTo: 140, gain: 0.18 });
      break;
    case "impact":
      noise({ dur: 0.25, gain: 0.55, lp: 600 });
      envOsc({ freq: 80, type: "sine", dur: 0.25, sweepTo: 40, gain: 0.5 });
      break;
    case "kick":
      envOsc({ freq: 700, type: "square", dur: 0.08, gain: 0.3 });
      setTimeout(() => envOsc({ freq: 600, type: "square", dur: 0.08, gain: 0.3 }), 110);
      break;
    case "telekinetic":
      envOsc({ freq: 300, type: "sine", dur: 0.5, sweepTo: 900, gain: 0.22 });
      break;
    case "crit":
      envOsc({ freq: 1600, type: "square", dur: 0.06, gain: 0.4 });
      setTimeout(() => noise({ dur: 0.2, gain: 0.4, hp: 2000 }), 40);
      break;
    case "shield":
      envOsc({ freq: 400, type: "sine", dur: 0.3, sweepTo: 800, gain: 0.25 });
      envOsc({ freq: 600, type: "triangle", dur: 0.3, sweepTo: 1200, gain: 0.18 });
      break;
    case "heal":
      [523, 659, 784].forEach((f, i) =>
        setTimeout(() => envOsc({ freq: f, type: "sine", dur: 0.18, gain: 0.22 }), i * 90),
      );
      break;
    case "ui":
      envOsc({ freq: 1200, type: "triangle", dur: 0.05, gain: 0.15 });
      break;
    case "win":
      [523, 659, 784, 1046].forEach((f, i) =>
        setTimeout(() => envOsc({ freq: f, type: "triangle", dur: 0.22, gain: 0.28 }), i * 130),
      );
      break;
    case "lose":
      [400, 320, 240, 160].forEach((f, i) =>
        setTimeout(() => envOsc({ freq: f, type: "sawtooth", dur: 0.3, gain: 0.25 }), i * 160),
      );
      break;
  }
}
