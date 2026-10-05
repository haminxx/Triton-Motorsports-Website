"use client";

import Image from "next/image";
import type { FormEvent, ReactNode, SVGProps } from "react";

export type MemberSignInMode = "signin" | "register" | "recovery";

type MemberSignInProps = {
  mode: MemberSignInMode;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
  error: string | null;
  message: string | null;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onInviteCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
};

const fieldClassName =
  "w-full rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/40";

function GoogleMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden>
      <g fillRule="evenodd" fill="none">
        <g fillRule="nonzero" transform="translate(3, 2)">
          <path
            fill="#4285F4"
            d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"
          />
          <path
            fill="#34A853"
            d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"
          />
          <path
            fill="#FBBC05"
            d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"
          />
          <path
            fill="#EB4335"
            d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"
          />
        </g>
      </g>
    </svg>
  );
}

function Field({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

/**
 * Glass member-login card. The outer wrapper stays transparent so a page-level
 * background video remains visible; blur lives on the card only.
 */
export function MemberSignIn({
  mode,
  email,
  password,
  confirmPassword,
  inviteCode,
  error,
  message,
  busy,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onInviteCodeChange,
  onSubmit,
  onGoogle,
  onSignUp,
  onForgotPassword,
  onBack,
}: MemberSignInProps) {
  const title =
    mode === "register"
      ? "Create account"
      : mode === "recovery"
        ? "Reset password"
        : "Member Login";

  const submitLabel = busy
    ? "Please wait…"
    : mode === "register"
      ? "Create account"
      : mode === "recovery"
        ? "Reset password"
        : "Sign in";

  return (
    <div className="relative z-10 flex w-full flex-col items-center bg-transparent">
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/25 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),rgba(18,18,18,0.22))] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/20 shadow-lg">
          <Image
            src="/images/triton-motor-sports-logo.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 object-contain"
            unoptimized
          />
        </div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-white">
          <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-white/60">
            Triton Motorsports
          </span>
          {title}
        </h2>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4" noValidate>
          <div className="flex w-full flex-col gap-3">
            <Field>
              <input
                placeholder="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                className={fieldClassName}
                onChange={(event) => onEmailChange(event.target.value)}
                aria-label="Email"
              />
            </Field>

            {mode !== "signin" ? (
              <Field>
                <input
                  placeholder="Invite code"
                  type="text"
                  name="inviteCode"
                  autoComplete="off"
                  value={inviteCode}
                  className={fieldClassName}
                  onChange={(event) => onInviteCodeChange(event.target.value)}
                  aria-label="Invite code"
                />
              </Field>
            ) : null}

            <Field>
              <input
                placeholder={mode === "recovery" ? "New password" : "Password"}
                type="password"
                name="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                className={fieldClassName}
                onChange={(event) => onPasswordChange(event.target.value)}
                aria-label={mode === "recovery" ? "New password" : "Password"}
              />
            </Field>

            {mode !== "signin" ? (
              <Field>
                <input
                  placeholder="Confirm password"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  className={fieldClassName}
                  onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  aria-label="Confirm password"
                />
              </Field>
            ) : null}

            {error ? (
              <div className="text-left text-sm text-red-400" role="alert">
                {error}
              </div>
            ) : null}
            {message ? (
              <div className="text-left text-sm text-emerald-300" role="status">
                {message}
              </div>
            ) : null}
          </div>

          <hr className="border-white/15 opacity-80" />

          <div>
            <button
              type="submit"
              disabled={busy}
              className="mb-3 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
            >
              {submitLabel}
            </button>

            {mode === "signin" ? (
              <button
                type="button"
                onClick={onGoogle}
                disabled={busy}
                className="mb-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#232526] to-[#2d2e30] px-5 py-3 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
              >
                <GoogleMark className="h-5 w-5" />
                Continue with Google
              </button>
            ) : null}

            <div className="mt-2 w-full text-center">
              {mode === "signin" ? (
                <span className="text-xs text-gray-300">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="text-white/80 underline hover:text-white"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-xs text-white/80 underline hover:text-white"
                >
                  Back to sign in
                </button>
              )}
            </div>

            {mode === "signin" ? (
              <div className="mt-3 w-full text-center">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-white/60 underline hover:text-white"
                >
                  Forgot password?
                </button>
              </div>
            ) : null}
          </div>
        </form>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-center px-2 text-center sm:mt-12">
        <p className="text-sm text-white/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
          Join <span className="font-medium text-white">the crew</span> building
          Triton Motorsports.
        </p>
      </div>
    </div>
  );
}

export default MemberSignIn;
