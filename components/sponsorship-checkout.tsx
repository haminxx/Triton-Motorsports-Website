"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  dollarsToCents,
  formatUsd,
  getSponsorshipApiOrigin,
  MAX_SPONSORSHIP_CENTS,
  MIN_SPONSORSHIP_CENTS,
  SPONSORSHIP_AMOUNTS,
} from "@/lib/sponsorship";
import { cn } from "@/lib/utils";

type CheckoutResult = "form" | "success" | "canceled";

type SessionStatus = {
  paymentStatus: string;
  status: string;
  amountTotal: number | null;
  currency: string | null;
  sponsorName: string;
  organization: string;
  email: string;
};

const fieldClass =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-sm text-[#0a1218] outline-none transition-colors placeholder:text-black/35 focus:border-[#182B49]";

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sponsor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function SponsorshipCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const result: CheckoutResult =
    checkout === "success" ? "success" : checkout === "canceled" ? "canceled" : "form";

  const [tier, setTier] = useState<string>("250");
  const [customAmount, setCustomAmount] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const selectedPreset = SPONSORSHIP_AMOUNTS.find((amount) => amount.id === tier);
  const customCents = tier === "custom" ? dollarsToCents(customAmount) : null;
  const amountCents = selectedPreset?.cents ?? customCents;
  const amountValid =
    amountCents != null &&
    amountCents >= MIN_SPONSORSHIP_CENTS &&
    amountCents <= MAX_SPONSORSHIP_CENTS;

  useEffect(() => {
    if (result !== "success" || !sessionId) {
      setSession(null);
      setSessionError(null);
      setSessionLoading(false);
      return;
    }

    const controller = new AbortController();
    setSessionLoading(true);
    setSessionError(null);

    const url = new URL(
      "/api/sponsorship/session",
      getSponsorshipApiOrigin(),
    );
    url.searchParams.set("session_id", sessionId);

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        } & Partial<SessionStatus>;
        if (!response.ok) {
          throw new Error(data.error || "Could not confirm this sponsorship.");
        }
        setSession({
          paymentStatus: data.paymentStatus || "unpaid",
          status: data.status || "open",
          amountTotal: data.amountTotal ?? null,
          currency: data.currency ?? "usd",
          sponsorName: data.sponsorName || "",
          organization: data.organization || "",
          email: data.email || "",
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSessionError(
          err instanceof Error
            ? err.message
            : "Could not confirm this sponsorship.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setSessionLoading(false);
      });

    return () => controller.abort();
  }, [result, sessionId]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!amountValid || amountCents == null) {
      setError("Enter an amount between $1 and $25,000.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${getSponsorshipApiOrigin()}/api/sponsorship/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": newIdempotencyKey(),
          },
          body: JSON.stringify({
            sponsorName,
            email,
            organization,
            note,
            tier,
            amountCents,
          }),
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    }
  }

  if (result === "canceled") {
    return (
      <StatusCard
        title="Checkout canceled"
        body="No charge was made. You can choose an amount and try again whenever you are ready."
        onReset={() => router.push("/sponsors/")}
      />
    );
  }

  if (result === "success") {
    const paid = session?.paymentStatus === "paid";
    const pending =
      session != null && session.status === "complete" && !paid;
    return (
      <StatusCard
        title={
          sessionLoading
            ? "Confirming your sponsorship"
            : paid
              ? "Thank you for sponsoring Triton Motorsports"
              : sessionError
                ? "Payment not confirmed"
                : pending
                  ? "Payment submitted"
                  : "Checkout received"
        }
        body={
          sessionLoading
            ? "Checking the payment status with Stripe."
            : paid
              ? `${session.sponsorName ? `${session.sponsorName}, ` : ""}your sponsorship${
                  session.amountTotal != null
                    ? ` of ${formatUsd(session.amountTotal)}`
                    : ""
                } is confirmed.${
                  session.email ? ` A receipt is on its way to ${session.email}.` : ""
                }`
              : sessionError
                ? `${sessionError} If you finished payment, Stripe still emails a receipt and the payment appears in the team Stripe Dashboard.`
                : "Stripe is still confirming this payment. You will get a receipt by email when it completes."
        }
        onReset={() => router.push("/sponsors/")}
      />
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-xl rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_24px_80px_rgba(24,43,73,0.08)] backdrop-blur-md md:p-8"
    >
      <p className="font-mono text-[11px] tracking-[0.18em] text-black/40 uppercase">
        Sponsor the team
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#182B49]">
        Send a sponsorship
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-black/55">
        Choose an amount, then continue to Stripe to pay. Card details are
        entered on Stripe, and payouts go to the team&apos;s bank account.
      </p>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-[#0a1218]">Amount</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SPONSORSHIP_AMOUNTS.map((amount) => (
            <button
              key={amount.id}
              type="button"
              aria-pressed={tier === amount.id}
              onClick={() => setTier(amount.id)}
              className={cn(
                "rounded-full border px-3 py-2.5 text-sm font-medium transition-colors",
                tier === amount.id
                  ? "border-[#182B49] bg-[#182B49] text-[#F2F0EF]"
                  : "border-black/10 bg-white text-[#0a1218] hover:border-[#182B49]/40",
              )}
            >
              {amount.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={tier === "custom"}
          onClick={() => setTier("custom")}
          className={cn(
            "mt-2 w-full rounded-full border px-3 py-2.5 text-sm font-medium transition-colors",
            tier === "custom"
              ? "border-[#182B49] bg-[#182B49] text-[#F2F0EF]"
              : "border-black/10 bg-white text-[#0a1218] hover:border-[#182B49]/40",
          )}
        >
          Custom amount
        </button>
        {tier === "custom" && (
          <label className="mt-3 block text-sm text-black/70">
            Amount in USD
            <input
              inputMode="decimal"
              autoComplete="transaction-amount"
              placeholder="100.00"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              className={cn(fieldClass, "mt-2")}
              required
            />
          </label>
        )}
      </fieldset>

      <div className="mt-5 space-y-3">
        <label className="block text-sm text-black/70">
          Sponsor name
          <input
            name="sponsorName"
            autoComplete="name"
            value={sponsorName}
            onChange={(event) => setSponsorName(event.target.value)}
            className={cn(fieldClass, "mt-2")}
            required
            minLength={2}
            maxLength={80}
          />
        </label>
        <label className="block text-sm text-black/70">
          Email for the receipt
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(fieldClass, "mt-2")}
            required
            maxLength={254}
          />
        </label>
        <label className="block text-sm text-black/70">
          Organization <span className="text-black/40">(optional)</span>
          <input
            name="organization"
            autoComplete="organization"
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            className={cn(fieldClass, "mt-2")}
            maxLength={120}
          />
        </label>
        <label className="block text-sm text-black/70">
          Note for the team <span className="text-black/40">(optional)</span>
          <textarea
            name="note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={cn(fieldClass, "mt-2 resize-y")}
            maxLength={240}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !amountValid}
        className="mt-6 w-full rounded-full bg-[#182B49] px-6 py-3.5 text-sm font-semibold text-[#F2F0EF] transition-colors hover:bg-[#121f38] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Redirecting to Stripe…"
          : amountValid && amountCents != null
            ? `Continue to pay ${formatUsd(amountCents)}`
            : "Continue to Stripe"}
      </button>
      <p className="mt-4 text-center text-xs leading-relaxed text-black/45">
        Payments are processed by Stripe. This checkout does not by itself make
        a payment tax-deductible. See the{" "}
        <Link href="/privacy/" className="underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms/" className="underline underline-offset-2">
          Terms
        </Link>
        .
      </p>
    </form>
  );
}

function StatusCard({
  title,
  body,
  onReset,
}: {
  title: string;
  body: string;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-[28px] border border-black/10 bg-white/80 p-6 text-center shadow-[0_24px_80px_rgba(24,43,73,0.08)] backdrop-blur-md md:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[#182B49]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-black/60">{body}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-full bg-[#182B49] px-6 py-3 text-sm font-semibold text-[#F2F0EF] transition-colors hover:bg-[#121f38]"
      >
        Back to sponsorships
      </button>
    </div>
  );
}
