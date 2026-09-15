import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, animate, type MotionValue } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { BASELINE, ENVS, kToT, nearestEnv, sampleAt, tToK, type Env } from "../../lib/environments";
import { hex, kelvinToRGB, springFor } from "../../lib/physics";
import { GlassCard, GlassChip } from "../ui/Glass";
import { LitPortrait } from "./Portrait";
import { TemperatureTrack } from "./TemperatureTrack";

export type Mode = "product" | "dev";
export type Sub = "env" | "hud" | "tx";

/* ---------------- state ---------------- */
export function useDemoState() {
  const t = useMotionValue(kToT(ENVS[0].k));
  const [mode, setMode] = useState<Mode>("product");
  const [sub, setSub] = useState<Sub>("env");
  const [hud, setHud] = useState<Record<string, boolean>>({ light: true, tone: true, shift: false, guide: false });
  const [tx, setTx] = useState<{ hair: string; beard: string; glasses: string }>({ hair: "none", beard: "none", glasses: "none" });
  const [mods, setMods] = useState<Record<string, boolean>>({ clock: true, calendar: true, tasks: true, github: false, home: false, agent: false });
  const [lastMod, setLastMod] = useState<string>("tasks");
  const [near, setNear] = useState<Env>(ENVS[0]);
  useMotionValueEvent(t, "change", (v) => { const n = nearestEnv(v); if (n.id !== near.id) setNear(n); });
  const goEnv = (e: Env) => animate(t, kToT(e.k), springFor(0.42, 1));
  return { t, mode, setMode, sub, setSub, hud, setHud, tx, setTx, mods, setMods, lastMod, setLastMod, near, goEnv };
}
export type DemoState = ReturnType<typeof useDemoState>;

/* ---------------- sway transition between options ---------------- */
const sway = {
  initial: (d: number) => ({ opacity: 0, x: 26 * d, rotate: 1.2 * d, filter: "blur(6px)" }),
  animate: { opacity: 1, x: 0, rotate: 0, filter: "blur(0px)", transition: springFor(0.55, 0.9) },
  exit: (d: number) => ({ opacity: 0, x: -22 * d, rotate: -1 * d, filter: "blur(6px)", transition: { duration: 0.22 } }),
};

/* ---------------- mirror content ---------------- */
export function DemoFace({ s }: { s: DemoState }) {
  const zero = useMotionValue(0);
  const camLabel = s.mode === "dev" ? "Shutter closed" : s.sub === "env" ? "Camera open" : s.sub === "hud" ? "Analysing" : "Simulating";
  return (
    <div className="absolute inset-0">
      {/* the reflection is always there; developer mode dims it and draws over it */}
      <motion.div className="absolute inset-0" animate={{ opacity: s.mode === "dev" ? 0.16 : 1, filter: s.mode === "dev" ? "saturate(.3) brightness(.6)" : "none" }} transition={{ duration: 0.6 }}>
        <LitPortrait t={s.t} id="main">
          <AnimatePresence>{s.mode === "product" && s.sub === "tx" && <TxOverlay key="tx" tx={s.tx} />}</AnimatePresence>
          <AnimatePresence>{s.mode === "product" && s.sub === "hud" && <HudOverlay key="hud" s={s} />}</AnimatePresence>
        </LitPortrait>
      </motion.div>

      <AnimatePresence>
        {s.mode === "product" && s.sub === "env" && (
          <motion.div key="base" className="absolute left-3 bottom-3 z-10 w-[30%] max-w-[7.5rem] overflow-hidden rounded-xl border border-white/20 shadow-2xl"
            initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }} transition={springFor(0.5, 1)}>
            <div className="relative aspect-[4/5]"><LitPortrait t={zero} id="base" fixed={BASELINE} /></div>
            <div className="bg-black/70 px-1.5 py-1 text-center text-[0.5rem] uppercase tracking-[0.12em] text-mute backdrop-blur">Your bathroom · 5000K</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{s.mode === "dev" && <Dashboard key="dash" s={s} />}</AnimatePresence>

      {/* camera chip */}
      <div style={{ position: "absolute" }} className="absolute left-1/2 top-2.5 z-20 -translate-x-1/2 glass rounded-full px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.14em] text-mute flex items-center gap-1.5">
        <motion.i className="block h-1.5 w-1.5 rounded-full" animate={{ backgroundColor: s.mode === "dev" ? "#3a4258" : "#7BD6A8", boxShadow: s.mode === "dev" ? "0 0 0 rgba(0,0,0,0)" : "0 0 8px #7BD6A8" }} />
        {camLabel}
      </div>
    </div>
  );
}

/** Everything under the glass: readout, and the track in environment mode. */
export function DemoFooter({ s }: { s: DemoState }) {
  const kText = useTransform(s.t, (v) => `${Math.round(sampleAt(tToK(Math.max(0, Math.min(1, v)))).k / 10) * 10}K`);
  const criText = useTransform(s.t, (v) => `${Math.round(sampleAt(tToK(Math.max(0, Math.min(1, v)))).cri)}`);
  return (
    <div className="px-2 pb-1 pt-3">
      <AnimatePresence mode="wait">
        {s.mode === "product" ? (
          <motion.div key="p" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <TemperatureTrack t={s.t} />
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[0.66rem] uppercase tracking-[0.12em] text-dim tabular">
              <span>Environment <b className="font-semibold text-ink">{s.near.name}</b></span>
              <span><motion.b className="font-semibold text-ink">{kText}</motion.b> · CRI <motion.b className="font-semibold text-ink">{criText}</motion.b> · {s.near.lux}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="d" className="flex items-center justify-between px-1 pt-6 text-[0.66rem] uppercase tracking-[0.12em] text-dim" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span>Runtime <b className="font-semibold text-ink">selika-os 0.4.1-dev</b></span>
            <span className="text-ink font-semibold">{Object.values(s.mods).filter(Boolean).length} modules</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- controls (right column) ---------------- */
export function DemoControls({ s }: { s: DemoState }) {
  const dir = s.mode === "dev" ? 1 : s.sub === "env" ? -1 : s.sub === "hud" ? 0.5 : 1;
  const key = s.mode === "dev" ? "dev" : s.sub;
  return (
    <div className="relative min-h-[24rem]">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={key} custom={dir} variants={sway} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
          {key === "env" && <EnvPanel s={s} />}
          {key === "hud" && <HudPanel s={s} />}
          {key === "tx" && <TxPanel s={s} />}
          {key === "dev" && <DevPanel s={s} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const PanelH = ({ children }: { children: ReactNode }) => <p className="eyebrow mb-3">{children}</p>;
const Caveat = ({ children }: { children: ReactNode }) => <p className="mt-5 border-l border-white/10 pl-3.5 text-[0.76rem] leading-relaxed text-dim">{children}</p>;

function EnvPanel({ s }: { s: DemoState }) {
  return (
    <div>
      <PanelH>Where are you going?</PanelH>
      <div className="grid grid-cols-2 gap-2">
        {ENVS.map((e) => {
          const c = hex(kelvinToRGB(e.k)); const on = s.near.id === e.id;
          return (
            <motion.button key={e.id} type="button" aria-pressed={on} onClick={() => s.goEnv(e)}
              className={`glass rounded-2xl p-3 text-left ${on ? "glass-tint" : ""}`}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={springFor(0.3, 1)}>
              <span className="flex items-center gap-2">
                <motion.span className="h-3 w-3 rounded-full" style={{ background: c }} animate={{ boxShadow: on ? `0 0 14px ${c}` : `0 0 6px ${c}` }} />
                <span className="text-[0.84rem] font-medium">{e.name}</span>
              </span>
              <span className="mt-1 block text-[0.62rem] tabular text-dim">{e.k}K · CRI {e.cri} · {e.lux}</span>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={s.near.id} className="mt-4 text-[0.82rem] leading-relaxed text-mute" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
          {s.near.note}
        </motion.p>
      </AnimatePresence>
      <Caveat>The shift is computed, not painted: colour temperature runs through the black-body approximation to RGB, and the colour rendering index drives saturation and contrast. Selika reproduces the light. It cannot know a venue's exact spectrum, and does not claim to.</Caveat>
    </div>
  );
}

const HUD_ITEMS = [
  { id: "light", label: "Lighting map", desc: "Where the key light lands and what it does to contrast." },
  { id: "tone", label: "Skin tone reading", desc: "Descriptive tone and undertone under the current condition." },
  { id: "shift", label: "Colour shift warning", desc: "What changes between your bathroom and this destination." },
  { id: "guide", label: "Placement guides", desc: "Registered markers for grooming or product placement." },
];
function Toggle({ on, label, desc, onClick }: { on: boolean; label: string; desc: string; onClick: () => void }) {
  return (
    <motion.button type="button" aria-pressed={on} onClick={onClick}
      className={`glass flex w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left ${on ? "glass-tint" : ""}`}
      whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={springFor(0.3, 1)}>
      <motion.span className="mt-0.5 grid h-4 w-4 flex-none place-items-center rounded-md border border-white/30 text-[10px] text-night"
        animate={{ backgroundColor: on ? "#8EC5FF" : "rgba(0,0,0,0)", borderColor: on ? "#8EC5FF" : "rgba(255,255,255,0.3)" }}>{on ? "✓" : ""}</motion.span>
      <span><span className="block text-[0.84rem] font-medium">{label}</span><span className="block text-[0.74rem] leading-snug text-mute">{desc}</span></span>
    </motion.button>
  );
}
function HudPanel({ s }: { s: DemoState }) {
  return (
    <div>
      <PanelH>Reflection overlays</PanelH>
      <div className="grid gap-2 sm:grid-cols-2">
        {HUD_ITEMS.map((h) => <Toggle key={h.id} on={!!s.hud[h.id]} label={h.label} desc={h.desc} onClick={() => s.setHud({ ...s.hud, [h.id]: !s.hud[h.id] })} />)}
      </div>
      <Caveat>Guidance is drawn in register with the reflection so both hands stay free. Rendered from example values. Nothing in Selika makes a medical or diagnostic claim.</Caveat>
    </div>
  );
}

const TX_OPTS = {
  hair: [{ id: "none", label: "As is" }, { id: "crop", label: "Short crop" }, { id: "long", label: "Longer" }, { id: "tied", label: "Tied back" }],
  beard: [{ id: "none", label: "Clean" }, { id: "stubble", label: "Stubble" }, { id: "full", label: "Full beard" }],
  glasses: [{ id: "none", label: "None" }, { id: "round", label: "Round" }, { id: "rect", label: "Rectangular" }],
} as const;
function TxPanel({ s }: { s: DemoState }) {
  return (
    <div>
      {(["hair", "beard", "glasses"] as const).map((g) => (
        <div key={g} className="mb-5">
          <PanelH>{g === "hair" ? "Hair" : g === "beard" ? "Facial hair" : "Eyewear"}</PanelH>
          <div className="flex flex-wrap gap-2">
            {TX_OPTS[g].map((o) => <GlassChip key={o.id} active={s.tx[g] === o.id} onClick={() => s.setTx({ ...s.tx, [g]: o.id })}>{o.label}</GlassChip>)}
          </div>
        </div>
      ))}
      <Caveat>Appearance simulation is the most familiar smart-mirror feature and the least defensible on its own; a phone does it well. It earns its place because it runs inside the destination lighting, with both hands free.</Caveat>
    </div>
  );
}

export const MODULES = [
  { id: "clock", name: "Clock & date", desc: "Always-on time, date and the first thing on today.", wide: true },
  { id: "calendar", name: "Calendar", desc: "Next events, from whatever calendar you connect." },
  { id: "tasks", name: "Tasks", desc: "Your task system, read-only at a glance." },
  { id: "github", name: "Build status", desc: "Pipelines and open reviews from your own endpoints." },
  { id: "home", name: "Home control", desc: "Lights, heating and scenes on the local network." },
  { id: "agent", name: "Agent activity", desc: "What your own agents did overnight, in plain language." },
];
function DevPanel({ s }: { s: DemoState }) {
  return (
    <div>
      <PanelH>Module registry</PanelH>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODULES.map((m) => <Toggle key={m.id} on={!!s.mods[m.id]} label={m.name} desc={m.desc} onClick={() => { const on = !s.mods[m.id]; s.setMods({ ...s.mods, [m.id]: on }); if (on) s.setLastMod(m.id); }} />)}
      </div>
      <PanelH><span className="mt-5 block">A module is about this long</span></PanelH>
      <GlassCard className="rounded-2xl overflow-x-auto p-4">
        <pre className="code m-0 whitespace-pre text-mute">{`// modules/commute.js\n`}<span className="k">export default</span>{` defineModule({\n  id: `}<span className="s">'commute'</span>{`,\n  surface: `}<span className="s">'left-rail'</span>{`,\n  refresh: `}<span className="s">'60s'</span>{`,\n  `}<span className="k">async</span>{` render({ api, ui }) {\n    `}<span className="k">const</span>{` next = `}<span className="k">await</span>{` api.get(`}<span className="s">'transit/next'</span>{`)\n    `}<span className="k">return</span>{` ui.stack([\n      ui.label(`}<span className="s">'COMMUTE'</span>{`),\n      ui.metric(next.mins, `}<span className="s">'min'</span>{`),\n      ui.caption(next.line)\n    ])\n  }\n})`}</pre>
      </GlassCard>
      <Caveat>The platform layer is a direction, not a shipped product. What is real is the decision behind it: Selika does not need to own the model, the agent or the integrations. It needs to be the surface they run on.</Caveat>
    </div>
  );
}

/* ---------------- overlays inside the glass ---------------- */
function plate(x: number, y: number, w: number, label: string, val: string) {
  return (
    <g key={label}>
      <rect x={x} y={y} width={w} height="30" rx="8" fill="rgba(8,10,18,.72)" stroke="rgba(142,197,255,.3)" strokeWidth=".7" />
      <text x={x + 10} y={y + 13} fill="#98A2B8" fontSize="8.5" letterSpacing=".08em" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600">{label}</text>
      <text x={x + 10} y={y + 25} fill="#EEF2FF" fontSize="9" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600">{val}</text>
    </g>
  );
}
function HudOverlay({ s }: { s: DemoState }) {
  const [cond, setCond] = useState(() => sampleAt(tToK(Math.max(0, Math.min(1, s.t.get())))));
  useMotionValueEvent(s.t, "change", (v) => setCond(sampleAt(tToK(Math.max(0, Math.min(1, v))))));
  const tick = "rgba(238,242,255,.6)";
  const dk = Math.round((cond.k - BASELINE.k) / 10) * 10, dc = Math.round(cond.cri - BASELINE.cri);
  return (
    <motion.svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {s.hud.light && (<g>
        <motion.path d="M58 150 L136 200" stroke={tick} strokeWidth=".8" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M342 150 L264 200" stroke={tick} strokeWidth=".8" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.circle cx="200" cy="214" r="92" fill="none" stroke="rgba(142,197,255,.35)" strokeDasharray="3 7" initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        {plate(28, 118, 110, "KEY LIGHT", cond.k < 3000 ? "LOW / WARM" : cond.k < 4600 ? "SIDE / NEUTRAL" : "HIGH / COOL")}
        {plate(262, 118, 110, "CONTRAST", (cond.i < 0.4 ? "+0.6" : cond.i < 0.5 ? "+0.4" : "+0.1") + " STOP")}
      </g>)}
      {s.hud.tone && (<g><path d="M152 256 L98 292" stroke={tick} strokeWidth=".8" fill="none" />{plate(14, 288, 128, "UNDERTONE", cond.k < 2600 ? "WARM" : cond.k < 4600 ? "WARM / NEUTRAL" : "NEUTRAL / COOL")}</g>)}
      {s.hud.shift && (<g><path d="M248 272 L316 308" stroke={tick} strokeWidth=".8" fill="none" />{plate(256, 306, 132, "SHIFT VS 5000K", `${dk > 0 ? "+" : ""}${dk}K / ${dc > 0 ? "+" : ""}${dc} CRI`)}</g>)}
      {s.hud.guide && (<g>
        <path d="M150 244 q50 24 100 0" stroke={tick} strokeWidth=".8" fill="none" />
        <circle cx="150" cy="244" r="5" fill="none" stroke="rgba(238,242,255,.8)" /><circle cx="250" cy="244" r="5" fill="none" stroke="rgba(238,242,255,.8)" />
        {plate(140, 352, 122, "CHEEK LINE", "MATCHED")}
      </g>)}
    </motion.svg>
  );
}

const TX_PATHS: Record<string, Record<string, string>> = {
  hair: {
    crop: '<path d="M200 116c41 0 67 29 67 74 0 6-1 12-2 17-6-21-12-34-23-38-12 8-28 11-42 11s-30-3-42-11c-11 4-17 17-23 38-1-5-2-11-2-17 0-45 26-74 67-74z" fill="url(#main-hair)"/>',
    long: '<path d="M200 118c45 0 71 32 71 76 0 36-4 72-10 100-4-36-4-72-9-93-14 12-35 17-52 17s-38-5-52-17c-5 21-5 57-9 93-6-28-10-64-10-100 0-44 26-76 71-76z" fill="url(#main-hair)"/>',
    tied: '<path d="M200 116c41 0 67 29 67 74 0 6-1 12-2 17-5-20-11-31-21-35-13 9-29 12-44 12s-31-3-44-12c-10 4-16 15-21 35-1-5-2-11-2-17 0-45 26-74 67-74z" fill="url(#main-hair)"/><path d="M266 184c13 4 19 19 15 34-3 13-9 21-17 22 7-19 7-41 2-56z" fill="url(#main-hair)"/>',
  },
  beard: {
    stubble: '<path d="M143 238c4 34 26 62 57 62s53-28 57-62c3 32-12 74-57 74s-60-42-57-74z" fill="#3A2A1D" opacity=".55"/>',
    full: '<path d="M139 232c3 42 25 76 61 76s58-34 61-76c6 42-14 88-61 88s-67-46-61-88z" fill="#33241A"/><path d="M182 270c7-5 12-7 18-7s11 2 18 7c-7 8-12 11-18 11s-11-3-18-11z" fill="#9A5A52"/>',
  },
  glasses: {
    round: '<circle cx="172" cy="212" r="22" fill="#A8CDF0" opacity=".1"/><circle cx="228" cy="212" r="22" fill="#A8CDF0" opacity=".1"/><g fill="none" stroke="#E4E8F4" stroke-width="2.6" opacity=".92"><circle cx="172" cy="212" r="22"/><circle cx="228" cy="212" r="22"/><path d="M194 210h12M150 207l-14-4M250 207l14-4"/></g>',
    rect: '<rect x="150" y="198" width="44" height="28" rx="5" fill="#A8CDF0" opacity=".1"/><rect x="206" y="198" width="44" height="28" rx="5" fill="#A8CDF0" opacity=".1"/><g fill="none" stroke="#E4E8F4" stroke-width="2.6" opacity=".92"><rect x="150" y="198" width="44" height="28" rx="5"/><rect x="206" y="198" width="44" height="28" rx="5"/><path d="M194 210h12M150 204l-14-4M250 204l14-4"/></g>',
  },
};
function TxOverlay({ tx }: { tx: { hair: string; beard: string; glasses: string } }) {
  const html = useMemo(() => (TX_PATHS.beard[tx.beard] ?? "") + (TX_PATHS.hair[tx.hair] ?? "") + (TX_PATHS.glasses[tx.glasses] ?? ""), [tx]);
  return (
    <motion.svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <AnimatePresence mode="popLayout">
        <motion.g key={html} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ transformOrigin: "200px 200px" }} dangerouslySetInnerHTML={{ __html: html }} />
      </AnimatePresence>
    </motion.svg>
  );
}

/* ---------------- developer dashboard ---------------- */
const CMDS: Record<string, string> = { clock: "what's the time", calendar: "what do I have today", tasks: "show me my tasks", github: "how's the build", home: "turn the bathroom light warm", agent: "what did the agents do overnight" };
function Tile({ id }: { id: string }) {
  const d = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const H = ({ l, r }: { l: string; r: string }) => <div className="mb-1.5 flex justify-between text-[0.52rem] uppercase tracking-[0.14em] text-dim"><span>{l}</span><span className="text-[#7BD6A8]">{r}</span></div>;
  const R = ({ l, r }: { l: string; r: string }) => <div className="flex items-baseline justify-between gap-2 text-[0.72rem] leading-relaxed"><b className="truncate font-medium">{l}</b><i className="flex-none not-italic tabular text-[0.62rem] text-mute">{r}</i></div>;
  const body: Record<string, ReactNode> = {
    clock: <><div className="font-display text-[2.6rem] leading-none tracking-[-0.03em] tabular">{`${d.getHours()}`.padStart(2, "0")}:{`${d.getMinutes()}`.padStart(2, "0")}</div><div className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-mute">{days[d.getDay()]} · {d.getDate()} {mons[d.getMonth()]}</div></>,
    calendar: <><H l="Calendar" r="live" /><R l="Standup" r="09:30" /><R l="Access review" r="13:00" /><R l="Dinner, Nara" r="19:45" /></>,
    tasks: <><H l="Tasks" r="3 open" /><R l="Order acrylic sample" r="today" /><R l="LED driver test" r="wed" /><R l="Write BOM" r="fri" /></>,
    github: <><H l="Build" r="passing" /><div className="font-display text-[1.6rem] leading-none">14<span className="text-[0.6rem] tracking-[0.1em] text-mute"> / 14</span></div><div className="mt-1.5"><R l="2 reviews waiting" r="main" /></div></>,
    home: <><H l="Home" r="4 devices" /><R l="Bathroom" r="2700K" /><R l="Hallway" r="off" /><R l="Heating" r="19.5°" /></>,
    agent: <><H l="Agents" r="overnight" /><R l="Sourcing agent — 6 new suppliers matched" r="04:12" /><R l="Inbox triage — 11 handled, 2 flagged" r="06:00" /></>,
  };
  const wide = id === "clock" || id === "agent";
  return (
    <motion.div layout className={`glass rounded-2xl px-3 py-2.5 ${wide ? "col-span-2" : ""}`}
      initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={springFor(0.5, 0.9)}>
      {body[id]}
    </motion.div>
  );
}
function Dashboard({ s }: { s: DemoState }) {
  const on = MODULES.filter((m) => s.mods[m.id]);
  return (
    <motion.div className="absolute inset-0 z-10 flex flex-col gap-2 p-3 pt-9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {on.length === 0 ? (
        <div className="m-auto text-center text-[0.62rem] uppercase leading-loose tracking-[0.14em] text-dim">No modules loaded<br />— it is a mirror again —</div>
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-2 content-start">
          <AnimatePresence>{on.map((m) => <Tile key={m.id} id={m.id} />)}</AnimatePresence>
        </motion.div>
      )}
      <div className="mt-auto flex gap-2 border-t border-white/10 pt-2 text-[0.66rem] text-mute">
        <b className="font-normal text-sky">“Selika,</b>
        <AnimatePresence mode="wait">
          <motion.span key={s.lastMod} className="truncate" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>{CMDS[s.lastMod] ?? "show me my tasks"}”</motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
