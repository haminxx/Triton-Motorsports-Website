"use client";

import * as React from "react";
import { Flag, Landmark, Share2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AboutSectorId = "about" | "crs" | "museum";

type SectorStyle = {
  id: AboutSectorId;
  label: string;
  heading: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string;
  hoverGradient: string;
};

export const ABOUT_SECTORS: SectorStyle[] = [
  {
    id: "about",
    label: "About Triton Motorsports",
    heading: "About Triton Motorsports",
    icon: Users,
    gradient: "from-[#182B49] to-[#3d5a80]",
    hoverGradient: "from-[#1e3a5f] to-[#4a6d96]",
  },
  {
    id: "crs",
    label: "CRS & IMSA",
    heading: "CRS (Collegiate Racing Series) & IMSA",
    icon: Flag,
    gradient: "from-[#0f2744] to-[#1e5a8a]",
    hoverGradient: "from-[#163656] to-[#2a73ad]",
  },
  {
    id: "museum",
    label: "San Diego Automotive Museum",
    heading: "San Diego Automotive Museum",
    icon: Landmark,
    gradient: "from-[#1c3344] to-[#4a6678]",
    hoverGradient: "from-[#254355] to-[#5b7a8c]",
  },
];

export interface AboutSectorDockProps {
  activeId: AboutSectorId;
  onSelect: (id: AboutSectorId) => void;
}

export function AboutSectorDock({ activeId, onSelect }: AboutSectorDockProps) {
  const [hoveredId, setHoveredId] = React.useState<AboutSectorId | null>(null);
  const [mobileDockOpen, setMobileDockOpen] = React.useState(false);

  const select = (id: AboutSectorId) => {
    onSelect(id);
    setMobileDockOpen(false);
  };

  return (
    <>
      {/* ===== Desktop View ===== */}
      <nav
        aria-label="About sections"
        className="fixed top-[35%] left-0 z-40 hidden lg:flex flex-col"
      >
        <ul className="space-y-3" role="tablist">
          {ABOUT_SECTORS.map((sector) => {
            const Icon = sector.icon;
            const isActive = activeId === sector.id;
            const isHovered = hoveredId === sector.id;
            const expanded = isActive || isHovered;

            return (
              <li
                key={sector.id}
                onMouseEnter={() => setHoveredId(sector.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group"
              >
                <button
                  type="button"
                  id={`about-tab-${sector.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`about-sector-${sector.id}`}
                  onClick={() => select(sector.id)}
                  className={cn(
                    "relative flex h-14 w-80 items-center justify-between overflow-hidden rounded-r-xl border border-black/10 px-4 shadow-md transition-all duration-500 ease-out hover:shadow-lg",
                    expanded ? "ml-0" : "ml-[-264px]",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-90 transition-all duration-500",
                      isHovered || isActive
                        ? sector.hoverGradient
                        : sector.gradient,
                    )}
                  />
                  <span className="relative z-10 text-left text-sm font-semibold tracking-wide text-white transition-all duration-300 group-hover:tracking-widest">
                    {sector.label}
                  </span>
                  <Icon
                    size={22}
                    className="relative z-10 shrink-0 text-white drop-shadow-sm transition-transform duration-500 group-hover:scale-125"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ===== Mobile Floating Dock ===== */}
      <div className="fixed right-6 bottom-6 z-50 lg:hidden">
        {mobileDockOpen && (
          <div
            className="fixed inset-0 bg-[#0a1218]/40 backdrop-blur-sm"
            onClick={() => setMobileDockOpen(false)}
          />
        )}

        <div className="relative">
          <div
            className={cn(
              "absolute right-0 bottom-20 flex flex-col-reverse gap-3 transition-all duration-500",
              mobileDockOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-8 opacity-0",
            )}
          >
            {ABOUT_SECTORS.map((sector, index) => {
              const Icon = sector.icon;
              const isActive = activeId === sector.id;
              return (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => select(sector.id)}
                  className="group relative ml-auto"
                  style={{
                    transitionDelay: mobileDockOpen ? `${index * 50}ms` : "0ms",
                  }}
                  aria-label={sector.label}
                  aria-pressed={isActive}
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-gradient-to-br shadow-lg transition-transform duration-300 hover:scale-110",
                      sector.gradient,
                      isActive && "ring-2 ring-[#182B49] ring-offset-2 ring-offset-[#F2F0EF]",
                    )}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="absolute top-1/2 right-16 -translate-y-1/2 rounded-md bg-[#0a1218] px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#F2F0EF] opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    {sector.label}
                    <div className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#0a1218]" />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileDockOpen(!mobileDockOpen)}
            className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#182B49] shadow-2xl transition-all duration-300 active:scale-95"
            aria-label="Toggle about sections"
            aria-expanded={mobileDockOpen}
          >
            <div className="relative z-10">
              {mobileDockOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Share2 size={24} className="text-white" />
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}

export default AboutSectorDock;
