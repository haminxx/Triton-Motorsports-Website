"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatUsd, getSponsorshipApiOrigin } from "@/lib/sponsorship";
import { cn } from "@/lib/utils";

type CheckoutResult = "form" | "success" | "canceled";

type SessionStatus = {
  purpose: string;
  paymentStatus: string;
  status: string;
  amountTotal: number | null;
  currency: string | null;
  sponsorName: string;
  organization: string;
  email: string;
};

function newIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `support_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const buttonClass =
  "inline-flex min-w-[220px] items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100";

export function SponsorshipCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkout = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");
  const result: CheckoutResult =
    checkout === "success" ? "success" : checkout === "canceled" ? "canceled" : "form";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionStatus | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

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

    const url = new URL("/api/sponsorship/session", getSponsorshipApiOrigin());
    url.searchParams.set("session_id", sessionId);

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        } & Partial<SessionStatus>;
        if (!response.ok) {
          throw new Error(data.error || "Could not confirm this payment.");
        }
        setSession({
          purpose: data.purpose || "donation",
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
          err instanceof Error ? err.message : "Could not confirm this payment.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setSessionLoading(false);
      });

    return () => controller.abort();
  }, [result, sessionId]);

  async function supportUs() {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch(
        `${getSponsorshipApiOrigin()}/api/sponsorship/donate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": newIdempotencyKey(),
          },
          body: "{}",
        },
      );
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Could not open the donation page.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof Error ? err.message : "Could not open the donation page.",
      );
    }
  }

  if (result === "canceled") {
    return (
      <StatusCard
        title="Donation canceled"
        body="No charge was made. You can support the team whenever you are ready."
        onReset={() => router.push("/sponsors/")}
      />
    );
  }

  if (result === "success") {
    const paid = session?.paymentStatus === "paid";
    const pending = session != null && session.status === "complete" && !paid;
    const amount =
      session?.amountTotal != null ? ` of ${formatUsd(session.amountTotal)}` : "";
    return (
      <StatusCard
        title={
          sessionLoading
            ? "Confirming your support"
            : paid
              ? "Thank you for supporting Triton Motorsports"
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
              ? `Your support${amount} is confirmed.${
                  session?.email ? ` A receipt is on its way to ${session.email}.` : ""
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
    <div className="mx-auto flex w-full max-w-xl flex-col items-center">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button type="button" className={cn(buttonClass, "border border-[#182B49] bg-white/80 text-[#182B49] hover:bg-white")}>
          Become our sponsor
        </button>
        <button
          type="button"
          onClick={supportUs}
          disabled={submitting}
          className={cn(buttonClass, "bg-[#182B49] text-[#F2F0EF] hover:bg-[#121f38]")}
        >
          {submitting ? "Opening Stripe…" : "Support us!"}
        </button>
      </div>
      {error && (
        <p className="mt-4 text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
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
      <h2 className="text-2xl font-semibold tracking-tight text-[#182B49]">{title}</h2>
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
