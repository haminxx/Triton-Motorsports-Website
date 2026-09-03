"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageEnter } from "@/components/page-motion";
import { TeamTrackStack } from "@/components/team-track-stack";

export default function ProgramPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-x-clip bg-[#F2F0EF] text-[#0a1218]">
        <PageEnter>
          <div className="px-6 pb-24 pt-32 md:px-10 md:pb-28 md:pt-40 lg:px-16">
            <TeamTrackStack />
          </div>
        </PageEnter>
      </main>
      <SiteFooter />
    </>
  );
}
