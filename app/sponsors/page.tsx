"use client";

import { Suspense } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageEnter } from "@/components/page-motion";
import { SpringUnderline } from "@/components/spring-underline";
import { LetterTitle } from "@/components/ui/background-paths";
import { FlickeringTritonBackground } from "@/components/ui/flickering-triton-background";
import { SponsorshipCheckout } from "@/components/sponsorship-checkout";

export default function SponsorsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-hidden bg-[#F2F0EF] text-[#0a1218]">
        <FlickeringTritonBackground />

        <PageEnter>
          <section className="relative z-10 px-6 pb-8 pt-32 md:px-10 md:pt-36 lg:px-16">
            <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
              <LetterTitle
                title="Join Our Mission"
                className="text-[clamp(2.75rem,12vw,6.75rem)] md:text-[clamp(1.65rem,6.5vw,6.75rem)]"
              />
              <div className="mt-[8pt] max-w-3xl space-y-[clamp(0.5rem,2vw,0.875rem)] text-base leading-relaxed text-black/55 md:mt-[10pt] md:text-lg">
                <p className="text-balance">
                  We are actively looking for sponsors to help elevate our
                  platform.
                </p>
                <p>
                  <Link
                    href="/contact/"
                    className="inline-flex text-[#182B49] transition-colors hover:text-[#0a1218]"
                  >
                    <SpringUnderline className="pb-0.5 font-medium">
                      Interested? Let&apos;s start a conversation.
                    </SpringUnderline>
                  </Link>
                </p>
              </div>
            </div>
          </section>
          <section className="relative z-10 px-6 pb-24 md:px-10">
            <Suspense
              fallback={
                <div className="mx-auto h-80 max-w-xl rounded-[28px] border border-black/10 bg-white/60" />
              }
            >
              <SponsorshipCheckout />
            </Suspense>
          </section>
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
