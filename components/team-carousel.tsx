"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";

const teams = [
  {
    name: "Engineer Team",
    quote: "Setup, data, and the work that makes the car faster.",
    role: "Vehicle dynamics and systems",
  },
  {
    name: "Business Team",
    quote: "Schedules, budgets, and the logistics that keep a race weekend moving.",
    role: "Operations and partnerships",
  },
  {
    name: "Media Team",
    quote: "Photo, video, and the public story of the team.",
    role: "Coverage and brand",
  },
  {
    name: "Racing Team",
    quote: "Racecraft, simulator work, and Collegiate Racing Series competition.",
    role: "Drivers on track",
  },
];

export function TeamCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = (event: MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const goNext = () => setActiveIndex((prev) => (prev + 1) % teams.length);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + teams.length) % teams.length);

  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const current = teams[activeIndex];

  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      <div className="flex min-h-[80vh] items-center justify-center px-6 py-24 md:px-10 md:py-28">
        <div
          ref={containerRef}
          className="relative w-full max-w-5xl"
          onMouseMove={handleMouseMove}
        >
          <motion.div
            className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[12rem] font-bold leading-none tracking-tighter text-foreground/[0.04] md:-left-8 md:text-[22rem]"
            style={{ x: numberX, y: numberY }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {String(activeIndex + 1).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <div className="relative flex">
            <div className="flex flex-col items-center justify-center border-r border-border pr-6 md:pr-16">
              <motion.span
                className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Teams
              </motion.span>
              <div className="relative mt-8 h-32 w-px bg-border">
                <motion.div
                  className="absolute top-0 left-0 w-full origin-top bg-foreground"
                  animate={{
                    height: `${((activeIndex + 1) / teams.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="flex-1 py-8 pl-6 md:py-12 md:pl-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                    {current.name}
                  </span>
                </motion.div>
              </AnimatePresence>

              <div className="relative mb-12 min-h-[140px]">
                <AnimatePresence mode="wait">
                  <motion.blockquote
                    key={activeIndex}
                    className="text-3xl leading-[1.15] font-light tracking-tight text-foreground md:text-5xl"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {current.quote.split(" ").map((word, i) => (
                      <motion.span
                        key={`${activeIndex}-${i}`}
                        className="mr-[0.3em] inline-block"
                        variants={{
                          hidden: { opacity: 0, y: 20, rotateX: 90 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            transition: {
                              duration: 0.5,
                              delay: i * 0.05,
                              ease: [0.22, 1, 0.36, 1],
                            },
                          },
                          exit: {
                            opacity: 0,
                            y: -10,
                            transition: { duration: 0.2, delay: i * 0.02 },
                          },
                        }}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </motion.blockquote>
                </AnimatePresence>
              </div>

              <div className="flex items-end justify-between gap-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="flex items-center gap-4"
                  >
                    <motion.div
                      className="h-px w-8 bg-foreground"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      style={{ originX: 0 }}
                    />
                    <div>
                      <p className="text-base font-medium text-foreground">
                        {current.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{current.role}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous team"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M10 12L6 8L10 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next team"
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-16 left-0 right-0 overflow-hidden opacity-[0.08]">
            <motion.div
              className="flex text-4xl font-bold tracking-tight whitespace-nowrap md:text-6xl"
              animate={{ x: [0, -1000] }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="mx-8">
                  {teams.map((team) => team.name).join(" • ")} •
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
