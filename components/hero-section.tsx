'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BackgroundAutoplayVideo } from '@/components/background-autoplay-video'
import { Button } from '@/components/ui/button'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HomeWhatIsCrs } from '@/components/home-what-is-crs'
import { BoldHoverText, SpringUnderline } from '@/components/spring-underline'
import { HoverPeek } from '@/components/ui/hover-peek'
import { FALL_2026_APPLICATION_URL } from '@/lib/recruitment'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

const INFO_DOCUMENT_URL =
    'https://docs.google.com/document/d/1nappaO5u9fxUdxcEaWnx4cOIRSnC_yncf1SFctz-6hI/edit?usp=sharing'

const HERO_VIDEO_SRC = '/videos/ucsdxcrs-v4.mp4'

const PARTNER_LOGOS = [
    {
        src: '/images/logos/rady-school.png',
        alt: 'Rady School of Management',
        className: 'h-8 w-auto max-w-[9.5rem] object-contain md:h-9 md:max-w-[11rem]',
    },
    {
        src: '/images/logos/mazda-motorsports.png',
        alt: 'Mazda Motorsports',
        className: 'h-9 w-auto max-w-[8.5rem] object-contain md:h-10 md:max-w-[9.5rem]',
    },
    {
        src: '/images/logos/crs.png',
        alt: 'Collegiate Racing Series',
        className: 'h-11 w-auto max-w-[7.5rem] object-contain md:h-12 md:max-w-[8.5rem]',
    },
    {
        src: '/images/logos/jacobs-school.png',
        alt: 'Jacobs School of Engineering',
        className: 'h-9 w-auto max-w-[11rem] object-contain md:h-10 md:max-w-[13rem]',
    },
] as const

const RESTING_OPACITY = 1
const IDLE_MS = 2500
const FADE_OUT_S = 1.6
const FADE_IN_SPRING = { type: 'spring' as const, stiffness: 260, damping: 30, mass: 0.75 }
const LOGO_REVEAL = { duration: 1.15, ease: [0.22, 1, 0.36, 1] as const, delay: 0.35 }
const LINE_EASE = [0.16, 1, 0.3, 1] as const

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.17,
            delayChildren: 0.1,
        },
    },
}

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.78, ease: LINE_EASE },
    },
}

function SponsorLink() {
    return (
        <Link
            href="/sponsors/"
            className="inline-flex items-center px-2 py-2 text-base text-[#F2F0EF] mix-blend-difference"
        >
            <SpringUnderline className="text-nowrap pb-0.5">
                Become a Sponsor
            </SpringUnderline>
        </Link>
    )
}

/** CTA with bold-on-hover label; width reserved so the pill never grows. */
function JoinTeamButton() {
    const [hovered, setHovered] = useState(false)

    return (
        <Button
            asChild
            size="lg"
            className="h-12 rounded-full border-0 bg-[#182B49] pl-5 pr-3 text-base font-medium text-[#F2F0EF] shadow-none hover:bg-[#121F38] hover:text-[#F2F0EF]"
        >
            <Link
                href="/recruitment/"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <BoldHoverText active={hovered} from={500} to={800} className="text-nowrap">
                    Join the team
                </BoldHoverText>
                <ChevronRight className="ml-1 shrink-0" />
            </Link>
        </Button>
    )
}

export function HeroSection() {
    const heroRef = useRef<HTMLElement>(null)
    const [contentVisible, setContentVisible] = useState(true)
    const [fadingOut, setFadingOut] = useState(false)

    useEffect(() => {
        const hero = heroRef.current
        if (!hero) return

        let idleTimer: ReturnType<typeof setTimeout> | null = null
        let inView = true

        const clearIdle = () => {
            if (idleTimer) {
                clearTimeout(idleTimer)
                idleTimer = null
            }
        }

        const startIdle = () => {
            clearIdle()
            if (!inView) return
            idleTimer = setTimeout(() => {
                setFadingOut(true)
                setContentVisible(false)
            }, IDLE_MS)
        }

        const onActivity = () => {
            if (!inView) return
            setContentVisible(true)
            setFadingOut(false)
            startIdle()
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                inView = entry.isIntersecting
                if (inView) {
                    onActivity()
                } else {
                    clearIdle()
                    setContentVisible(true)
                    setFadingOut(false)
                }
            },
            { threshold: 0.25 }
        )
        observer.observe(hero)

        const events = [
            'mousemove',
            'mousedown',
            'keydown',
            'touchstart',
            'wheel',
            'scroll',
            'pointermove',
            'click',
        ] as const

        for (const event of events) {
            window.addEventListener(event, onActivity, { passive: true })
        }

        startIdle()

        return () => {
            observer.disconnect()
            clearIdle()
            for (const event of events) {
                window.removeEventListener(event, onActivity)
            }
        }
    }, [])

    return (
        <>
            <SiteHeader />

            <main className="overflow-x-hidden">
                <section ref={heroRef} className="relative">
                    {/* Full viewport stage; video meets logo cloud with no gap or bottom crop */}
                    <div className="relative isolate min-h-dvh w-full overflow-hidden bg-[#0a1218]">
                        <div className="absolute inset-0 overflow-hidden" aria-hidden>
                            <BackgroundAutoplayVideo
                                src={HERO_VIDEO_SRC}
                                className="size-full min-h-full min-w-full object-cover object-center"
                            />
                        </div>

                        {/* Blur while UI is visible; clears when idle (synced with text fade) */}
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[1] bg-black/45 backdrop-blur-[6px]"
                            animate={{
                                opacity: contentVisible ? 1 : 0,
                            }}
                            transition={
                                fadingOut
                                    ? { duration: FADE_OUT_S, ease: 'easeOut' }
                                    : FADE_IN_SPRING
                            }
                        />
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/35 via-transparent to-black/55"
                            animate={{
                                opacity: contentVisible ? 1 : 0.35,
                            }}
                            transition={
                                fadingOut
                                    ? { duration: FADE_OUT_S, ease: 'easeOut' }
                                    : FADE_IN_SPRING
                            }
                        />

                        {/* Same max-w-7xl + px rhythm as SiteHeader so copy shares the header column on xl/2xl */}
                        <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center px-6 pb-20 pt-32 lg:px-12 lg:pb-24 lg:pt-40">
                            {/* Centered on mobile/tablet/narrow desktop; left-aligned to header edge from xl up */}
                            <motion.div
                                className="mx-auto w-full max-w-3xl text-center sm:max-w-4xl xl:mx-0 xl:max-w-[min(100%,42rem)] xl:text-left 2xl:max-w-[min(100%,48rem)]"
                                animate={{
                                    opacity: contentVisible ? RESTING_OPACITY : 0,
                                }}
                                transition={
                                    fadingOut
                                        ? { duration: FADE_OUT_S, ease: 'easeOut' }
                                        : FADE_IN_SPRING
                                }
                                style={{
                                    pointerEvents: contentVisible ? 'auto' : 'none',
                                }}
                            >
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <h1 className="mx-auto max-w-2xl text-[clamp(1.75rem,4.2vw,3.25rem)] font-black leading-[1.12] tracking-tight text-[#F2F0EF] mix-blend-difference md:text-5xl xl:mx-0 xl:max-w-none xl:text-[clamp(3.35rem,2.15rem+1.15vw,4.5rem)]">
                                        <motion.span
                                            variants={staggerItem}
                                            className="block whitespace-nowrap"
                                        >
                                            Engineering the future
                                        </motion.span>
                                        <motion.span
                                            variants={staggerItem}
                                            className="block whitespace-nowrap"
                                        >
                                            of collegiate motorsport
                                        </motion.span>
                                    </h1>
                                    <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#F2F0EF]/70 mix-blend-difference md:mt-6 md:max-w-2xl md:text-lg xl:mx-0 xl:text-[clamp(1.125rem,0.95rem+0.35vw,1.375rem)]">
                                        <motion.span
                                            variants={staggerItem}
                                            className="block whitespace-nowrap"
                                        >
                                            Learning by doing. We run a fully structured,
                                        </motion.span>
                                        <motion.span
                                            variants={staggerItem}
                                            className="block whitespace-nowrap"
                                        >
                                            student-led organization apply hands-on knowledge
                                        </motion.span>
                                        <motion.span
                                            variants={staggerItem}
                                            className="block whitespace-nowrap"
                                        >
                                            to compete in the Collegiate Racing Series.
                                        </motion.span>
                                    </p>

                                    <motion.div
                                        variants={staggerItem}
                                        className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:mt-12 xl:justify-start"
                                    >
                                        <JoinTeamButton />
                                        <SponsorLink />
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>
                <motion.section
                    className="bg-background pb-4 pt-0"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={LOGO_REVEAL}
                >
                    <div className="group relative m-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center md:flex-row">
                            <div className="w-full shrink-0 max-md:translate-y-[17pt] md:max-w-44 md:border-r md:border-[#F2F0EF]/15 md:pr-6">
                                <p className="w-full text-center text-xs leading-none tracking-tight text-[#F2F0EF]/70 max-md:whitespace-nowrap md:text-end md:text-sm md:leading-snug md:tracking-normal">
                                    <span className="md:hidden">
                                        Powering by the best teams
                                    </span>
                                    <span className="hidden md:inline">
                                        Powering by the
                                        <br />
                                        best teams
                                    </span>
                                </p>
                            </div>
                            <div className="relative py-8 md:w-[calc(100%-11rem)]">
                                <InfiniteSlider
                                    speedOnHover={20}
                                    speed={40}
                                    gap={88}
                                    className="py-1"
                                >
                                    {PARTNER_LOGOS.map((logo) => (
                                        <div
                                            key={logo.src}
                                            className="flex h-14 items-center justify-center md:h-16"
                                        >
                                            <img
                                                className={logo.className}
                                                src={logo.src}
                                                alt={logo.alt}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    ))}
                                </InfiniteSlider>

                                <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                                <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                                <ProgressiveBlur
                                    className="pointer-events-none absolute left-0 top-0 h-full w-20"
                                    direction="left"
                                    blurIntensity={1}
                                />
                                <ProgressiveBlur
                                    className="pointer-events-none absolute right-0 top-0 h-full w-20"
                                    direction="right"
                                    blurIntensity={1}
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <HomeWhatIsCrs />

                <section
                    aria-label="Fall 2026 Application"
                    className="relative flex min-h-[55vh] w-full items-center justify-center overflow-hidden px-6 py-24 md:min-h-[60vh] md:px-10 md:py-28 lg:min-h-[65vh] lg:px-12"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-[2px]"
                        style={{
                            backgroundImage:
                                "url('/images/fall-2026-banner.png')",
                        }}
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-black/40"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-8% 0px' }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center"
                    >
                        <h2 className="text-[clamp(1.85rem,4.5vw,3.25rem)] font-bold leading-[1.12] tracking-tight text-[#F2F0EF]">
                            Fall 2026 Application{' '}
                            <span className="text-[#F2F0EF]/85">is now open!</span>
                        </h2>

                        <Button
                            asChild
                            size="lg"
                            className="mt-8 h-14 rounded-full border-0 bg-[#182B49] px-10 text-base font-semibold text-[#F2F0EF] shadow-none hover:bg-[#121F38] hover:text-[#F2F0EF] md:mt-10 md:h-16 md:px-12 md:text-lg"
                        >
                            <a
                                href={FALL_2026_APPLICATION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Apply Now
                            </a>
                        </Button>

                        <p className="mt-6 text-base text-[#F2F0EF]/75 md:mt-8 md:text-lg">
                            <HoverPeek url={INFO_DOCUMENT_URL}>
                                <Link
                                    href={INFO_DOCUMENT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex text-[#F2F0EF] transition-colors hover:text-white"
                                >
                                    <SpringUnderline className="pb-0.5 font-medium">
                                        Check this info document for more
                                    </SpringUnderline>
                                </Link>
                            </HoverPeek>
                        </p>
                    </motion.div>
                </section>
            </main>
            <SiteFooter />
        </>
    )
}
