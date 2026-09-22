"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageEnter } from "@/components/page-motion";
import { TeamCarousel } from "@/components/team-carousel";
import { Button } from "@/components/ui/button";

const HERO_IMAGE = "/images/fall-2026-banner.png";

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

          <TeamCarousel />
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
