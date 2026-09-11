"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageEnter } from "@/components/page-motion";
import { SpringUnderline } from "@/components/spring-underline";
import { LetterTitle } from "@/components/ui/background-paths";
import { FlickeringTritonBackground } from "@/components/ui/flickering-triton-background";

export default function SponsorsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-hidden bg-[#F2F0EF] text-[#0a1218]">
        <FlickeringTritonBackground />

        <PageEnter>
          <section className="relative z-10 flex min-h-dvh items-center justify-center px-6 pb-24 pt-32 md:px-10 md:pb-28 md:pt-36 lg:px-16">
            <div className="mx-auto flex max-w-4xl translate-y-8 flex-col items-center text-center md:translate-y-12 lg:translate-y-16">
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
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
