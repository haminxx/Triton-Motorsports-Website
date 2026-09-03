"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Track = {
  id: string;
  title: string;
  description: string;
};

/** Full Miata stack art — keeps native aspect ratio as the page resizes. */
const MIATA_IMAGE = "/images/program/miata-continuous.png";
const MIATA_WIDTH = 535;
const MIATA_HEIGHT = 1024;

const DEFAULT_TRACKS: Track[] = [
  {
    id: "engineering",
    title: "Engineering & Crew",
    description:
      "Build, maintain, and race-prep the car — chassis, systems, and pit execution.",
  },
  {
    id: "driving",
    title: "Driving & Sim",
    description:
      "Racecraft, simulator training, and data feedback that shave tenths on track.",
  },
  {
    id: "media",
    title: "Media & Creative",
    description:
      "Capture the season through photo, video, and brand storytelling.",
  },
  {
    id: "operations",
    title: "Operations & Business",
    description:
      "Sponsors, logistics, and the systems that keep race weekends running.",
  },
];

function trackTone(index: number) {
  return index % 2 === 0 ? "#0c0c0c" : "#8a6f3f";
}

function EditableText({
  value,
  onChange,
  className,
  multiline = false,
  as: Tag = "span",
  placeholder = "Click to edit…",
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  multiline?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  placeholder?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) {
      el.textContent = value || "";
    }
  }, [value]);

  const commit = () => {
    const next = (ref.current?.textContent ?? "").replace(/\u00a0/g, " ");
    if (next !== value) onChange(next);
  };

  return (
    <Tag
      ref={ref as never}
      role="textbox"
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      aria-label={placeholder}
      data-placeholder={placeholder}
      onClick={(e: MouseEvent) => e.stopPropagation()}
      onMouseDown={(e: MouseEvent) => e.stopPropagation()}
      onKeyDown={(e: KeyboardEvent) => {
        e.stopPropagation();
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      onBlur={commit}
      className={cn(
        "empty:before:pointer-events-none empty:before:text-current/35 empty:before:content-[attr(data-placeholder)]",
        "cursor-text rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        multiline && "whitespace-pre-wrap",
        className,
      )}
    />
  );
}

function TrackCardOverlay({
  track,
  index,
  onTitleChange,
  onDescriptionChange,
  large = false,
}: {
  track: Track;
  index: number;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  large?: boolean;
}) {
  const tone = trackTone(index);
  const number = String(index + 1).padStart(2, "0");

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[42%] sm:w-[38%]"
        style={{
          background: `linear-gradient(90deg, ${tone}cc 0%, ${tone}88 40%, transparent 100%)`,
        }}
      />

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-3 top-0 select-none font-semibold tracking-tight text-white/[0.1] sm:left-4",
          large
            ? "text-[6rem] leading-none md:text-[8rem]"
            : "text-[clamp(2.75rem,12vw,4.75rem)] leading-none",
        )}
      >
        {number}
      </span>

      <div
        className={cn(
          "relative z-10 flex h-full max-w-[48%] flex-col justify-start",
          large ? "gap-3 p-7 md:gap-4 md:p-9" : "gap-1 p-3 sm:gap-1.5 sm:p-4 md:p-5",
        )}
      >
        <EditableText
          as={large ? "h2" : "h3"}
          value={track.title}
          onChange={onTitleChange}
          className={cn(
            "font-semibold tracking-tight text-white",
            large
              ? "text-3xl md:text-4xl"
              : "text-[clamp(1rem,2.8vw,1.65rem)]",
          )}
          placeholder="Track name"
        />
        <EditableText
          as="p"
          multiline
          value={track.description}
          onChange={onDescriptionChange}
          className={cn(
            "max-w-md leading-snug text-white/70",
            large
              ? "text-base md:text-lg"
              : "text-[clamp(0.7rem,1.6vw,0.95rem)] line-clamp-3 sm:line-clamp-4",
          )}
          placeholder="Add a short description…"
        />
      </div>
    </>
  );
}

export function TeamTrackStack({ className }: { className?: string }) {
  const titleId = useId();
  const [headline, setHeadline] = useState("Team");
  const [subtitle, setSubtitle] = useState(
    "Explore the diverse tracks you can pursue. Work together to win the race. No prior experience is required to join.",
  );
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selected = tracks.find((t) => t.id === selectedId) ?? null;
  const selectedIndex = selected
    ? tracks.findIndex((t) => t.id === selected.id)
    : -1;
  const count = Math.max(tracks.length, 1);

  const updateTrack = useCallback(
    (id: string, patch: Partial<Pick<Track, "title" | "description">>) => {
      setTracks((prev) =>
        prev.map((track) => (track.id === id ? { ...track, ...patch } : track)),
      );
    },
    [],
  );

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  return (
    <section
      className={cn("relative", className)}
      aria-labelledby={titleId}
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="max-w-2xl">
          <EditableText
            as="h1"
            value={headline}
            onChange={setHeadline}
            className="text-5xl font-semibold tracking-tight text-[#0a1218] md:text-6xl lg:text-7xl"
            placeholder="Section title"
          />
          <EditableText
            as="p"
            multiline
            value={subtitle}
            onChange={setSubtitle}
            className="mt-4 max-w-xl text-base leading-relaxed text-black/55 md:text-lg"
            placeholder="Section description"
          />
        </div>

        {/*
          Stack height follows the Miata art aspect ratio as width changes.
          One full-bleed image underneath; equal flex bands clip/hit-test each track.
        */}
        <div
          className="relative mt-10 w-full overflow-hidden rounded-[1.25rem] md:mt-12 md:rounded-[1.5rem]"
          style={{ aspectRatio: `${MIATA_WIDTH} / ${MIATA_HEIGHT}` }}
        >
          <img
            src={MIATA_IMAGE}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
          />

          <ul className="absolute inset-0 flex list-none flex-col p-0">
            {tracks.map((track, index) => {
              const isHovered = hoveredId === track.id;
              return (
                <li
                  key={track.id}
                  className={cn(
                    "relative min-h-0 flex-1",
                    index < count - 1 && "border-b border-white/25",
                  )}
                >
                  <motion.button
                    type="button"
                    onClick={() => setSelectedId(track.id)}
                    onMouseEnter={() => setHoveredId(track.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(track.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-label={`Open ${track.title || "track"} details`}
                    className={cn(
                      "relative h-full w-full origin-center cursor-pointer overflow-hidden text-left outline-none",
                      "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-inset",
                    )}
                    animate={{ scale: isHovered ? 1.02 : 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{ zIndex: isHovered ? 2 : 1 }}
                  >
                    <TrackCardOverlay
                      track={track}
                      index={index}
                      onTitleChange={(title) =>
                        updateTrack(track.id, { title })
                      }
                      onDescriptionChange={(description) =>
                        updateTrack(track.id, { description })
                      }
                    />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {selected && selectedIndex >= 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close track details"
              className="absolute inset-0 bg-[#0a1218]/55 backdrop-blur-[2px]"
              onClick={() => setSelectedId(null)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={selected.title || "Track details"}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/10 shadow-2xl"
              style={{
                aspectRatio: `${MIATA_WIDTH} / ${MIATA_HEIGHT / count}`,
                backgroundColor: trackTone(selectedIndex),
              }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="absolute -right-1 -top-12 z-20 inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-[#0a1218] shadow-md transition hover:bg-white md:-right-3 md:-top-3"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

              {/* Same even slice of the car, enlarged */}
              <img
                src={MIATA_IMAGE}
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute left-0 w-full max-w-none select-none object-fill"
                style={{
                  height: `${count * 100}%`,
                  top: 0,
                  transform: `translateY(-${(selectedIndex / count) * 100}%)`,
                }}
              />

              <TrackCardOverlay
                track={selected}
                index={selectedIndex}
                large
                onTitleChange={(title) =>
                  updateTrack(selected.id, { title })
                }
                onDescriptionChange={(description) =>
                  updateTrack(selected.id, { description })
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
