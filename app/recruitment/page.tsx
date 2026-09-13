"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { RecruitmentChatModal } from "@/components/recruitment-chat-modal";
import { FALL_2026_APPLICATION_URL } from "@/lib/recruitment";
import { cn } from "@/lib/utils";

type TeamRole = {
  id: string;
  title: string;
  image: string;
  accent: string;
  tagline: string;
  overview: string;
  responsibilities: string[];
  idealFor: string;
  timeCommitment?: string;
};

const TEAM_ROLES: TeamRole[] = [
  {
    id: "driver",
    title: "Driver",
    image: "/images/recruitment/driver.png",
    accent: "#1a3a4a",
    tagline: "Racecraft, fitness, and feedback at the limit.",
    overview:
      "Drivers represent Triton Motorsports on track in Collegiate Racing Series events. You will train in simulators, review telemetry and session data, and work with engineers and coaches to translate setup changes into consistent lap times and clean racecraft. Competition seats are earned through preparation, fitness, licensing compliance, and demonstrated performance in practice and qualifying.",
    responsibilities: [
      "Complete simulator and on-track training sessions aligned with CRS event calendars and team development goals",
      "Review telemetry, lap data, and engineer briefings to provide actionable feedback on handling, balance, and tire behavior",
      "Maintain race fitness, focus, and reaction standards required for safe wheel-to-wheel competition",
      "Attend driver briefings, debriefs, and strategy discussions before and after every session",
      "Meet licensing, safety gear, and eligibility requirements set by CRS and event organizers",
      "Execute race starts, overtakes, and defensive lines within team strategy and sporting regulations",
      "Communicate clearly with pit crew and race control during sessions, stops, and incident recovery",
    ],
    idealFor:
      "Students with prior karting, sim racing, track day, or formula-style experience who are disciplined, coachable, and committed to data-driven improvement. You should be comfortable receiving technical feedback and representing the team professionally on and off track.",
    timeCommitment:
      "Typically 8–12 hours per week during the season, with additional event weekends for travel, practice, and competition.",
  },
  {
    id: "engineer",
    title: "Engineer",
    image: "/images/recruitment/engineer.png",
    accent: "#2a4a3a",
    tagline: "Setup, simulation, and data that make the car faster.",
    overview:
      "Engineers translate vehicle dynamics theory into measurable performance gains for CRS competition. You will work across setup, data acquisition, CAD, simulation, and subsystem development—supporting everything from spring changes and aero balance to powertrain reliability. Strong analytical habits and clear documentation are as important as raw technical skill.",
    responsibilities: [
      "Develop and iterate vehicle setup sheets for practice, qualifying, and race conditions",
      "Analyze logged telemetry, temperatures, pressures, and lap metrics to identify performance trends",
      "Support CAD, CFD, or simulation workflows for aero, chassis, and component validation",
      "Collaborate on powertrain, suspension, braking, and electronics subsystems through design and test cycles",
      "Prepare pre-event checklists and post-event engineering reports for continuous improvement",
      "Coordinate with drivers on feedback loops to correlate subjective feel with objective data",
      "Maintain accurate build documentation, part inventories, and compliance with CRS technical rules",
    ],
    idealFor:
      "Mechanical, aerospace, electrical, computer science, or related majors who enjoy structured problem-solving and hands-on validation. Prior FSAE, robotics, CAD, MATLAB, or data analysis experience is valuable but not required if you are eager to learn.",
    timeCommitment:
      "Typically 10–14 hours per week, with heavier load before events and during subsystem integration pushes.",
  },
  {
    id: "pit-crew",
    title: "PIT Crew",
    image: "/images/recruitment/pit-crew.png",
    accent: "#3a2a1a",
    tagline: "Precision stops, safety, and garage execution.",
    overview:
      "PIT Crew members keep the car safe, reliable, and race-ready in the garage and on pit lane. From tire changes and fueling choreography to equipment checks and event logistics at the track, this role demands calm execution under time pressure. Every second in the pit and every torque spec in the garage directly affects race outcomes.",
    responsibilities: [
      "Execute pit stops including tire changes, fueling support, and driver assist within team timing targets",
      "Perform pre-session and post-session safety inspections on wheels, fluids, fasteners, and safety equipment",
      "Organize pit lane equipment, tooling, and spare inventory for fast access during live sessions",
      "Support garage setup, car cover, and transporter loading/unloading at test days and CRS events",
      "Follow standardized checklists for torque specs, fire safety, and personal protective equipment",
      "Communicate with engineers and race control during stops, penalties, and emergency procedures",
      "Assist with trackside logistics such as timing boards, radio checks, and pit crew rotations",
    ],
    idealFor:
      "Detail-oriented teammates who thrive in fast-paced, physical environments and take safety protocols seriously. Prior automotive, karting, or shop experience helps, but reliability, teamwork, and composure matter most.",
    timeCommitment:
      "Typically 6–10 hours per week, with full event weekends during race season and intensive prep before first track outing.",
  },
  {
    id: "media-team",
    title: "Media Team",
    image: "/images/recruitment/media-team.png",
    accent: "#2a2a4a",
    tagline: "Capture the story. Elevate the brand.",
    overview:
      "Media Team members document the team’s engineering, competition, and culture through photography and video. You will cover test days, build milestones, and CRS events—creating assets for social channels, sponsor deliverables, and long-term brand archives. Strong visual instincts and reliable delivery timelines keep our partners and community engaged.",
    responsibilities: [
      "Photograph and film on-track action, garage work, team meetings, and sponsor activations",
      "Edit photo and video packages for Instagram, LinkedIn, website updates, and sponsor reports",
      "Coordinate shot lists and coverage plans with Operations and Content Creator leads before events",
      "Manage file organization, color consistency, and rights clearance for brand and partner use",
      "Support live or near-live event coverage when schedules and connectivity allow",
      "Deliver sponsor-facing media assets according to partnership commitments and deadlines",
      "Maintain equipment readiness including batteries, storage, backups, and field kits for travel",
    ],
    idealFor:
      "Students with photography, videography, or visual storytelling experience who can work independently in dynamic environments. Portfolio work in sports, events, or documentary-style content is a plus.",
    timeCommitment:
      "Typically 6–10 hours per week, with concentrated coverage during test days, reveal moments, and CRS race weekends.",
  },
  {
    id: "content-creator",
    title: "Content Creator",
    image: "/images/recruitment/content-creator.png",
    accent: "#3a1a2a",
    tagline: "Short-form stories that grow our audience.",
    overview:
      "Content Creators turn raw team moments into compelling short-form video and social narratives. You will script, shoot, edit, and publish reels and posts that explain our CRS journey to prospective members, fans, and sponsors. Growth comes from consistent publishing, strong hooks, and authentic behind-the-scenes access across engineering and race weekends.",
    responsibilities: [
      "Plan and produce short-form video for Instagram Reels, TikTok-style clips, and cross-platform repurposing",
      "Edit with captions, pacing, and audio choices optimized for mobile viewing and retention",
      "Collaborate with Media Team for footage while adding narrative framing, hooks, and calls to action",
      "Track post performance and iterate on formats that drive reach, saves, and recruitment interest",
      "Maintain a content calendar aligned with recruitment cycles, events, and sponsor announcements",
      "Write on-brand captions and hashtags that reflect Triton Motorsports voice and CRS positioning",
      "Capture quick-turn behind-the-scenes moments from garage sessions, sim training, and travel days",
    ],
    idealFor:
      "Creators who live in short-form platforms, understand trends without losing brand authenticity, and can ship polished edits on tight deadlines. Basic motion graphics or caption workflow experience is helpful.",
    timeCommitment:
      "Typically 5–8 hours per week, with higher output around recruitment windows and event weekends.",
  },
  {
    id: "operation-team",
    title: "Operation Team",
    image: "/images/recruitment/operation-team.png",
    accent: "#1a2a3a",
    tagline: "Schedules, budgets, and logistics that keep us racing.",
    overview:
      "Operations keeps Triton Motorsports organized across people, time, money, and compliance. You will coordinate travel, event planning, vendor relations, and internal scheduling so engineering and competition teams can focus on performance. Clear communication and dependable follow-through are the backbone of every successful CRS weekend.",
    responsibilities: [
      "Maintain master calendars for practices, meetings, build milestones, and CRS event travel",
      "Support budget tracking, purchase requests, reimbursement workflows, and sponsor fulfillment logistics",
      "Coordinate housing, transport, meals, and on-site schedules for away events and test trips",
      "Manage vendor, venue, and university administrative correspondence for equipment and reservations",
      "Track compliance tasks including waivers, roster documentation, and organizational deadlines",
      "Run meeting agendas, action-item follow-ups, and cross-team status updates with leads",
      "Assist recruitment operations by syncing application timelines, onboarding, and role assignments",
    ],
    idealFor:
      "Highly organized students interested in project management, business, economics, or leadership roles in student organizations. You should be proactive, detail-oriented, and comfortable coordinating across technical and non-technical teammates.",
    timeCommitment:
      "Typically 6–10 hours per week, increasing during travel planning phases and major CRS event preparation.",
  },
];

const roleOverlayVariants = {
  hidden: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.02 },
  },
};

const roleOverlayItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function TeamRoleCard({
  role,
  index,
  onOpen,
}: {
  role: TeamRole;
  index: number;
  onOpen: (role: TeamRole) => void;
}) {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <BlurFade delay={0.1 + index * 0.04} inView>
      <button
        type="button"
        onClick={() => onOpen(role)}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        onFocus={() => setShowOverlay(true)}
        onBlur={() => setShowOverlay(false)}
        className="group relative w-full touch-manipulation overflow-hidden rounded-[clamp(0.75rem,1.2vw,1rem)] text-left outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F0EF]"
        aria-label={`View ${role.title}`}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-[clamp(0.75rem,1.2vw,1rem)] bg-[#eef1f3]",
            "aspect-[3/4]",
            "min-h-[clamp(9.5rem,18vh,14rem)]",
            "sm:min-h-[clamp(11rem,20vh,16rem)]",
            "lg:min-h-[clamp(12rem,22vh,18rem)]",
            "xl:min-h-[clamp(13.5rem,24vh,20rem)]",
            "2xl:min-h-[clamp(15rem,26vh,22rem)]",
          )}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${role.accent} 0%, #0a1218 100%)`,
            }}
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={role.image}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-95 group-focus-visible:scale-105 group-focus-visible:opacity-95"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />

          {/* Title + view more — always visible on phone; hover/focus slide-up on md+ */}
          <motion.div
            className={cn(
              "pointer-events-none absolute left-[clamp(0.55rem,1.1vw,0.85rem)] top-[clamp(0.55rem,1.1vw,0.85rem)] z-10",
              "flex max-w-[calc(100%-1.1rem)] flex-col items-start gap-1",
            )}
            initial={false}
            animate={showOverlay ? "visible" : "hidden"}
            variants={roleOverlayVariants}
          >
            <motion.p
              variants={roleOverlayItemVariants}
              className={cn(
                "text-[clamp(0.95rem,1.6vw,1.35rem)] font-extrabold leading-tight tracking-tight text-[#F2F0EF]",
                "max-md:!translate-y-0 max-md:!opacity-100",
              )}
            >
              {role.title}
            </motion.p>

            <motion.span
              variants={roleOverlayItemVariants}
              className={cn(
                "relative inline-block text-[clamp(0.65rem,1vw,0.75rem)] font-medium tracking-wide text-[#F2F0EF]/90",
                "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left",
                "after:scale-x-0 after:bg-[#F2F0EF]/90 after:transition-transform after:duration-300 after:ease-out",
                "max-md:after:scale-x-100",
                "group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100",
                showOverlay && "after:scale-x-100",
              )}
            >
              view more
            </motion.span>
          </motion.div>
        </div>
      </button>
    </BlurFade>
  );
}

const modalContentVariants = {
  hidden: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const modalContentItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function TeamRoleModal({
  role,
  onClose,
}: {
  role: TeamRole | null;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!role) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [role, onClose]);

  return (
    <AnimatePresence>
      {role && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "relative z-10 flex w-full flex-col overflow-hidden rounded-2xl bg-[#F2F0EF] shadow-2xl",
              "max-h-[min(90dvh,52rem)] max-w-[min(96vw,72rem)]",
              "lg:flex-row",
            )}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full bg-[#F2F0EF]/90 text-[#0a1218] shadow-sm transition hover:bg-[#F2F0EF] lg:bg-black/[0.04] lg:shadow-none lg:hover:bg-black/[0.08]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <div
              className={cn(
                "relative w-full shrink-0 overflow-hidden bg-[#eef1f3]",
                "aspect-[3/4] max-h-[min(42dvh,28rem)]",
                "lg:aspect-[3/4] lg:h-auto lg:max-h-none lg:w-[40%] lg:min-w-[14rem] lg:max-w-[42%]",
              )}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(160deg, ${role.accent} 0%, #0a1218 100%)`,
                }}
                aria-hidden="true"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={role.image}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </div>

            <motion.div
              key={role.id}
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto border-t border-black/[0.06] px-5 pb-6 pt-4 lg:border-t-0 lg:border-l lg:px-8 lg:pb-8 lg:pt-7"
            >
              <motion.div variants={modalContentItemVariants}>
                <h2
                  id={titleId}
                  className="pr-10 text-2xl font-bold tracking-tight text-[#0a1218] lg:text-3xl"
                >
                  {role.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-black/50 lg:text-base">
                  {role.tagline}
                </p>
              </motion.div>

              <motion.p
                variants={modalContentItemVariants}
                className="mt-5 text-sm leading-relaxed text-black/65 lg:text-base"
              >
                {role.overview}
              </motion.p>

              <motion.div variants={modalContentItemVariants} className="mt-6">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-black/40 uppercase">
                  Key responsibilities
                </h3>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-black/70 lg:text-[0.95rem]">
                  {role.responsibilities.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#182B49]/70"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div variants={modalContentItemVariants} className="mt-6">
                <h3 className="text-xs font-semibold tracking-[0.14em] text-black/40 uppercase">
                  Ideal for
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70 lg:text-[0.95rem]">
                  {role.idealFor}
                </p>
              </motion.div>

              {role.timeCommitment ? (
                <motion.div variants={modalContentItemVariants} className="mt-6">
                  <h3 className="text-xs font-semibold tracking-[0.14em] text-black/40 uppercase">
                    Time commitment
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-black/70 lg:text-[0.95rem]">
                    {role.timeCommitment}
                  </p>
                </motion.div>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function RecruitmentPage() {
  const [selected, setSelected] = useState<TeamRole | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSeed, setChatSeed] = useState<string | null>(null);
  const [chatSeedKey, setChatSeedKey] = useState(0);

  const openChat = (message: string) => {
    setChatSeed(message);
    setChatSeedKey((k) => k + 1);
    setChatOpen(true);
  };

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-x-clip bg-[#F2F0EF] text-[#0a1218]">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <DotPattern
            className="opacity-40 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_20%,black,transparent)]"
            width={18}
            height={18}
            cr={1}
          />
        </div>

        {/* Three content bands + CTA floating in the headline→chat gap */}
        <div
          className={cn(
            "relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[110rem] flex-col",
            "justify-evenly",
            "px-4 sm:px-6 md:px-10 lg:px-12 xl:px-[clamp(1.5rem,4vw,3.5rem)]",
          )}
          style={{
            paddingTop: "clamp(5.25rem, 9vh, 7.5rem)",
            paddingBottom: "clamp(1.25rem, 3vh, 2.75rem)",
            gap: "clamp(1.25rem, 3.5vh, 2.75rem)",
          }}
        >
          {/* Band 1 — Headline (top offset for even spacing vs CTA + chat) */}
          <section className="mt-[2.25rem] flex shrink-0 flex-col items-center text-center">
            <BlurFade delay={0.05}>
              <h1
                className={cn(
                  "text-balance font-bold text-[#0a1218]",
                  "text-[clamp(3.25rem,7.5vw,6.75rem)]",
                  "leading-[1.05] tracking-[-0.04em]",
                )}
              >
                Join the team.
              </h1>
            </BlurFade>
          </section>

          {/* CTA — own flex child so justify-evenly centers it in the headline↔chat gap */}
          <div className="flex shrink-0 justify-center">
            <BlurFade delay={0.1}>
              <a
                href={FALL_2026_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full bg-[#182B49]",
                  "px-[clamp(1.25rem,2vw,1.75rem)] py-[clamp(0.65rem,1.2vh,0.85rem)]",
                  "text-[clamp(0.875rem,1.1vw,1rem)] font-medium tracking-wide text-[#F2F0EF]",
                  "shadow-[0_10px_28px_-14px_rgba(24,43,73,0.45),0_2px_6px_-2px_rgba(24,43,73,0.25)]",
                  "transition hover:bg-[#121F38] focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[#182B49]/35 focus-visible:ring-offset-2",
                  "touch-manipulation",
                )}
              >
                Fall 2026 Application
                <ArrowUpRight className="size-4 opacity-80" aria-hidden="true" />
              </a>
            </BlurFade>
          </div>

          {/* Band 2 — Chat box */}
          <section className="mx-auto flex w-full max-w-[min(100%,42rem)] shrink-0 flex-col items-center text-center xl:max-w-[min(100%,48rem)]">
            <BlurFade delay={0.2} className="w-full">
              <AIInputWithSearch
                onSubmit={(value) => {
                  openChat(value);
                }}
              />
            </BlurFade>
          </section>

          {/* Band 3 — Role / team cards */}
          <section className="w-full shrink-0">
            <div
              className={cn(
                "mx-auto grid w-full",
                "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
                "gap-[clamp(0.55rem,1.4vw,1.15rem)]",
              )}
            >
              {TEAM_ROLES.map((role, index) => (
                <TeamRoleCard
                  key={role.id}
                  role={role}
                  index={index}
                  onOpen={setSelected}
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <TeamRoleModal role={selected} onClose={() => setSelected(null)} />
      <RecruitmentChatModal
        open={chatOpen}
        initialMessage={chatSeed}
        seedKey={chatSeedKey}
        onClose={() => {
          setChatOpen(false);
          setChatSeed(null);
        }}
      />
      <SiteFooter />
    </>
  );
}
