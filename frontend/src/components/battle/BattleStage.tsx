/**
 * BattleStage — shared single-scene 3D battle engine.
 *
 * All fighters live in ONE Canvas/scene, so attackers physically run across
 * the arena to their victim, strike in front of them, and run back — no more
 * "transparent box" clipping. Animation control is guarded so clips never
 * restart spuriously: dead units play their death once and stay down.
 *
 * Used by both the campaign replay and the P2P/AI duel arena.
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF, Html, useProgress } from "@react-three/drei";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import audio from "../../utils/audio";
import { BiomeTheme, ELEMENT_META, ElementName } from "../../utils/campaign";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface StageUnit {
  id: number;
  side: "player" | "enemy";
  name: string;
  element: ElementName;
  model?: string;
  maxHealth: number;
  scale?: number;
}

export interface StageEvent {
  round: number;
  actor_id: number;
  target_id: number;
  action: "attack" | "power" | "burn" | "stunned";
  power?: string;
  element: ElementName;
  damage: number;
  heal?: number;
  crit: boolean;
  effective: "strong" | "weak" | "normal";
  effect?: string;
  actor_hp: number;
  target_hp: number;
  target_ko: boolean;
}

interface Props {
  theme: BiomeTheme;
  playerUnits: StageUnit[];
  enemyUnits: StageUnit[];
  events: StageEvent[];
  totalRounds: number;
  victorySide: "player" | "enemy";
  title?: string;
  bossFight?: boolean;
  onFinished: () => void;
}

// ---------------------------------------------------------------------------
// Pacing
// ---------------------------------------------------------------------------

const MOVE_MS = 520; // run to the victim
const WINDUP_MS = 320; // attack clip starts before impact lands
const IMPACT_MS = 520; // hit reaction / numbers
const RETURN_MS = 480; // run home

type UnitAction = "ready" | "run" | "attack" | "hit" | "death" | "victory";

interface UnitRuntime {
  action: UnitAction;
  /** bumping this forces a one-shot clip (attack/hit) to replay */
  seq: number;
  /** world position the unit should move toward */
  target: [number, number, number];
  /** Y rotation the unit should face */
  facing: number;
  dead: boolean;
  hp: number;
}

interface FloatFx {
  key: number;
  text: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Per-model animation + movement controller
// ---------------------------------------------------------------------------

function resolveClipName(
  names: string[],
  action: UnitAction,
  variant: number,
): string | undefined {
  const lower = names.map((n) => n.toLowerCase());
  const findAll = (re: RegExp) => names.filter((_, i) => re.test(lower[i]));
  let candidates: string[] = [];
  switch (action) {
    case "attack":
      candidates = findAll(/attack/);
      if (!candidates.length) candidates = findAll(/kick/);
      break;
    case "hit":
      candidates = findAll(/hit/);
      break;
    case "death":
      candidates = findAll(/death|defeat|die/);
      break;
    case "victory":
      candidates = findAll(/victory|win|flex|cocky|taunt/);
      break;
    case "run":
      candidates = findAll(/run|walk/);
      if (!candidates.length) candidates = findAll(/idle/);
      break;
    default:
      candidates = findAll(/idle/);
      break;
  }
  if (!candidates.length) {
    return names.find((n) => /idle/i.test(n)) ?? names[0];
  }
  return candidates[variant % candidates.length];
}

const Fighter: React.FC<{
  unit: StageUnit;
  runtime: UnitRuntime;
  home: [number, number, number];
  floats: FloatFx[];
  accent: string;
}> = ({ unit, runtime, home, floats, accent }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const model = useGLTF(unit.model ?? "/models/berzerker.gltf");
  const clone = useMemo(() => SkeletonUtils.clone(model.scene), [model.scene]);
  const { actions, names, mixer } = useAnimations(model.animations, groupRef);
  const currentClip = useRef<string | null>(null);
  const lastSig = useRef<string>("");
  const deathPlayed = useRef(false);

  // ----- animation control (restart-proof) -----
  useEffect(() => {
    if (!names.length) return;

    // Identity of this animation request. Same signature => do nothing, which
    // is what prevents the "dead character stands back up" bug.
    const sig = `${runtime.action}:${runtime.action === "attack" || runtime.action === "hit" ? runtime.seq : 0}`;
    if (sig === lastSig.current) return;

    // Once dead, ignore every request except death itself (already played).
    if (deathPlayed.current) return;

    const clipName = resolveClipName(names, runtime.action, runtime.seq);
    if (!clipName) return;
    const next = actions[clipName];
    if (!next) return;

    if (currentClip.current && currentClip.current !== clipName) {
      actions[currentClip.current]?.fadeOut(0.18);
    }

    next.reset();
    if (runtime.action === "death") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true; // hold the lying-down pose forever
      deathPlayed.current = true;
    } else if (runtime.action === "attack" || runtime.action === "hit") {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
    }
    next.fadeIn(0.15).play();
    currentClip.current = clipName;
    lastSig.current = sig;
  }, [runtime.action, runtime.seq, names, actions]);

  // Keep the mixer alive even when React doesn't re-render.
  useFrame((_, delta) => {
    mixer.update(0); // useAnimations already updates; this is a no-op guard
    const g = groupRef.current;
    if (!g) return;

    // Position: critically-damped chase toward the target.
    const t = runtime.target;
    const k = 1 - Math.exp(-delta * 7.5);
    g.position.x += (t[0] - g.position.x) * k;
    g.position.z += (t[2] - g.position.z) * k;

    // Facing: shortest-arc turn toward desired heading.
    let dy = runtime.facing - g.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    g.rotation.y += dy * Math.min(1, delta * 9);
  });

  const hpPct =
    unit.maxHealth > 0
      ? Math.max(0, Math.min(100, (runtime.hp / unit.maxHealth) * 100))
      : 0;
  const meta = ELEMENT_META[unit.element];

  return (
    <group ref={groupRef} position={home} rotation-y={runtime.facing}>
      <primitive object={clone} scale={unit.scale ?? 0.85} />
      {/* soft ground ring under the fighter */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.55, 0.7, 32]} />
        <meshBasicMaterial
          color={runtime.dead ? "#7f1d1d" : accent}
          transparent
          opacity={runtime.dead ? 0.35 : 0.5}
        />
      </mesh>
      {/* nameplate + HP + floating numbers */}
      <Html
        position={[0, 2.35, 0]}
        center
        distanceFactor={9}
        style={{ pointerEvents: "none" }}
      >
        <div style={{ width: 130, textAlign: "center", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: "-44px 0 auto 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {floats.map((f) => (
              <span
                key={f.key}
                className="nebula-float"
                style={{
                  color: f.color,
                  fontWeight: 800,
                  fontSize: 15,
                  textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                  whiteSpace: "nowrap",
                }}
              >
                {f.text}
              </span>
            ))}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              color: runtime.dead ? "#f87171" : "#fff",
              textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              textDecoration: runtime.dead ? "line-through" : "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {meta.emoji} {unit.name}
          </p>
          <div
            style={{
              height: 5,
              borderRadius: 3,
              background: "rgba(0,0,0,0.65)",
              overflow: "hidden",
              marginTop: 2,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${hpPct}%`,
                transition: "width 0.45s ease",
                background:
                  hpPct > 50 ? "#45f882" : hpPct > 20 ? "#fbbf24" : "#ef4444",
              }}
            />
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 9,
              color: "rgba(255,255,255,0.75)",
              textShadow: "0 1px 2px rgba(0,0,0,0.9)",
            }}
          >
            {runtime.hp}/{unit.maxHealth}
          </p>
        </div>
      </Html>
    </group>
  );
};

// ---------------------------------------------------------------------------
// Procedural arena floor texture (no external assets): layered radial light,
// concentric battle rings, runic tick marks, cracks and scorch marks — all
// tinted by the biome.
// ---------------------------------------------------------------------------

function makeArenaTexture(theme: BiomeTheme): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;

  // Seeded PRNG so the floor looks identical every render.
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  // Base: ground color into near-black edges.
  const base = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  base.addColorStop(0, theme.ground);
  base.addColorStop(0.75, theme.fog);
  base.addColorStop(1, "#000000");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Mottled noise patches for organic ground texture.
  for (let i = 0; i < 420; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * cx * 0.96;
    const x = cx + Math.cos(a) * r;
    const y = cx + Math.sin(a) * r;
    const rad = 4 + rand() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    const light = rand() > 0.5;
    g.addColorStop(0, light ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cracks radiating outward.
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  for (let i = 0; i < 26; i++) {
    ctx.lineWidth = 1 + rand() * 1.6;
    let a = rand() * Math.PI * 2;
    let r = cx * (0.18 + rand() * 0.32);
    let x = cx + Math.cos(a) * r;
    let y = cx + Math.sin(a) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const segs = 4 + Math.floor(rand() * 5);
    for (let s = 0; s < segs; s++) {
      a += (rand() - 0.5) * 0.9;
      r += 18 + rand() * 36;
      x = cx + Math.cos(a) * r;
      y = cx + Math.sin(a) * r;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Scorch marks near the middle (old battles).
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const r = rand() * cx * 0.45;
    const x = cx + Math.cos(a) * r;
    const y = cx + Math.sin(a) * r;
    const rad = 22 + rand() * 46;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, "rgba(0,0,0,0.5)");
    g.addColorStop(0.6, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Concentric accent rings.
  const rings = [0.22, 0.5, 0.78, 0.95];
  rings.forEach((f, i) => {
    ctx.strokeStyle = `${theme.accent}${i === rings.length - 1 ? "66" : "2e"}`;
    ctx.lineWidth = i === rings.length - 1 ? 5 : 2;
    ctx.beginPath();
    ctx.arc(cx, cx, cx * f, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Runic tick marks around the outer ring.
  ctx.strokeStyle = `${theme.accent}59`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r0 = cx * 0.9;
    const r1 = cx * (i % 4 === 0 ? 0.84 : 0.875);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1);
    ctx.stroke();
  }

  // Center sigil: hexagram + inner circle.
  ctx.strokeStyle = `${theme.accent}40`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cx, cx * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  for (const offset of [0, Math.PI / 6]) {
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = offset + (i / 3) * Math.PI;
      const x = cx + Math.cos(a) * cx * 0.2;
      const y = cx + Math.sin(a) * cx * 0.2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Faction halves: subtle green tint on the player side.
  const half = ctx.createLinearGradient(0, 0, size, 0);
  half.addColorStop(0, "rgba(69,248,130,0.06)");
  half.addColorStop(0.5, "rgba(0,0,0,0)");
  half.addColorStop(1, `${theme.accent}12`);
  ctx.fillStyle = half;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function StageLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <p
        style={{
          color: "#45f882",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
        }}
      >
        Summoning fighters… {Math.floor(progress)}%
      </p>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// The stage
// ---------------------------------------------------------------------------

const BattleStage: React.FC<Props> = ({
  theme,
  playerUnits,
  enemyUnits,
  events,
  totalRounds,
  victorySide,
  title,
  bossFight,
  onFinished,
}) => {
  // Home positions: players on the left, enemies on the right, fanned in z.
  const homes = useMemo(() => {
    const map = new Map<number, [number, number, number]>();
    const zs = [-2.3, 0, 2.3];
    playerUnits.forEach((u, i) =>
      map.set(u.id, [-3.4, 0, zs[i % 3] ?? 0]),
    );
    enemyUnits.forEach((u, i) => map.set(u.id, [3.4, 0, zs[i % 3] ?? 0]));
    return map;
  }, [playerUnits, enemyUnits]);

  const allUnits = useMemo(
    () => [...playerUnits, ...enemyUnits],
    [playerUnits, enemyUnits],
  );

  const initialRuntime = useCallback((): Map<number, UnitRuntime> => {
    const m = new Map<number, UnitRuntime>();
    for (const u of allUnits) {
      const home = homes.get(u.id)!;
      m.set(u.id, {
        action: "ready",
        seq: 0,
        target: home,
        facing: u.side === "player" ? Math.PI / 2 : -Math.PI / 2,
        dead: false,
        hp: u.maxHealth,
      });
    }
    return m;
  }, [allUnits, homes]);

  const [runtime, setRuntime] = useState<Map<number, UnitRuntime>>(initialRuntime);
  const [floats, setFloats] = useState<Map<number, FloatFx[]>>(new Map());
  const [round, setRound] = useState(0);
  const [banner, setBanner] = useState<{ text: string; color: string } | null>(
    null,
  );
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const floatKey = useRef(0);
  const cancelled = useRef(false);
  const skipRef = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      audio.stopMusic();
    };
  }, []);

  const patch = (id: number, p: Partial<UnitRuntime>) =>
    setRuntime((prev) => {
      const next = new Map(prev);
      const cur = next.get(id);
      if (cur) next.set(id, { ...cur, ...p });
      return next;
    });

  const addFloat = (id: number, text: string, color: string) => {
    const key = ++floatKey.current;
    setFloats((prev) => {
      const next = new Map(prev);
      next.set(id, [...(next.get(id) ?? []), { key, text, color }]);
      return next;
    });
    setTimeout(() => {
      setFloats((prev) => {
        const next = new Map(prev);
        next.set(id, (next.get(id) ?? []).filter((f) => f.key !== key));
        return next;
      });
    }, 1100);
  };

  const sleep = (ms: number) =>
    new Promise((r) => setTimeout(r, skipRef.current ? Math.min(ms, 45) : ms));

  // ---- playback ----
  useEffect(() => {
    /** bump attack seq based on the freshest runtime snapshot */
    const prevSeqBump = (id: number): Partial<UnitRuntime> => {
      const cur = runtimeRef.current.get(id);
      return { action: "attack", seq: (cur?.seq ?? 0) + 1 };
    };

    const play = async () => {
      audio.startMusic(inferBiome(theme));
      if (title) {
        setBanner({ text: title, color: theme.accent });
        audio.play("round");
        await sleep(1500);
        setBanner(null);
      }

      let lastRound = 0;
      for (const ev of events) {
        if (cancelled.current) return;
        if (ev.round !== lastRound) {
          lastRound = ev.round;
          setRound(ev.round);
          if (!skipRef.current) audio.play("round");
        }
        await playEvent(ev);
      }
      if (cancelled.current) return;
      skipRef.current = false;

      // Finale: survivors of the winning side celebrate.
      setRuntime((prev) => {
        const next = new Map(prev);
        for (const u of allUnits) {
          const r = next.get(u.id);
          if (r && !r.dead && u.side === victorySide) {
            next.set(u.id, { ...r, action: "victory" });
          }
        }
        return next;
      });
      audio.play(victorySide === "player" ? "victory" : "defeat");
      setBanner({
        text: victorySide === "player" ? "VICTORY" : "DEFEAT",
        color: victorySide === "player" ? "#45f882" : "#ef4444",
      });
      setDone(true);
      await sleep(1900);
      if (!cancelled.current) onFinished();
    };

    const playEvent = async (ev: StageEvent) => {
      const actorHome = homes.get(ev.actor_id);
      const victimHome = homes.get(ev.target_id);
      if (!actorHome || !victimHome) return;

      if (ev.action === "stunned") {
        if (!skipRef.current) audio.play("stun");
        addFloat(ev.actor_id, "💫 STUNNED", "#a78bfa");
        await sleep(650);
        return;
      }

      if (ev.action === "burn") {
        if (!skipRef.current) audio.play("burn");
        addFloat(ev.target_id, `🔥 -${ev.damage}`, "#fb923c");
        patch(ev.target_id, { hp: ev.target_hp });
        if (ev.target_ko) {
          patch(ev.target_id, { action: "death", dead: true });
          if (!skipRef.current) audio.play("ko");
        }
        await sleep(620);
        return;
      }

      const isPower = ev.action === "power";
      const dodged = ev.effect === "dodged";

      // 1) RUN: dash to a point just in front of the victim.
      const dx = actorHome[0] - victimHome[0];
      const dz = actorHome[2] - victimHome[2];
      const len = Math.max(0.001, Math.hypot(dx, dz));
      const standOff = 1.35;
      const approach: [number, number, number] = [
        victimHome[0] + (dx / len) * standOff,
        0,
        victimHome[2] + (dz / len) * standOff,
      ];
      const faceVictim = Math.atan2(
        victimHome[0] - approach[0],
        victimHome[2] - approach[2],
      );
      patch(ev.actor_id, {
        action: "run",
        target: approach,
        facing: faceVictim,
      });
      await sleep(MOVE_MS);
      if (cancelled.current) return;

      // 2) STRIKE
      patch(ev.actor_id, prevSeqBump(ev.actor_id));
      if (isPower) {
        if (!skipRef.current) audio.playPower(ev.element);
        setBanner({ text: `${ev.power}!`, color: theme.accent });
      } else if (!skipRef.current) {
        audio.play(ev.crit ? "crit" : "hit");
      }
      if (ev.crit || (isPower && bossFight)) {
        setShake(true);
        setTimeout(() => setShake(false), 420);
      }
      await sleep(WINDUP_MS);
      if (cancelled.current) return;

      // 3) IMPACT
      if (dodged) {
        if (!skipRef.current) audio.play("dodge");
        addFloat(ev.target_id, "DODGED", "#67e8f9");
      } else {
        const victimDies = ev.target_ko;
        setRuntime((prev) => {
          const next = new Map(prev);
          const v = next.get(ev.target_id);
          if (v && !v.dead) {
            next.set(ev.target_id, {
              ...v,
              action: victimDies ? "death" : "hit",
              seq: v.seq + 1,
              dead: victimDies ? true : v.dead,
              hp: ev.target_hp,
            });
          }
          return next;
        });
        const color =
          ev.effective === "strong"
            ? "#fbbf24"
            : ev.effective === "weak"
              ? "#9ca3af"
              : "#f87171";
        addFloat(
          ev.target_id,
          ev.crit ? `-${ev.damage} CRIT!` : `-${ev.damage}`,
          ev.crit ? "#fde047" : color,
        );
        if (ev.effective === "strong") {
          addFloat(ev.target_id, "SUPER EFFECTIVE", "#fbbf24");
        }
        if (victimDies && !skipRef.current) audio.play("ko");
        if (victimDies) addFloat(ev.target_id, "K.O.", "#ef4444");
      }

      if (ev.heal && ev.heal > 0) {
        if (!skipRef.current) audio.play("heal");
        addFloat(ev.actor_id, `+${ev.heal}`, "#45f882");
      }
      if (ev.effect === "shield_up") {
        if (!skipRef.current) audio.play("shield");
        addFloat(ev.actor_id, "🛡 SHIELD", "#67e8f9");
      }
      if (ev.effect === "warded") {
        if (!skipRef.current) audio.play("shield");
        addFloat(ev.target_id, "🛡 WARDED — HALVED", "#67e8f9");
      }
      patch(ev.actor_id, { hp: ev.actor_hp });
      await sleep(IMPACT_MS);
      if (cancelled.current) return;

      // 4) RETURN home
      setBanner(null);
      const homeFacing =
        playerUnits.some((u) => u.id === ev.actor_id) ? Math.PI / 2 : -Math.PI / 2;
      patch(ev.actor_id, {
        action: "run",
        target: actorHome,
        facing: homeFacing,
      });
      // Victim settles back to ready (if alive).
      setRuntime((prev) => {
        const next = new Map(prev);
        const v = next.get(ev.target_id);
        if (v && !v.dead && v.action === "hit") {
          next.set(ev.target_id, { ...v, action: "ready" });
        }
        return next;
      });
      await sleep(RETURN_MS);
      patch(ev.actor_id, { action: "ready", facing: homeFacing });
    };

    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // Keep a ref of runtime for the playback closure.
  const runtimeRef = useRef(runtime);
  useEffect(() => {
    runtimeRef.current = runtime;
  }, [runtime]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border-2 ${shake ? "nebula-shake" : ""}`}
      style={{ borderColor: theme.accent }}
    >
      <style>{`
        @keyframes nebulaFloatUp {
          0% { transform: translateY(8px); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        .nebula-float { animation: nebulaFloatUp 1.05s ease-out forwards; }
        @keyframes nebulaShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-6px, 2px); }
          40% { transform: translate(5px, -3px); }
          60% { transform: translate(-4px, 2px); }
          80% { transform: translate(3px, -1px); }
        }
        .nebula-shake { animation: nebulaShake 0.42s linear; }
      `}</style>

      {/* backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 115%, ${theme.accent}40 0%, transparent 60%)`,
        }}
      />

      {/* HUD */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-3">
        <span
          className="font-belanosima uppercase tracking-widest text-[10px] md:text-xs"
          style={{ color: theme.accent }}
        >
          {theme.emoji} {theme.label}
        </span>
        <span className="font-belanosima text-white/80 text-xs md:text-sm">
          Round {round} / {totalRounds}
        </span>
        <button
          onClick={() => {
            skipRef.current = true;
            setSkipping(true);
          }}
          disabled={done || skipping}
          className="font-belanosima uppercase text-[10px] md:text-xs text-white/60 hover:text-white border border-white/20 rounded px-2.5 py-1 disabled:opacity-30"
        >
          {skipping ? "Skipping…" : "Skip ⏩"}
        </button>
      </div>

      {/* banner */}
      {banner && (
        <div className="absolute inset-x-0 top-[42%] z-30 pointer-events-none flex justify-center">
          <span
            className="font-belanosima text-2xl md:text-5xl uppercase tracking-widest text-center px-4 animate-pulse"
            style={{ color: banner.color, textShadow: `0 0 30px ${banner.color}` }}
          >
            {banner.text}
          </span>
        </div>
      )}

      {/* single shared 3D scene */}
      <div className="relative z-10 w-full h-[380px] sm:h-[460px] md:h-[540px]">
        <Canvas
          shadows
          camera={{ position: [0, 4.6, 9.8], fov: 44 }}
          onCreated={({ camera }) => camera.lookAt(0, 0.6, 0)}
        >
          <fog attach="fog" args={[theme.fog, 14, 34]} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[6, 8, 6]}
            intensity={3.2}
            color={theme.light}
            castShadow
          />
          <directionalLight position={[-6, 6, -4]} intensity={2.2} />
          <pointLight position={[0, 5, 0]} intensity={1.4} color={theme.accent} />

          {/* arena floor — procedural biome-themed battleground */}
          <ArenaFloor theme={theme} />

          <Suspense fallback={<StageLoader />}>
            {allUnits.map((u) => {
              const r = runtime.get(u.id);
              const home = homes.get(u.id);
              if (!r || !home) return null;
              return (
                <Fighter
                  key={u.id}
                  unit={u}
                  runtime={r}
                  home={home}
                  floats={floats.get(u.id) ?? []}
                  accent={
                    u.side === "player" ? "#45f882" : theme.accent
                  }
                />
              );
            })}
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

/** Arena floor with a memoised procedural texture + glow ring. */
const ArenaFloor: React.FC<{ theme: BiomeTheme }> = ({ theme }) => {
  const texture = useMemo(() => makeArenaTexture(theme), [theme]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[9.5, 64]} />
        <meshStandardMaterial map={texture} roughness={0.92} metalness={0.05} />
      </mesh>
      {/* outer glow ring floats just above the texture */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
        <ringGeometry args={[9.05, 9.3, 64]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.5} />
      </mesh>
    </>
  );
};

/** crude biome inference for music when only a theme object is available */
function inferBiome(theme: BiomeTheme):
  | "VerdantWilds"
  | "VolcanicForge"
  | "AbyssalDepths"
  | "StormSpire"
  | "AstralPlane"
  | "VoidNexus" {
  if (theme.boosted === "Nature") return "VerdantWilds";
  if (theme.boosted === "Fire") return "VolcanicForge";
  if (theme.boosted === "Water") return "AbyssalDepths";
  if (theme.boosted === "Storm") return "StormSpire";
  if (theme.boosted === "Psychic") return "AstralPlane";
  return "VoidNexus";
}

export default BattleStage;
