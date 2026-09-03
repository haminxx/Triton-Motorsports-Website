"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Loader2,
  Paperclip,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import {
  playBackgroundVideo,
  primeBackgroundVideo,
  registerMobileBackgroundVideo,
  unlockBackgroundVideosFromUserGesture,
  unregisterMobileBackgroundVideo,
} from "@/lib/mobile-video-unlock";
import { submitContactViaWeb3Forms } from "@/lib/web3forms";

/** Shared cream field surface — ~70% opacity over blurred video + inset depth. */
const fieldSurface =
  "rounded-xl border border-[#F2F0EF]/25 bg-[#F2F0EF]/70 text-[#0a1218] shadow-[inset_0_2px_10px_rgba(10,18,24,0.12),0_8px_28px_-16px_rgba(0,0,0,0.45)] outline-none transition-[box-shadow,border-color,background-color] placeholder:text-[#0a1218]/40 focus:border-[#F2F0EF]/50 focus:bg-[#F2F0EF]/90 focus:shadow-[inset_0_2px_12px_rgba(10,18,24,0.14),0_8px_28px_-16px_rgba(0,0,0,0.45)] focus:ring-2 focus:ring-[#F2F0EF]/40";

const ORGANIZATION_TYPES = [
  "Student Organization",
  "Non-Profit / NGO",
  "Corporate / Industry",
  "Academic / University Department",
  "Other",
] as const;

const INQUIRY_FOCUSES = [
  "Co-hosted Event",
  "Workshop / Speaker Session",
  "Sponsorship / Funding",
  "Recruitment / Internship",
  "General Partnership",
  "Other",
] as const;

const TIMEFRAMES = [
  "Urgent (within 2 weeks)",
  "1 month",
  "1 - 2 months",
  "3+ months",
  "Flexible / Not sure yet",
] as const;

const MAX_ATTACHMENTS = 5;
const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
] as const;
const ACCEPTED_ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type OrganizationType = (typeof ORGANIZATION_TYPES)[number];
type InquiryFocus = (typeof INQUIRY_FOCUSES)[number];
type Timeframe = (typeof TIMEFRAMES)[number];

type AttachmentFile = {
  id: string;
  file: File;
};

/** Shape ready for a future Firestore `contactSubmissions` write. */
type ContactSubmissionPayload = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  organizationType: OrganizationType | null;
  inquiryFocus: InquiryFocus | null;
  budgetAllocated: boolean | null;
  timeframe: Timeframe | null;
  message: string;
  attachmentNames: string[];
  privacyAgreed: boolean;
  createdAt: string;
};

const SECTION_COUNT = 4;
const easePremium = [0.22, 1, 0.36, 1] as const;

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors md:px-5 md:py-2.5",
        selected
          ? "border-[#182B49] bg-[#182B49] text-[#F2F0EF] shadow-md shadow-black/25"
          : "border-[#F2F0EF]/30 bg-[#F2F0EF]/70 text-[#0a1218]/80 hover:border-[#F2F0EF]/50 hover:bg-[#F2F0EF]/85 hover:text-[#0a1218]",
      )}
    >
      {label}
    </button>
  );
}

function SoftInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("w-full px-4 py-3.5 text-sm", fieldSurface, className)}
      {...props}
    />
  );
}


function ContactSectionStepper({
  activeSection,
  onSelect,
}: {
  activeSection: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      aria-label="Form progress"
      className="pointer-events-none fixed right-2 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-3 md:right-6 md:gap-3.5"
    >
      {Array.from({ length: SECTION_COUNT }, (_, index) => {
        const isDone = index < activeSection;
        const isCurrent = index === activeSection;

        return (
          <button
            key={index}
            type="button"
            aria-label={`Go to section ${index + 1} of ${SECTION_COUNT}`}
            aria-current={isCurrent ? "step" : undefined}
            onClick={() => onSelect(index)}
            className={cn(
              "pointer-events-auto w-[2px] rounded-full transition-all duration-300 ease-out md:w-[3px]",
              isDone && "bg-[#182B49]",
              !isDone && "bg-[#F2F0EF]",
              isCurrent && "h-7 md:h-8",
              !isCurrent && "h-5 md:h-6",
              isCurrent && !isDone && "opacity-100 shadow-[0_0_10px_rgba(242,240,239,0.35)]",
              !isCurrent && !isDone && "opacity-45",
              !isCurrent && isDone && "opacity-90",
            )}
          />
        );
      })}
    </nav>
  );
}

function ContactSection({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-dvh w-full items-center justify-center overflow-x-hidden px-6 py-16 md:px-10 md:py-20",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key="section-content"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.7, ease: easePremium }}
            className="mx-auto w-full max-w-2xl"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [organizationType, setOrganizationType] =
    useState<OrganizationType | null>(null);
  const [inquiryFocus, setInquiryFocus] = useState<InquiryFocus | null>(null);
  const [budgetAllocated, setBudgetAllocated] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe | null>(null);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success"
  >("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const showBudgetCheckbox =
    inquiryFocus !== null && inquiryFocus !== "Other";

  function selectOrganizationType(type: OrganizationType) {
    setOrganizationType((prev) => (prev === type ? null : type));
  }

  function handleInquiryFocusSelect(option: InquiryFocus) {
    setInquiryFocus((prev) => {
      const next = prev === option ? null : option;
      if (next === null || next === "Other") {
        setBudgetAllocated(false);
      }
      return next;
    });
  }

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList?.length) return;

    const incoming = Array.from(fileList);
    const errors: string[] = [];
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!isAcceptedFile(file)) {
        errors.push(
          `"${file.name}" is not a supported format. Use PDF, DOC/DOCX, images, PPT, XLS, TXT, or ZIP.`,
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(
          `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`,
        );
        continue;
      }
      accepted.push(file);
    }

    setAttachments((prev) => {
      const remaining = MAX_ATTACHMENTS - prev.length;
      if (remaining <= 0) {
        errors.push(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        return prev;
      }
      if (accepted.length > remaining) {
        errors.push(
          `Only ${remaining} more file${remaining === 1 ? "" : "s"} can be added (max ${MAX_ATTACHMENTS}).`,
        );
      }
      const toAdd = accepted.slice(0, remaining).map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
      }));
      return [...prev, ...toAdd];
    });

    setAttachmentError(errors[0] ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    setAttachmentError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "loading" || submitState === "success") return;

    const attachmentNames = attachments.map((item) => item.file.name);
    const payload: ContactSubmissionPayload = {
      firstName,
      lastName,
      organization,
      email,
      organizationType,
      inquiryFocus,
      budgetAllocated: showBudgetCheckbox ? budgetAllocated : null,
      timeframe,
      message,
      attachmentNames,
      privacyAgreed,
      createdAt: new Date().toISOString(),
    };

    setSubmitError(null);
    setSubmitState("loading");

    const result = await submitContactViaWeb3Forms({
      firstName,
      lastName,
      organization,
      email,
      organizationType,
      inquiryFocus,
      budgetAllocated: showBudgetCheckbox ? budgetAllocated : null,
      timeframe,
      message,
      attachmentNames,
      privacyAgreed,
    });

    if (!result.ok) {
      console.error("[contact] Web3Forms error:", result.error, payload);
      setSubmitError(result.error);
      setSubmitState("idle");
      return;
    }

    setSubmitState("success");
  }

  const goToSection = useCallback((index: number) => {
    const next = Math.max(0, Math.min(SECTION_COUNT - 1, index));
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const section = scroller.querySelectorAll<HTMLElement>("[data-contact-section]")[
      next
    ];
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(next);
  }, []);

  // Lock document scroll — only the snap scroller may scroll.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    registerMobileBackgroundVideo(video);
    primeBackgroundVideo(video);

    const tryPlay = () => {
      void playBackgroundVideo(video);
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    return () => {
      unregisterMobileBackgroundVideo(video);
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScrollerGesture = () => {
      unlockBackgroundVideosFromUserGesture();
    };

    scroller.addEventListener("scroll", onScrollerGesture, { passive: true });
    scroller.addEventListener("touchmove", onScrollerGesture, { passive: true });

    const sections = scroller.querySelectorAll<HTMLElement>(
      "[data-contact-section]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number(
          (visible.target as HTMLElement).dataset.contactSection,
        );
        if (!Number.isNaN(idx)) setActiveSection(idx);
      },
      { root: scroller, threshold: [0.45, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      scroller.removeEventListener("scroll", onScrollerGesture);
      scroller.removeEventListener("touchmove", onScrollerGesture);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dark-page header (isLightPage excludes /contact) — z-[100], above video */}
      <SiteHeader />
      <main className="fixed inset-0 z-0 overflow-hidden text-[#F2F0EF]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <video
          ref={videoRef}
          className="size-full scale-110 object-cover [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-start-playback-button]:hidden [&::-webkit-media-controls-enclosure]:hidden"
          src="/videos/ucsdxcrs-contact-v2.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[6px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 h-full">
        <div
          ref={scrollerRef}
          className="contact-snap h-full snap-y snap-mandatory overflow-y-auto overscroll-contain scroll-smooth"
        >
          {/* Section 1 — personal */}
          <section data-contact-section={0} className="snap-start snap-always">
            <ContactSection
              active={activeSection === 0}
              className="pt-28 md:pt-32"
            >
              <h1 className="text-center text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-[4rem]">
                Get in touch!
              </h1>
              <div className="mt-12 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SoftInput
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <SoftInput
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <SoftInput
                  name="organization"
                  autoComplete="organization"
                  placeholder="Organization / Company Name"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
                <SoftInput
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </ContactSection>
          </section>

          {/* Section 2 — organization type & inquiry focus */}
          <section data-contact-section={1} className="snap-start snap-always">
            <ContactSection active={activeSection === 1}>
              <h2 className="mx-auto w-full text-center text-[clamp(0.95rem,3.2vw,2.25rem)] font-semibold leading-snug tracking-tight md:text-3xl lg:text-4xl">
                How would you categorize your organization?
              </h2>
              <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                {ORGANIZATION_TYPES.map((type) => (
                  <PillButton
                    key={type}
                    label={type}
                    selected={organizationType === type}
                    onClick={() => selectOrganizationType(type)}
                  />
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-[#F2F0EF]/80 md:mt-12 md:text-base">
                What is the primary focus of your inquiry?
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {INQUIRY_FOCUSES.map((option) => (
                  <PillButton
                    key={option}
                    label={option}
                    selected={inquiryFocus === option}
                    onClick={() => handleInquiryFocusSelect(option)}
                  />
                ))}
              </div>

              <AnimatePresence>
                {showBudgetCheckbox && (
                  <motion.label
                    key="budget-checkbox"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                    className="mt-10 flex cursor-pointer items-start justify-center gap-3 text-left text-sm text-[#F2F0EF]/70"
                  >
                    <input
                      type="checkbox"
                      checked={budgetAllocated}
                      onChange={(e) => setBudgetAllocated(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 rounded border-[#F2F0EF]/40 accent-[#F2F0EF]"
                    />
                    <span>Is there a budget allocated for this initiative?</span>
                  </motion.label>
                )}
              </AnimatePresence>
            </ContactSection>
          </section>

          {/* Section 3 — details */}
          <section data-contact-section={2} className="snap-start snap-always">
            <ContactSection active={activeSection === 2}>
              <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">
                What are the details?
              </h2>
              <p className="mt-7 text-center text-sm text-[#F2F0EF]/80 md:text-base">
                What is your target timeframe for this?
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {TIMEFRAMES.map((option) => (
                  <PillButton
                    key={option}
                    label={option}
                    selected={timeframe === option}
                    onClick={() =>
                      setTimeframe((prev) => (prev === option ? null : option))
                    }
                  />
                ))}
              </div>

              <label
                htmlFor="message"
                className="mt-12 block text-center text-sm text-[#F2F0EF]/80 md:text-base"
              >
                Tell us more about your proposal, goals, or how we can
                collaborate!
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder="Share a bit more context (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={cn(
                  "mt-4 w-full resize-y px-4 py-3.5 text-sm",
                  fieldSurface,
                )}
              />

              <div className="relative mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= MAX_ATTACHMENTS}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-3.5 text-left text-sm",
                    fieldSurface,
                    attachments.length >= MAX_ATTACHMENTS
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-[#F2F0EF]/85",
                  )}
                >
                  <span className="text-[#0a1218]/55">
                    {attachments.length > 0
                      ? `Attachments (${attachments.length}/${MAX_ATTACHMENTS})`
                      : `Attachments (optional, up to ${MAX_ATTACHMENTS})`}
                  </span>
                  <Paperclip className="size-4 shrink-0 text-[#0a1218]/45" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_ACCEPT_ATTR}
                  className="sr-only"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </div>

              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-2.5 text-sm",
                        fieldSurface,
                      )}
                    >
                      <span className="truncate">{item.file.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.file.name}`}
                        onClick={() => removeAttachment(item.id)}
                        className="shrink-0 rounded-full p-1 text-[#0a1218]/45 transition-colors hover:bg-black/5 hover:text-[#0a1218]"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {attachmentError && (
                <p className="mt-3 text-center text-sm text-red-300" role="alert">
                  {attachmentError}
                </p>
              )}
            </ContactSection>
          </section>

          {/* Section 4 — submit */}
          <section data-contact-section={3} className="snap-start snap-always">
            <ContactSection active={activeSection === 3}>
              <div className="flex flex-col items-center gap-8 text-center">
                <AnimatePresence mode="wait">
                  {submitState === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, ease: easePremium }}
                      className="flex max-w-md flex-col items-center gap-4"
                    >
                      <div className="flex size-16 items-center justify-center rounded-full bg-[#F2F0EF] text-[#0a1218]">
                        <Check className="size-9" strokeWidth={3.25} />
                      </div>
                      <p className="text-base font-medium leading-relaxed text-[#F2F0EF] md:text-lg">
                        Submission Successful. Our team will review your details
                        and be in touch within 48 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form-actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-8"
                    >
                      <p className="max-w-lg text-2xl font-extrabold leading-snug tracking-tight text-[#F2F0EF] md:text-3xl lg:text-4xl">
                        We look forward to building something great together!
                      </p>

                      <label className="flex max-w-md cursor-pointer items-start gap-3 text-left text-sm text-[#F2F0EF]/50">
                        <input
                          type="checkbox"
                          checked={privacyAgreed}
                          onChange={(e) => setPrivacyAgreed(e.target.checked)}
                          required
                          className="mt-0.5 size-4 shrink-0 rounded border-[#F2F0EF]/40 accent-[#F2F0EF]"
                        />
                        <span>
                          I have read and agree to the{" "}
                          <Link
                            href="/privacy/"
                            className="underline underline-offset-2 hover:text-[#F2F0EF]"
                          >
                            Privacy Policy ↗
                          </Link>
                        </span>
                      </label>

                      {submitError ? (
                        <p
                          className="max-w-md text-center text-sm text-red-300"
                          role="alert"
                        >
                          {submitError}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={submitState === "loading"}
                        className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-full bg-[#182B49] px-8 py-3.5 text-sm font-medium text-[#F2F0EF] transition-colors hover:bg-[#121F38] disabled:cursor-wait disabled:opacity-90"
                      >
                        {submitState === "loading" ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Submitting
                          </>
                        ) : (
                          <>
                            Submit
                            <ArrowUpRight className="size-4" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ContactSection>
          </section>
        </div>

        <ContactSectionStepper
          activeSection={activeSection}
          onSelect={goToSection}
        />

        {/* Up / down section controls */}
        <div className="pointer-events-none fixed right-5 bottom-8 z-40 flex flex-col gap-2 md:right-8 md:bottom-10">
          <button
            type="button"
            aria-label="Previous section"
            disabled={activeSection === 0}
            onClick={() => goToSection(activeSection - 1)}
            className={cn(
              "pointer-events-auto flex size-11 items-center justify-center rounded-full border border-[#F2F0EF]/20 bg-black/40 text-[#F2F0EF] shadow-md backdrop-blur transition",
              "hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35",
            )}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next section"
            disabled={activeSection >= SECTION_COUNT - 1}
            onClick={() => goToSection(activeSection + 1)}
            className={cn(
              "pointer-events-auto flex size-11 items-center justify-center rounded-full border border-[#F2F0EF]/20 bg-black/40 text-[#F2F0EF] shadow-md backdrop-blur transition",
              "hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35",
            )}
          >
            <ArrowDown className="size-4" />
          </button>
        </div>
      </form>
    </main>
    </>
  );
}
