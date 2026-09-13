"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundAutoplayVideo } from "@/components/background-autoplay-video";
import { SiteHeader } from "@/components/site-header";
import { PageEnter } from "@/components/page-motion";
import { StaffAuthPanel } from "@/components/staff-auth-panel";

export default function LoginPage() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setOffset({ x: nx * 18, y: ny * 12 });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-[#F2F0EF] md:pt-32">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-[-8%] will-change-transform transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(1.12)`,
            }}
          >
            <BackgroundAutoplayVideo
              src="/videos/ucsdxcrs-v4.mp4"
              className="size-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
        </div>

        <PageEnter className="relative z-10 w-full max-w-md">
          <StaffAuthPanel />
        </PageEnter>
      </main>
    </>
  );
}
