"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";

const TRITON_MASK = "/images/triton-mask.png";

const tritonMaskStyle = {
  WebkitMaskImage: `url('${TRITON_MASK}')`,
  WebkitMaskSize: "min(72vw, 78vh)",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('${TRITON_MASK}')`,
  maskSize: "min(72vw, 78vh)",
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const;

const GRID_CONFIG = {
  background: {
    color: "#64748b",
    maxOpacity: 0.12,
    flickerChance: 0.1,
    squareSize: 4,
    gridGap: 4,
  },
  triton: {
    color: "#182B49",
    maxOpacity: 0.55,
    flickerChance: 0.16,
    squareSize: 3,
    gridGap: 6,
  },
} as const;

/** Flickering dot grid with a Triton-mask overlay — originally the Program hero. */
export function FlickeringTritonBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <FlickeringGrid
        className="absolute inset-0 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)] motion-safe:animate-pulse"
        {...GRID_CONFIG.background}
      />
      <div
        className="absolute inset-0 -translate-y-[6vh] motion-safe:animate-pulse md:translate-y-[1vh]"
        style={{
          ...tritonMaskStyle,
          animationDuration: "4s",
        }}
      >
        <FlickeringGrid {...GRID_CONFIG.triton} />
      </div>
    </div>
  );
}
