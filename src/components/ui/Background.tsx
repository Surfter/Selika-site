import { motion } from "framer-motion";
import { useReducedMotion } from "../../lib/hooks";

type Orb = { size: number; x: string; y: string; from: string; to: string; dur: number; dx: number; dy: number };
const ORBS: Orb[] = [
  { size: 620, x: "-8%",  y: "6%",  from: "rgba(77,141,255,0.30)",  to: "rgba(77,141,255,0)",  dur: 34, dx: 120, dy: 80 },
  { size: 520, x: "62%",  y: "-4%", from: "rgba(176,124,255,0.26)", to: "rgba(176,124,255,0)", dur: 40, dx: -90, dy: 110 },
  { size: 440, x: "72%",  y: "58%", from: "rgba(142,197,255,0.22)", to: "rgba(142,197,255,0)", dur: 30, dx: -70, dy: -90 },
  { size: 380, x: "10%",  y: "66%", from: "rgba(139,124,255,0.22)", to: "rgba(139,124,255,0)", dur: 36, dx: 100, dy: -60 },
];

/** Slow-drifting light behind everything. Transforms only, so it never triggers layout. */
export function Background() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "var(--bg)" }}>
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size, height: o.size, left: o.x, top: o.y,
            background: `radial-gradient(circle at 50% 50%, ${o.from}, ${o.to} 70%)`,
            filter: "blur(40px)", willChange: "transform",
          }}
          animate={reduce ? undefined : { x: [0, o.dx, -o.dx * 0.5, 0], y: [0, o.dy, -o.dy * 0.6, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* fine grain so the gradients don't band */}
      <div className="absolute inset-0 opacity-[0.045]"
        style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='1'/></svg>\")" }} />
    </div>
  );
}

/** Little glass shards that float in a section. */
export function Shards({ count = 7, seed = 1 }: { count?: number; seed?: number }) {
  const reduce = useReducedMotion();
  const items = Array.from({ length: count }, (_, i) => {
    const r = (n: number) => { const x = Math.sin((i + 1) * 12.9898 * seed + n * 78.233) * 43758.5453; return x - Math.floor(x); };
    return { left: `${8 + r(1) * 84}%`, top: `${6 + r(2) * 80}%`, w: 26 + r(3) * 54, h: 36 + r(4) * 70, rot: -30 + r(5) * 60, dur: 14 + r(6) * 14, dy: 18 + r(7) * 30 };
  });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl glass"
          style={{ left: s.left, top: s.top, width: s.w, height: s.h, opacity: 0.35, rotate: s.rot }}
          animate={reduce ? undefined : { y: [0, -s.dy, 0], rotate: [s.rot, s.rot + 8, s.rot] }}
          transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}
