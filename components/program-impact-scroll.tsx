"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";

type ImpactStep = {
  id: string;
  index: string;
  title: string;
  body: string;
  detail: string;
};

const IMPACT_STEPS: ImpactStep[] = [
  {
    id: "culture",
    index: "01",
    title: "Student-led team culture",
    body: "Triton Motorsports is run by students who own the season — from recruiting and training to race-day decisions. Leadership is earned on the shop floor, not handed down.",
    detail: "Captains, leads, and rookies share one standard: show up prepared.",
  },
  {
    id: "engineering",
    index: "02",
    title: "Engineering the car",
    body: "Chassis, powertrain, aero, and systems work happen in parallel. You learn to specify parts, validate setups, and turn telemetry into the next change on the car.",
    detail: "Build nights. Dyno notes. Setup sheets that actually get used.",
  },
  {
    id: "drive",
    index: "03",
    title: "Drive & race craft",
    body: "Drivers train braking points, race craft, and consistency under Collegiate Racing Series pressure — with engineers and coaches in the loop every session.",
    detail: "Seat time with purpose. Feedback that sticks between heats.",
  },
  {
    id: "pit",
    index: "04",
    title: "Pit crew operations",
    body: "Stops are choreographed. Tire changes, fuel, and safety checks run on a clock — because a clean pit lane is as competitive as a clean lap.",
    detail: "Roles, rehearsals, and zero-drama handoffs on race weekend.",
  },
  {
    id: "media",
    index: "05",
    title: "Media, content & ops",
    body: "The program only works if the story and the logistics keep pace. Media, content, and operations keep sponsors informed, members aligned, and race weekends executable.",
    detail: "Coverage, calendars, and the quiet work that makes the loud moments possible.",
  },
];

function StepPanel({ step }: { step: ImpactStep }) {
  return (
    <motion.article
      key={step.id}
      initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(3px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col justify-center py-16 md:py-24"
    >
      <p className="font-mono text-[11px] tracking-[0.22em] text-black/35 uppercase">
        / {step.index}
      </p>
      <h3 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-[#0a1218] md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
        {step.title}
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-black/55 md:text-lg">
        {step.body}
      </p>
      <p className="mt-6 max-w-sm border-l border-black/15 pl-4 text-sm leading-relaxed text-black/40">
        {step.detail}
      </p>
    </motion.article>
  );
}

function MobileStep({ step, index }: { step: ImpactStep; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="border-t border-black/8 py-12"
    >
      <p className="font-mono text-[11px] tracking-[0.22em] text-black/35 uppercase">
        / {step.index}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#0a1218]">
        {step.title}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-black/55">{step.body}</p>
      <p className="mt-5 border-l border-black/15 pl-4 text-sm leading-relaxed text-black/40">
        {step.detail}
      </p>
    </motion.article>
  );
}

export function ProgramImpactScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const n = IMPACT_STEPS.length;
    const idx = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    setActiveIndex(idx);
  });

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      aria-label="Program impact"
      className="relative bg-[#F2F0EF] text-[#0a1218]"
    >
      {/* Mobile: stacked narrative */}
      <div className="px-6 pb-8 pt-28 md:hidden">
        <p className="max-w-sm text-2xl font-semibold tracking-tight text-[#0a1218]">
          We build our programs to deliver impact:
        </p>
        <div className="mt-10">
          {IMPACT_STEPS.map((step, i) => (
            <MobileStep key={step.id} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* Desktop: sticky left + scroll-driven right */}
      <div
        ref={containerRef}
        className="relative hidden md:block"
        style={{ height: `${IMPACT_STEPS.length * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen overflow-hidden">
          <div className="relative flex w-[42%] shrink-0 flex-col justify-center border-r border-black/[0.06] bg-[#f7f8f9] px-10 lg:px-16 xl:px-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 30%, rgba(10,18,24,0.06), transparent 55%), radial-gradient(circle at 80% 70%, rgba(10,18,24,0.04), transparent 50%)",
              }}
              aria-hidden
            />
            <p className="relative max-w-[16ch] text-[clamp(1.75rem,2.8vw,2.75rem)] font-semibold leading-[1.15] tracking-tight text-[#0a1218]">
              We build our programs to deliver impact:
            </p>

            <div className="relative mt-12 flex flex-col gap-2.5" aria-hidden>
              {IMPACT_STEPS.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-px transition-all duration-500",
                      i === activeIndex
                        ? "w-8 bg-[#0a1218]"
                        : "w-4 bg-black/15",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-[0.18em] uppercase transition-colors duration-500",
                      i === activeIndex ? "text-[#0a1218]" : "text-black/30",
                    )}
                  >
                    {step.index}
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/[0.06]">
              <motion.div
                className="h-full bg-[#0a1218]"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden px-10 lg:px-16 xl:px-20">
            <div className="relative h-full">
              <AnimatePresence mode="wait" initial={false}>
                <StepPanel
                  key={IMPACT_STEPS[activeIndex].id}
                  step={IMPACT_STEPS[activeIndex]}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
