import { motion } from "framer-motion";
import { springFor } from "../../lib/physics";
import { GlassButton, GlassCard } from "../ui/Glass";
import { Item, Reveal, Stagger, Words } from "../ui/Reveal";
import { ExpandCards, IconAct, IconReflect, IconUnderstand } from "./ExpandCards";
import { Logo } from "../Logo";

function Head({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <>
      <Reveal><p className="eyebrow mb-4">{eyebrow}</p></Reveal>
      <Words as="h2" className="h-section text-[clamp(2rem,5vw,3.6rem)] text-ink" text={title} />
      {lede && <Reveal delay={0.2}><p className="mt-6 max-w-2xl text-[clamp(1rem,1.4vw,1.15rem)] leading-relaxed text-mute">{lede}</p></Reveal>}
    </>
  );
}

/* ---------------- Reflect / Understand / Act ---------------- */
export function Layers() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="wrap">
        <Head eyebrow="How it works" title="Reflect. Understand. Act." />
        <Reveal delay={0.15} className="mt-12">
          <ExpandCards items={[
            { key: "reflect", tag: "Layer 01", title: "Reflect", icon: <IconReflect />, body: "The mirror stays a mirror. Reflection is the interface, and the lighting around it is the part Selika physically controls.", more: "The one thing a phone in your hand structurally cannot do is light your face from outside itself." },
            { key: "understand", tag: "Layer 02", title: "Understand", icon: <IconUnderstand />, body: "A camera behind a physical shutter reads appearance, environment and context. Voice carries the intent.", more: "The heavy compute runs on your phone, so the mirror never becomes an obsolete computer bolted to a wall." },
            { key: "act", tag: "Layer 03", title: "Act", icon: <IconAct />, body: "Selika changes the light, draws guidance onto the reflection, and shows what it found.", more: "On the platform side, it runs whatever modules you have given it permission to run." },
          ]} />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- The objection ---------------- */
export function Objection() {
  return (
    <section id="hardware" className="relative py-24 md:py-32">
      <div className="wrap">
        <Head eyebrow="The obvious objection" title="“Isn't this a £200 vanity mirror with extra steps?”"
          lede="It is a fair question and it deserves a straight answer rather than a slogan. Tunable high-CRI mirrors already exist and they are not expensive. Here is the honest accounting of what is different and what is not." />
        <Reveal delay={0.15} className="mt-12">
          <ExpandCards minHeight="16rem" items={[
            { key: "no", tag: "Not the difference", title: "Having a light", body: "Adjustable colour temperature is a commodity. Any claim that Selika's advantage is “better lighting” is a claim a £200 product already answers.", more: "We are not going to pretend otherwise." },
            { key: "part", tag: "Part of the difference", title: "Knowing which light", body: "A dial asks you to already know the answer. Selika takes a destination, whether a place, a time or an event in your calendar, and sets the condition for you.", more: "Then it tells you what changed and what it means for the choices you're making right now." },
            { key: "real", tag: "The real difference", title: "Being programmable", body: "A mirror with a dial is finished the day it ships. Selika is a surface with an open interface: modules, your own models, your own agents.", more: "That is the property a closed appliance cannot copy by adding a feature, and it is why the hardware is worth building." },
          ]} />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Prototype ---------------- */
const SPEC = [
  ["Display", "13.3\" 1080p panel behind semi-transparent dielectric acrylic", "£42"],
  ["Mirror layer", "Dielectric acrylic, display-integrated", "£12"],
  ["Lighting", "95+ CRI tunable LED, 2700K to 6500K", "£7"],
  ["Camera", "1080p wide-angle module, physical shutter", "£11"],
  ["Controller", "ESP32-S3 for peripherals and lighting", "£5"],
  ["Compute", "Companion phone or Raspberry Pi", "existing"],
];
export function Prototype() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="wrap">
        <Head eyebrow="Current build" title="Selika HUD, the prototype"
          lede="The first build is deliberately not a piece of furniture. It is a modular head-up display that mounts to a mirror you already own, with your phone doing the heavy compute. Validate the intelligence and the interaction before committing capital to an appliance." />
        <Reveal delay={0.15} className="mt-12">
          <GlassCard className="overflow-hidden p-0">
            <div className="grid grid-cols-[8rem_1fr_auto] gap-4 border-b border-white/10 px-6 py-3 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-dim md:grid-cols-[10rem_1fr_6rem]">
              <span>Component</span><span>Specification</span><span className="text-right">Est. cost</span>
            </div>
            <Stagger gap={0.07} amount={0.2}>
              {SPEC.map(([a, b, c]) => (
                <Item key={a}>
                  <motion.div className="grid grid-cols-[8rem_1fr_auto] gap-4 border-b border-white/5 px-6 py-4 text-[0.9rem] last:border-0 md:grid-cols-[10rem_1fr_6rem]"
                    whileHover={{ backgroundColor: "rgba(142,197,255,0.05)" }} transition={{ duration: 0.2 }}>
                    <span className="font-medium text-ink">{a}</span><span className="text-mute">{b}</span><span className="tabular text-right text-sky">{c}</span>
                  </motion.div>
                </Item>
              ))}
            </Stagger>
          </GlassCard>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl border-l border-white/10 pl-4 text-[0.78rem] leading-relaxed text-dim">
            Working supplier estimates gathered during research, not a verified bill of materials or a quotation. No prototype has been built, no supplier relationship exists, and no retail price has been set.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Roadmap ---------------- */
const PHASES = [
  { n: "Phase 01", s: "In progress", t: "Selika HUD", d: "A modular attachment for an existing mirror. Proves the lighting control, the reflection-registered interface and the companion architecture at the lowest possible capital cost.", now: true },
  { n: "Phase 02", s: "Next", t: "Selika Mirror", d: "Purpose-built hardware: integrated display, tunable high-CRI lighting, better optics, physical privacy shutter and industrial design that belongs in the room." },
  { n: "Phase 03", s: "Direction", t: "Selika Platform", d: "The mirror as an extensible surface. Module SDK, third-party integrations, bring-your-own model and agent endpoints, open components so the hardware outlives any one software generation." },
];
export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 md:py-32">
      <div className="wrap">
        <Head eyebrow="Sequence" title="HUD, then mirror, then platform." />
        <div className="relative mt-14">
          {/* the line, and a pulse that walks it */}
          <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-sky/50 via-violet/50 to-transparent lg:block" />
          <motion.div aria-hidden className="absolute top-6 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-sky shadow-[0_0_14px_#8EC5FF] lg:block"
            animate={{ left: ["0%", "100%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
          <Stagger className="grid gap-5 lg:grid-cols-3" gap={0.14} amount={0.2}>
            {PHASES.map((p) => (
              <Item key={p.n}>
                <GlassCard tint={p.now} hover className="relative p-7 pt-12">
                  <motion.span className="absolute left-7 top-[1.4rem] h-3 w-3 -translate-y-1/2 rounded-full border-2 border-sky bg-night"
                    animate={p.now ? { boxShadow: ["0 0 0 0 rgba(142,197,255,0.6)", "0 0 0 10px rgba(142,197,255,0)"] } : undefined} transition={{ duration: 1.8, repeat: Infinity }} />
                  <div className="flex items-center justify-between text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-dim">
                    <span>{p.n}</span><span className={p.now ? "text-sky" : ""}>{p.s}</span>
                  </div>
                  <h3 className="h-card mt-3 text-[1.35rem] text-ink">{p.t}</h3>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-mute">{p.d}</p>
                </GlassCard>
              </Item>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="wrap">
        <Head eyebrow="Founder & status" title="Where this actually is." />
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <GlassCard className="flex h-full flex-col p-8 lg:p-10">
              <div className="eyebrow mb-4">The origin</div>
              <p className="text-[1.02rem] leading-relaxed text-ink/90">
                Selika started with a small, stupid frustration. I looked in the mirror one morning, thought I looked good, took a photo to keep it, and the photo was of someone else. That led to a question I could not let go of: why can't a mirror capture what I actually see?
              </p>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-mute">
                Research took that question apart. The mirror-to-photo gap turned out to be a great story and a weak business, but chasing it surfaced the real one. Mirrors are the only interface we all use daily that has never been asked to do anything. The gap worth closing wasn't between the mirror and the camera. It was between the light you get ready in and the light you walk into.
              </p>
              <p className="mt-4 text-[1.02rem] leading-relaxed text-mute">
                I'm a technology degree apprentice in the UK, working in cybersecurity while studying for my degree, which is also why a camera-equipped mirror gets a physical shutter and local-first processing as requirements rather than features.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <GlassButton primary href="#demo">Explore the demo</GlassButton>
                <GlassButton href="#top">Back to top</GlassButton>
              </div>
              {/* the card's own footing: where the project actually stands, at a glance */}
              <div className="mt-auto grid grid-cols-3 gap-3 border-t border-white/10 pt-6" style={{ marginTop: "auto" }}>
                {[["Stage", "Concept & research"], ["Built by", "One person"], ["Next", "First HUD prototype"]].map(([k, v]) => (
                  <div key={k}>
                    <div className="eyebrow mb-1.5 text-[0.62rem]">{k}</div>
                    <div className="h-card text-[0.98rem] leading-snug text-ink">{v}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>
          <Stagger className="flex flex-col gap-5" gap={0.12}>
            {[
              ["Honest status", "Concept and research stage. No prototype built. No customers, revenue, company, supplier relationships or manufacturing contract. The demo on this page is an interface simulation running in your browser, not a recording of a device.", "What does exist: a validated problem, a costed architecture, an adversarial research pass that killed the original thesis, and a build plan scoped to what one person can actually make."],
              ["Privacy, by requirement", "A camera in a bathroom or bedroom is a harder ask than a camera in your pocket, and pretending otherwise is how smart mirrors have failed before.", "Physical shutter, visible capture indicator, no always-on recording, local-first processing, and no cloud path you did not explicitly turn on."],
              ["Alibaba CoCreate Pitch 2026", "Selika is being developed as an entry to the CoCreate Pitch 2026 Student Track, with the London finals in November 2026.", "Nothing has been selected, shortlisted or awarded."],
            ].map(([t, a, b]) => (
              <Item key={t}>
                <GlassCard hover className="p-6 lg:p-7">
                  <h3 className="h-card text-[1.15rem] text-ink">{t}</h3>
                  <p className="mt-2.5 text-[0.86rem] leading-relaxed text-mute">{a}</p>
                  <p className="mt-2.5 text-[0.86rem] leading-relaxed text-mute">{b}</p>
                </GlassCard>
              </Item>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative pb-14 pt-10">
      <div className="wrap">
        <Reveal>
          <GlassCard className="flex flex-wrap items-end justify-between gap-6 p-8">
            <div>
              <Logo />
              <p className="mt-3 max-w-md text-[0.84rem] leading-relaxed text-mute">Today, mirrors reflect you. Selika is designed to understand you.</p>
            </div>
            <p className="text-[0.66rem] uppercase tracking-[0.18em] text-dim">Concept site · prototype &amp; validation stage · 2026</p>
          </GlassCard>
        </Reveal>
      </div>
    </footer>
  );
}
