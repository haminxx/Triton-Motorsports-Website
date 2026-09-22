/** Render API that creates Stripe Checkout sessions. The secret key stays there. */
export const SPONSORSHIP_API_ORIGIN =
  "https://ucsd-x-crs-website.onrender.com";

export const SPONSORSHIP_AMOUNTS = [
  { id: "100", label: "$100", cents: 10_000 },
  { id: "250", label: "$250", cents: 25_000 },
  { id: "500", label: "$500", cents: 50_000 },
  { id: "1000", label: "$1,000", cents: 100_000 },
] as const;

export const MIN_SPONSORSHIP_CENTS = 100;
export const MAX_SPONSORSHIP_CENTS = 2_500_000;

export function getSponsorshipApiOrigin(): string {
  const override = process.env.NEXT_PUBLIC_SPONSORSHIP_API_URL?.trim();
  if (!override) return SPONSORSHIP_API_ORIGIN;
  return override.replace(/\/$/, "");
}

export function dollarsToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
