"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageEnter } from "@/components/page-motion";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "/images/fall-2026-banner.png";
const FEATURE_IMAGE = "/images/recruitment/engineer.png";
const ENGINEERING_IMAGE = "/images/recruitment/pit-crew.png";
const DRIVING_IMAGE = "/images/recruitment/driver.png";

export default function ProgramPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#F2F0EF] text-[#0a1218]">
        <PageEnter>
          <section className="px-6 pb-16 pt-32 md:px-10 md:pb-28 md:pt-40 lg:px-16">
            <div className="mx-auto max-w-6xl space-y-8">
              <Image
                className="h-[240px] w-full rounded-xl object-cover md:h-[460px]"
                src={HERO_IMAGE}
                alt="Triton Motorsports on track"
                width={1200}
                height={600}
                priority
                unoptimized
              />

              <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                <h1 className="text-3xl font-semibold leading-snug tracking-tight text-[#0a1218] md:text-4xl">
                  The Triton Motorsports{" "}
                  <span className="text-[#182B49]">program</span>{" "}
                  <span className="text-black/45">
                    brings together driving, engineering, and the full race
                    weekend.
                  </span>
                </h1>
                <div className="space-y-6 text-black/55">
                  <p>
                    Triton Motorsports is a student-led Collegiate Racing Series
                    team. Members train across roles — Driver, Engineer, PIT
                    Crew, Media, Content, and Operations — then compete with a
                    full program behind them.
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="gap-1 bg-[#182B49] pr-1.5 text-[#F2F0EF] hover:bg-[#121F38]"
                  >
                    <Link href="/recruitment/">
                      <span>Learn More</span>
                      <ChevronRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 pb-24 md:px-10 md:pb-28 lg:px-16">
            <div className="mx-auto max-w-6xl space-y-16">
              <div className="grid gap-6 text-center md:grid-cols-2 md:gap-12 md:text-left">
                <h2 className="text-4xl font-semibold tracking-tight text-[#0a1218] md:text-5xl">
                  The Program
                </h2>
                <p className="text-black/55">
                  Four tracks run as one team: Engineering &amp; Crew, Driving
                  &amp; Sim, Media &amp; Creative, and Operations &amp;
                  Business. Copy and links here can be refined next.
                </p>
              </div>

              <div className="mt-16 flex flex-col gap-6 md:flex-row">
                <div className="md:flex-1">
                  <Image
                    src={FEATURE_IMAGE}
                    alt="Engineering work on the car"
                    className="h-[300px] w-full rounded-xl object-cover sm:h-[360px] md:h-full"
                    width={800}
                    height={550}
                    unoptimized
                  />
                </div>

                <div className="flex flex-col gap-6 md:flex-1">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    className="relative overflow-hidden rounded-xl bg-[#0a1218] text-[#F2F0EF] shadow-lg"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="relative h-60 w-full overflow-hidden sm:h-64 md:h-48"
                    >
                      <Image
                        src={ENGINEERING_IMAGE}
                        alt="Pit crew and engineering"
                        className="h-full w-full object-cover"
                        width={600}
                        height={400}
                        unoptimized
                      />
                      <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black via-black/70 to-transparent" />
                    </motion.div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold">Engineering &amp; Crew</h3>
                      <p className="mt-2 text-sm text-[#F2F0EF]/70">
                        Build, maintain, and race-prep the car — chassis,
                        systems, and pit execution.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="mt-4 border-[#F2F0EF]/40 bg-transparent text-[#F2F0EF] hover:bg-[#F2F0EF] hover:text-[#0a1218]"
                      >
                        <Link href="/recruitment/">Learn More</Link>
                      </Button>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    className="relative overflow-hidden rounded-xl bg-[#e8ecef] shadow-lg"
                  >
                    <Image
                      src={DRIVING_IMAGE}
                      alt="Driving and simulator training"
                      className="h-full min-h-[220px] w-full object-cover sm:min-h-[240px] md:min-h-[220px]"
                      width={600}
                      height={400}
                      unoptimized
                    />
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-[#F2F0EF]">
                      <h3 className="text-xl font-bold">Driving &amp; Sim</h3>
                      <p className="mt-2 text-sm text-[#F2F0EF]/80">
                        Racecraft, simulator training, and data feedback that
                        shave tenths on track.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
