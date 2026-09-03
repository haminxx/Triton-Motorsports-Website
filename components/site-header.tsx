"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isLightPage, normalizePath } from "@/lib/theme";
import { Menu, X } from "lucide-react";
import { useScroll, motion, AnimatePresence } from "motion/react";
import { BoldHoverText, springTransition } from "@/components/spring-underline";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us/" },
  { name: "Program", href: "/program/" },
  { name: "Sponsors", href: "/sponsors/" },
  { name: "Recruitment", href: "/recruitment/" },
  { name: "Contact", href: "/contact/" },
];

function isActivePath(pathname: string | null, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return current === target;
}

function NavItem({
  item,
  active,
  onHover,
  onLeave,
  layoutId,
  showUnderline,
  light,
}: {
  item: (typeof menuItems)[number];
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
  layoutId: string;
  showUnderline: boolean;
  light: boolean;
}) {
  return (
    <Link
      href={item.href}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "relative block cursor-grab py-1 font-medium duration-200 active:cursor-grabbing",
        light
          ? cn(
              "text-[#0a1218]/72 hover:text-[#0a1218]",
              (active || showUnderline) && "font-bold text-[#0a1218]",
            )
          : cn(
              "text-[#F2F0EF]/65 hover:text-[#F2F0EF]",
              (active || showUnderline) && "font-bold text-[#F2F0EF]",
            ),
      )}
    >
      <motion.span
        className="inline-block"
        animate={{ fontWeight: active || showUnderline ? 700 : 500 }}
        transition={{ duration: 0.2 }}
      >
        {item.name}
      </motion.span>
      {showUnderline && (
        <motion.span
          layoutId={layoutId}
          className={cn(
            "absolute inset-x-0 -bottom-0.5 h-[2px]",
            light ? "bg-black" : "bg-[#F2F0EF]",
          )}
          transition={springTransition}
        />
      )}
    </Link>
  );
}

/** Delay before underline settles back to the active page after leaving nav items. */
const NAV_UNDERLINE_SETTLE_MS = 500;

function useNavUnderline() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = React.useState<string | null>(null);
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // No fallback to "/" — pages like /login/ should show no active nav item
  const activeHref =
    menuItems.find((item) => isActivePath(pathname, item.href))?.href ?? null;

  const clearSettleTimer = React.useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => () => clearSettleTimer(), [clearSettleTimer]);

  // Drop hover target on route change so underline tracks the new active page
  React.useEffect(() => {
    clearSettleTimer();
    setHoveredHref(null);
  }, [pathname, clearSettleTimer]);

  const onHover = React.useCallback(
    (href: string) => {
      clearSettleTimer();
      setHoveredHref(href);
    },
    [clearSettleTimer],
  );

  const onLeave = React.useCallback(() => {
    clearSettleTimer();
    // Keep underline on the last hovered item until settle delay elapses
    settleTimerRef.current = setTimeout(() => {
      setHoveredHref(null);
      settleTimerRef.current = null;
    }, NAV_UNDERLINE_SETTLE_MS);
  }, [clearSettleTimer]);

  const underlineHref = hoveredHref ?? activeHref;

  return { underlineHref, onHover, onLeave, pathname };
}

function DesktopNav({ light }: { light: boolean }) {
  const { underlineHref, onHover, onLeave, pathname } = useNavUnderline();

  return (
    <ul className="flex gap-7 text-sm font-medium tracking-wide lg:gap-9">
      {menuItems.map((item) => (
        <li key={item.href}>
          <NavItem
            item={item}
            active={isActivePath(pathname, item.href)}
            layoutId="desktop-nav-underline"
            showUnderline={underlineHref === item.href}
            onHover={() => onHover(item.href)}
            onLeave={onLeave}
            light={light}
          />
        </li>
      ))}
    </ul>
  );
}

function MobileNavItem({
  item,
  active,
  light,
  onNavigate,
}: {
  item: (typeof menuItems)[number];
  active: boolean;
  light: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "block w-full cursor-grab rounded-xl px-4 py-3 text-center text-base font-medium transition-colors duration-150 active:cursor-grabbing",
        "no-underline outline-none ring-0",
        light
          ? cn(
              "text-[#0a1218]/75 hover:bg-black/[0.07] hover:text-[#0a1218] active:bg-black/[0.1]",
              active && "bg-black/[0.08] font-bold text-[#0a1218]",
            )
          : cn(
              "text-[#F2F0EF]/70 hover:bg-[#F2F0EF]/12 hover:text-[#F2F0EF] active:bg-[#F2F0EF]/18",
              active && "bg-[#F2F0EF]/14 font-bold text-[#F2F0EF]",
            ),
      )}
    >
      {item.name}
    </Link>
  );
}

function MobileNav({
  light,
  onNavigate,
}: {
  light: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  return (
    <ul className="flex w-full flex-col items-stretch gap-1 text-base font-medium">
      {menuItems.map((item) => (
        <li key={item.href} className="w-full">
          <MobileNavItem
            item={item}
            active={isActivePath(pathname, item.href)}
            light={light}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );
}

/** Staff Portal button — navy fill with cream label. Bold weight on hover (box size fixed). */
function StaffPortalButton({
  className,
  light,
}: {
  className?: string;
  light: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Link
      href="/login/"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "inline-flex cursor-grab items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "border-0 shadow-none outline-none ring-0 active:cursor-grabbing",
        "transition-[opacity,background-color,color] duration-200",
        light
          ? "bg-[#182B49] text-[#F2F0EF] hover:bg-[#121F38] focus-visible:ring-2 focus-visible:ring-[#182B49]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F2F0EF]"
          : "bg-[#182B49] text-[#F2F0EF] hover:bg-[#121F38] focus-visible:ring-2 focus-visible:ring-[#182B49]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className,
      )}
    >
      <BoldHoverText active={hovered} from={500} to={800}>
        Staff Portal
      </BoldHoverText>
    </Link>
  );
}

/** Session flag: header spring entrance already played (home first mount only). */
export const HEADER_ENTERED_STORAGE_KEY = "ucsdxcrs-header-entered";

function hasHeaderEntered(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(HEADER_ENTERED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markHeaderEntered(): void {
  try {
    sessionStorage.setItem(HEADER_ENTERED_STORAGE_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const light = isLightPage(pathname);
  const [menuState, setMenuState] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  // null = not yet decided (avoid animating on SSR/hydration for inner pages)
  const [playEntrance, setPlayEntrance] = React.useState<boolean | null>(null);
  const { scrollYProgress } = useScroll();

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setScrolled(latest > 0.02);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  React.useEffect(() => {
    setMenuState(false);
  }, [pathname]);

  // Animate only on first home mount of the session — never on About/Program/etc.
  // useLayoutEffect avoids a one-frame hidden flash on inner pages.
  React.useLayoutEffect(() => {
    const isHome = normalizePath(pathname) === "/";
    if (!isHome || hasHeaderEntered()) {
      setPlayEntrance(false);
      return;
    }
    setPlayEntrance(true);
    markHeaderEntered();
  }, [pathname]);

  const entranceReady = playEntrance !== null;
  const shouldAnimate = playEntrance === true;

  return (
    <header>
      <motion.nav
        data-state={menuState && "active"}
        initial={shouldAnimate ? { opacity: 0, y: -28 } : false}
        animate={
          entranceReady || playEntrance === false
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -28 }
        }
        transition={
          shouldAnimate
            ? {
                type: "spring",
                stiffness: 110,
                damping: 22,
                mass: 0.85,
              }
            : { duration: 0 }
        }
        className={cn(
          "group fixed inset-x-0 top-0 z-[100] w-full pt-4 lg:pt-6",
          light ? "text-[#0a1218]" : "text-[#F2F0EF]",
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl rounded-3xl px-6 transition-all duration-300 lg:px-12",
            light
              ? scrolled
                ? "border border-black/[0.08] bg-[#F2F0EF]/90 shadow-md shadow-black/10 backdrop-blur-2xl"
                : "border border-black/[0.06] bg-[#F2F0EF]/78 shadow-sm shadow-black/[0.06] backdrop-blur-xl"
              : scrolled
                ? "bg-black/55 shadow-lg shadow-black/20 backdrop-blur-2xl"
                : "bg-black/20 backdrop-blur-md",
          )}
        >
          <motion.div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-5">
            <div className="flex w-full items-center justify-between gap-10 lg:w-auto lg:gap-14">
              <Link
                href="/"
                aria-label="Triton Motor Sports home"
                className="flex items-center"
              >
                <Image
                  src="/images/triton-motor-sports-logo.png"
                  alt="Triton Motor Sports"
                  width={400}
                  height={400}
                  className="h-10 w-auto object-contain md:h-11"
                  priority
                  unoptimized
                />
              </Link>

              <button
                type="button"
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer border-0 bg-transparent p-2.5 shadow-none outline-none ring-0 lg:hidden"
              >
                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>

              <div className="hidden lg:block">
                <DesktopNav light={light} />
              </div>
            </div>

            <div className="hidden lg:block lg:ml-4">
              <StaffPortalButton light={light} />
            </div>

            <AnimatePresence>
              {menuState && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="mb-4 w-full space-y-5 py-2 lg:hidden"
                >
                  <MobileNav
                    light={light}
                    onNavigate={() => setMenuState(false)}
                  />
                  <div className="flex justify-center px-4 pt-1">
                    <StaffPortalButton className="w-full max-w-xs" light={light} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.nav>
    </header>
  );
}
