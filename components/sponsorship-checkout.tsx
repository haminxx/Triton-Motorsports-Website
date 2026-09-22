"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MAX_SPONSORSHIP_CENTS,
  MIN_SPONSORSHIP_CENTS,
  SPONSORSHIP_AMOUNTS,
  dollarsToCents,
  formatUsd,
  getSponsorshipApiOrigin,
} from "@/lib/sponsorship";
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

/**
 * `fetch` rejects with a bare TypeError ("Failed to fetch") for DNS, CORS, and
 * offline failures, which reads as a bug to anyone on the sponsors page.
 */
function checkoutErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof TypeError) {
    return "Could not reach the payment server. Check your connection and try again in a moment.";
  }
  return err instanceof Error ? err.message : fallback;
}

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
  const [formOpen, setFormOpen] = useState(false);
  const [tier, setTier] = useState<string>(SPONSORSHIP_AMOUNTS[0].id);
  const [customAmount, setCustomAmount] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

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
          checkoutErrorMessage(err, "Could not confirm this payment."),
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
      setError(checkoutErrorMessage(err, "Could not open the donation page."));
    }
  }

  function resolveAmountCents(): number | null {
    if (tier !== "custom") {
      const preset = SPONSORSHIP_AMOUNTS.find((option) => option.id === tier);
      return preset ? preset.cents : null;
    }
    return dollarsToCents(customAmount);
  }

  async function startSponsorship(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amountCents = resolveAmountCents();
    if (
      amountCents == null ||
      amountCents < MIN_SPONSORSHIP_CENTS ||
      amountCents > MAX_SPONSORSHIP_CENTS
    ) {
      setError(
        `Enter an amount between ${formatUsd(MIN_SPONSORSHIP_CENTS)} and ${formatUsd(
          MAX_SPONSORSHIP_CENTS,
        )}.`,
      );
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
            sponsorName: sponsorName.trim(),
            organization: organization.trim(),
            email: email.trim(),
            note: note.trim(),
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
        throw new Error(data.error || "Could not open the sponsorship page.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setSubmitting(false);
      setError(
        checkoutErrorMessage(err, "Could not open the sponsorship page."),
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
        <button
          type="button"
          onClick={() => {
            setError(null);
            setFormOpen((open) => !open);
          }}
          aria-expanded={formOpen}
          aria-controls="sponsorship-form"
          className={cn(
            buttonClass,
            "border border-[#182B49] bg-white/80 text-[#182B49] hover:bg-white",
          )}
        >
          {formOpen ? "Hide sponsorship form" : "Become our sponsor"}
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

      {formOpen && (
        <form
          id="sponsorship-form"
          onSubmit={startSponsorship}
          className="mt-8 w-full rounded-[28px] border border-black/10 bg-white/80 p-6 text-left shadow-[0_24px_80px_rgba(24,43,73,0.08)] backdrop-blur-md md:p-8"
        >
          <h2 className="text-xl font-semibold tracking-tight text-[#182B49]">
            Sponsor Triton Motorsports
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/55">
            Choose an amount and we will hand you off to Stripe to finish
            securely. You will get an emailed receipt and invoice.
          </p>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Amount
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPONSORSHIP_AMOUNTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTier(option.id)}
                  aria-pressed={tier === option.id}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                    tier === option.id
                      ? "border-[#182B49] bg-[#182B49] text-[#F2F0EF]"
                      : "border-black/15 bg-white/70 text-[#182B49] hover:border-[#182B49]/50",
                  )}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTier("custom")}
                aria-pressed={tier === "custom"}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
                  tier === "custom"
                    ? "border-[#182B49] bg-[#182B49] text-[#F2F0EF]"
                    : "border-black/15 bg-white/70 text-[#182B49] hover:border-[#182B49]/50",
                )}
              >
                Custom
              </button>
            </div>
            {tier === "custom" && (
              <label className="mt-3 block">
                <span className="sr-only">Custom amount in US dollars</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-black/45">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customAmount}
                    onChange={(changeEvent) =>
                      setCustomAmount(changeEvent.target.value)
                    }
                    placeholder="1500"
                    className={fieldClass("pl-8")}
                  />
                </div>
              </label>
            )}
          </fieldset>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Your name" required>
              <input
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                value={sponsorName}
                onChange={(changeEvent) =>
                  setSponsorName(changeEvent.target.value)
                }
                className={fieldClass()}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(changeEvent) => setEmail(changeEvent.target.value)}
                className={fieldClass()}
              />
            </Field>
            <Field label="Company or organization">
              <input
                type="text"
                maxLength={120}
                autoComplete="organization"
                value={organization}
                onChange={(changeEvent) =>
                  setOrganization(changeEvent.target.value)
                }
                className={fieldClass()}
              />
            </Field>
            <Field label="Note to the team">
              <input
                type="text"
                maxLength={240}
                value={note}
                onChange={(changeEvent) => setNote(changeEvent.target.value)}
                className={fieldClass()}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={cn(
              buttonClass,
              "mt-6 w-full bg-[#182B49] text-[#F2F0EF] hover:bg-[#121f38] sm:w-auto",
            )}
          >
            {submitting ? "Opening Stripe…" : "Continue to Stripe"}
          </button>
        </form>
      )}

      {error && (
        <p className="mt-4 text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function fieldClass(extra?: string) {
  return cn(
    "w-full rounded-2xl border border-black/15 bg-white/70 px-4 py-3 text-sm text-[#0a1218] outline-none transition-colors placeholder:text-black/35 focus:border-[#182B49]",
    extra,
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
    </label>
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
