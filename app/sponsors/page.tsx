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
      </main>
      {/*
        Locked to the viewport (position: fixed), not the document.
        PageEnter animates with a transform, which would trap a nested
        fixed element, so the fixed shell stays outside that wrapper.
      */}
      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6 md:px-10 lg:px-16">
        <PageEnter className="pointer-events-auto w-full max-w-4xl">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
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
            <div className="mt-8 w-full">
              <Suspense
                fallback={<div className="mx-auto h-14 max-w-xl" />}
              >
                <SponsorshipCheckout />
              </Suspense>
            </div>
          </div>
        </PageEnter>
      </div>
      <SiteFooter />
    </>
  );
}
