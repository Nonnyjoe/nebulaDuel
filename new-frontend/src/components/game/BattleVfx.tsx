/**
 * BattleVfx — world-space super-power VFX for the 3D arena.
 *
 * Each active cast is a camera-facing (billboarded) textured plane animated by
 * `useFrame` off `performance.now()` (smooth, independent of React re-renders),
 * positioned and animated per the move's `travel` type:
 *   projectile → flies caster → target, flashes on impact
 *   beam       → stretches across the gap between caster and target
 *   self       → aura on the caster
 *   melee      → slash/impact flash on the target
 */
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture, Billboard } from "@react-three/drei";
import { MOVES, MOVE_LIST, vfxScaleFor, type MoveId } from "@/lib/moves";

const TORSO_Y = 1.15; // VFX anchor height (characters stand at y=0, scale ~0.85)

export interface VfxInstance {
  key: number;
  move: MoveId;
  /** caster home position [x, y, z] (y ignored — we anchor at torso height) */
  from: [number, number, number];
  /** target home position [x, y, z] */
  to: [number, number, number];
  /** performance.now() at spawn */
  start: number;
  /** ms for a projectile to reach the target (0 for non-projectiles) */
  travelMs: number;
  /** total lifetime ms */
  lifeMs: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function VfxSprite({ inst, texByUrl }: { inst: VfxInstance; texByUrl: Map<string, THREE.Texture> }) {
  const def = MOVES[inst.move];
  const tex = texByUrl.get(def.vfx);
  const altTex = def.vfxAlt ? texByUrl.get(def.vfxAlt) : undefined;

  const groupRef = useRef<THREE.Group>(null!);
  const scaleRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);
  const altMatRef = useRef<THREE.MeshBasicMaterial>(null!);

  const aspect = useMemo(() => {
    const img = tex?.image as { width?: number; height?: number } | undefined;
    return img?.width && img?.height ? img.width / img.height : 1;
  }, [tex]);

  const size = vfxScaleFor(def);
  const dist = useMemo(
    () => Math.hypot(inst.to[0] - inst.from[0], inst.to[2] - inst.from[2]),
    [inst],
  );

  useFrame(() => {
    const g = groupRef.current;
    const m = matRef.current;
    if (!g || !m) return;
    const elapsed = performance.now() - inst.start;
    const t = clamp01(elapsed / inst.lifeMs);

    let x = inst.to[0];
    let z = inst.to[2];
    let y = TORSO_Y;
    let sx = size * aspect;
    let sy = size;
    let opacity = 1;

    switch (def.travel) {
      case "projectile": {
        const travelT = clamp01(elapsed / Math.max(1, inst.travelMs));
        const e = easeOut(travelT);
        x = lerp(inst.from[0], inst.to[0], e);
        z = lerp(inst.from[2], inst.to[2], e);
        y = TORSO_Y + Math.sin(e * Math.PI) * 0.5; // gentle arc
        if (travelT < 1) {
          const s = 0.7 + 0.3 * e;
          sx = size * aspect * s;
          sy = size * s;
          opacity = clamp01(travelT * 5);
        } else {
          // impact flash at the target
          const aft = clamp01((elapsed - inst.travelMs) / Math.max(1, inst.lifeMs - inst.travelMs));
          const s = 1 + 0.6 * aft;
          sx = size * aspect * s;
          sy = size * s;
          opacity = 1 - aft;
        }
        break;
      }
      case "beam": {
        x = (inst.from[0] + inst.to[0]) / 2;
        z = (inst.from[2] + inst.to[2]) / 2;
        y = TORSO_Y;
        sx = Math.max(size * aspect, dist * 1.05); // span the gap
        sy = size * 0.85;
        // The beam sprite is drawn wide-at-source → narrow-at-target (pointing
        // right), which only reads correctly for a left-side caster. Mirror it
        // when the caster is on the right so the wide end always hugs the caster.
        if (inst.from[0] > inst.to[0]) sx = -sx;
        opacity = Math.sin(t * Math.PI); // ramp in/out over life
        break;
      }
      case "self": {
        x = inst.from[0];
        z = inst.from[2];
        y = TORSO_Y + t * 0.5; // rise
        const pulse = 0.85 + 0.5 * Math.sin(t * Math.PI);
        sx = size * aspect * pulse;
        sy = size * pulse;
        opacity = Math.sin(t * Math.PI);
        break;
      }
      default: {
        // melee — slash/impact flash on the target
        x = inst.to[0];
        z = inst.to[2];
        y = TORSO_Y;
        const s = 0.6 + easeOut(t) * 0.7;
        sx = size * aspect * s;
        sy = size * s;
        opacity = 1 - t * t;
      }
    }

    g.position.set(x, y, z);
    scaleRef.current?.scale.set(sx, sy, 1);
    m.opacity = opacity;
    if (altMatRef.current) altMatRef.current.opacity = opacity * 0.85;
  });

  if (!tex) return null;

  return (
    <group ref={groupRef}>
      <Billboard>
        <group ref={scaleRef}>
          <mesh>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={matRef}
              map={tex}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {altTex && (
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                ref={altMatRef}
                map={altTex}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      </Billboard>
    </group>
  );
}

export function BattleVfx({ instances }: { instances: VfxInstance[] }) {
  const urls = useMemo(
    () =>
      Array.from(
        new Set(MOVE_LIST.flatMap((m) => [m.vfx, m.vfxAlt]).filter(Boolean) as string[]),
      ),
    [],
  );
  const loaded = useTexture(urls) as THREE.Texture[];
  const texByUrl = useMemo(() => {
    const m = new Map<string, THREE.Texture>();
    urls.forEach((u, i) => {
      const t = loaded[i];
      if (t) {
        t.colorSpace = THREE.SRGBColorSpace;
        m.set(u, t);
      }
    });
    return m;
  }, [urls, loaded]);

  return (
    <>
      {instances.map((inst) => (
        <VfxSprite key={inst.key} inst={inst} texByUrl={texByUrl} />
      ))}
    </>
  );
}

/** Warm the texture cache so the first cast never stutters. */
export function preloadVfxTextures() {
  for (const m of MOVE_LIST) {
    useTexture.preload(m.vfx);
    if (m.vfxAlt) useTexture.preload(m.vfxAlt);
  }
}
