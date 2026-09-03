"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  OrbitCardStack,
  type OrbitStackItem,
} from "@/components/ui/orbit-card-stack";
import { PageEnter } from "@/components/page-motion";
import { springTransition } from "@/components/spring-underline";
import { cn } from "@/lib/utils";

const emptyOrbitCard = (accent: string): OrbitStackItem => ({
  name: "",
  role: "",
  description: "",
  accent,
  initials: "",
  stat: "",
});

/** Index 1 = Stephanie (left-of-center), index 2 = Christian (center), index 3 = Vinh Phong (right-of-center). */
const orbitLeaders: OrbitStackItem[] = [
  emptyOrbitCard("#f8d66d"),
  {
    name: "Stephanie Kovalchuk-Lum",
    role: "CogSci - Design & Interaction",
    description:
      "Co-founded UCSD × CRS and sets the direction for the collegiate racing team, mainly the engineering track.",
    accent: "#78dcca",
    initials: "SK",
    stat: "Eighth College",
    image: "/images/team/stephanie-kovalchuk-lum.png",
    href: "https://www.linkedin.com/in/stephaniekovalchuk-lum/",
  },
  {
    name: "Christian Lee",
    role: "CogSci - Design & Interaction",
    description:
      "Co-founded UCSD × CRS and sets the direction for the collegiate racing team.",
    accent: "#f3f1ea",
    initials: "CL",
    stat: "Revelle College",
    image: "/images/team/christian-lee.jpg",
    href: "https://www.linkedin.com/in/christian-j-l/",
  },
  {
    name: "Vinh Phong",
    role: "Business Economics",
    description:
      "Guides CRS drivers and educates the team on racing principles, track craft, and the fundamentals of continuous learning on and off the track.",
    accent: "#b9a7ff",
    initials: "VP",
    stat: "Seventh College",
  },
  emptyOrbitCard("#ff9d77"),
];

const teamFilters = [
  "Driver",
  "Engineer",
  "PIT Crew",
  "Media Team",
  "Content Creator",
  "Operation Team",
] as const;

type TeamFilter = (typeof teamFilters)[number];

type TeamMember = {
  name: string;
  role: string;
  filter: TeamFilter;
  image?: string;
};

/** Four placeholder slots per filter until real roster data is ready. */
const teamMembers: TeamMember[] = teamFilters.flatMap((filter) =>
  Array.from({ length: 4 }, () => ({
    name: "Coming Soon",
    role: "N/A",
    filter,
  })),
);

function MemberPortrait({ member }: { member: TeamMember }) {
  if (member.image) {
    return (
      <img
        src={member.image}
        alt={member.name}
        className="aspect-square w-full object-cover"
      />
    );
  }

  // Minimal blank placeholder — no initials that imply a real person
  return (
    <div
      aria-hidden
      className="aspect-square w-full bg-gradient-to-br from-[#e8ecef] via-[#dfe4e8] to-[#d0d7dc]"
    />
  );
}

function TeamProfileCard({ member }: { member: TeamMember }) {
  return (
    <article className="flex flex-col items-center text-center">
      <div className="w-full overflow-hidden bg-[#eef1f3]">
        <MemberPortrait member={member} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#0a1218] md:text-xl">
        {member.name}
      </h3>
      <p className="mt-1.5 text-sm text-black/55 md:text-base">{member.role}</p>
    </article>
  );
}

export default function AboutUsPage() {
  const [headline, setHeadline] = useState("Founder");
  const [activeFilter, setActiveFilter] = useState<TeamFilter>("Driver");

  const filteredMembers = teamMembers.filter(
    (member) => member.filter === activeFilter,
  );

  return (
    <>
      <SiteHeader />
      <main className="overflow-x-clip bg-[#F2F0EF] text-[#0a1218]">
        <section className="relative z-0 px-6 pb-4 pt-32 md:pb-6 md:pt-40">
          <div className="mx-auto max-w-7xl text-center">
            <div className="relative mx-auto flex min-h-[5.5rem] items-center justify-center md:min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={headline}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22 }}
                  className="max-w-5xl text-balance text-5xl font-semibold tracking-tight text-[#0a1218] md:text-7xl lg:text-8xl"
                >
                  {headline}
                </motion.h1>
              </AnimatePresence>
            </div>
          </div>

          <OrbitCardStack
            items={orbitLeaders}
            defaultActiveIndex={2}
            mobileOrder={[2, 1, 3, 0, 4]}
            className="-mt-6 md:-mt-4"
            onActiveChange={(item) => {
              if (item.name === "Christian Lee") {
                setHeadline("Founder");
              } else if (item.name === "Stephanie Kovalchuk-Lum") {
                setHeadline("Co-founder");
              } else if (item.name === "Vinh Phong") {
                setHeadline("Driver Coach");
              } else if (item.name.trim()) {
                setHeadline(item.name);
              } else {
                setHeadline("Coming Soon!");
              }
            }}
            onCollapse={() => setHeadline("Meet our team!")}
          />
        </section>

        <PageEnter>
        <section className="relative z-0 bg-[#F2F0EF] px-6 pb-28 pt-6 md:pt-8">
          <div className="mx-auto max-w-7xl">
            <div
              role="tablist"
              aria-label="Team filters"
              className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-black/10 bg-[#f4f6f7] p-1.5 md:gap-1.5"
            >
              {teamFilters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "relative cursor-grab rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-wide outline-none transition-colors active:cursor-grabbing md:px-3 md:py-1.5 md:text-sm",
                      "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F0EF]",
                      isActive
                        ? "text-[#F2F0EF]"
                        : "text-black/55 hover:text-black",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="team-filter-pill"
                        className="absolute inset-0 rounded-lg bg-[#0a1218]"
                        transition={springTransition}
                      />
                    )}
                    <span className="relative z-10">{filter}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {filteredMembers.map((member, index) => (
                <TeamProfileCard
                  key={`${member.filter}-${index}`}
                  member={member}
                />
              ))}
            </div>
          </div>
        </section>
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
