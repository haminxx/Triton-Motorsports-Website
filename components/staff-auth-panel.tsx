"use client";

import { useEffect, useRef, useState, type FormEvent, type SVGProps } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import {
  createStaffAccount,
  getGoogleClientId,
  isValidEmail,
  recoverStaffPassword,
  signInStaff,
  signInStaffWithGoogle,
} from "@/lib/staff-auth";
import { loadGoogleIdentityScript } from "@/lib/google-identity";

type AuthStep = "email" | "password" | "register" | "recovery";

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-6 w-6">
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

function GlassField({
  icon,
  trailing,
  children,
}: {
  icon: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-input-wrap w-full">
      <div className="glass-input">
        <span className="glass-input-text-area" />
        <div className="relative z-10 flex w-10 shrink-0 items-center justify-center pl-2">
          {icon}
        </div>
        {children}
        {trailing}
      </div>
    </div>
  );
}

export function StaffAuthPanel() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailValid = isValidEmail(email);
  const passwordReady = password.length >= 8;

  useEffect(() => {
    if (step === "password") {
      const timer = window.setTimeout(() => passwordRef.current?.focus(), 280);
      return () => window.clearTimeout(timer);
    }
  }, [step]);

  function resetStatus() {
    setError(null);
    setMessage(null);
  }

  function goTo(next: AuthStep) {
    setStep(next);
    resetStatus();
    setPassword("");
    setConfirmPassword("");
    if (next === "email") setInviteCode("");
  }

  async function handleGoogleSignIn() {
    resetStatus();
    const clientId = getGoogleClientId();
    if (!clientId) {
      setError(
        "Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and rebuild.",
      );
      return;
    }

    setBusy(true);
    try {
      await loadGoogleIdentityScript();
      if (!window.google?.accounts?.id) {
        setError("Google sign-in failed to initialize.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          const result = await signInStaffWithGoogle(response.credential);
          setBusy(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setMessage(`Access granted. Welcome, ${result.email}.`);
        },
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setBusy(false);
          setError("Google sign-in was dismissed. Try again, or use email.");
        }
      });
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof Error ? err.message : "Google sign-in is unavailable.",
      );
    }
  }

  async function handleSignIn(event: FormEvent) {
    event.preventDefault();
    if (!emailValid || !passwordReady) return;
    resetStatus();
    setBusy(true);
    const result = await signInStaff(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Access granted. Welcome, ${result.email}.`);
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    resetStatus();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await createStaffAccount(email, password, inviteCode);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Account created. You can sign in now.");
    goTo("email");
  }

  async function handleRecovery(event: FormEvent) {
    event.preventDefault();
    resetStatus();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const result = await recoverStaffPassword(email, inviteCode, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Password updated. Sign in with your new password.");
    goTo("email");
  }

  const headline =
    step === "password"
      ? "Enter your password"
      : step === "register"
        ? "Create an account"
        : step === "recovery"
          ? "Reset password"
          : "Welcome back";

  const subhead =
    step === "password"
      ? "Your password must be at least 8 characters."
      : step === "register"
        ? "Use your email and a staff invite code."
        : step === "recovery"
          ? "Confirm your invite code and choose a new password."
          : "Continue with Google or email";

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/images/triton-motor-sports-logo.png"
          alt=""
          width={36}
          height={36}
          className="h-8 w-auto object-contain"
          unoptimized
        />
        <p className="text-base font-bold text-[#F2F0EF]">Triton Motorsports</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="flex w-full flex-col items-center gap-3 text-center"
        >
          <BlurFade delay={0.05} className="w-full">
            <h1 className="font-serif text-4xl font-light tracking-tight text-[#F2F0EF] sm:text-5xl">
              {headline}
            </h1>
          </BlurFade>
          <BlurFade delay={0.12}>
            <p className="text-sm font-medium text-[#F2F0EF]/60">{subhead}</p>
          </BlurFade>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {message ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-center text-sm text-[#78dcca]"
          >
            {message}
          </motion.p>
        ) : null}
        {error ? (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 text-center text-sm text-[#ff9d77]"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {step === "email" && (
        <div className="mt-8 flex w-full max-w-[300px] flex-col items-center gap-5">
          <BlurFade delay={0.18}>
            <GlassButton
              type="button"
              size="sm"
              onClick={handleGoogleSignIn}
              disabled={busy}
              contentClassName="flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              <span className="font-semibold text-[#F2F0EF]">Google</span>
            </GlassButton>
          </BlurFade>
          <BlurFade delay={0.24} className="w-full">
            <div className="flex w-full items-center gap-2 py-1">
              <hr className="w-full border-[#F2F0EF]/20" />
              <span className="text-xs font-semibold text-[#F2F0EF]/45">OR</span>
              <hr className="w-full border-[#F2F0EF]/20" />
            </div>
          </BlurFade>
        </div>
      )}

      <form
        onSubmit={
          step === "register"
            ? handleRegister
            : step === "recovery"
              ? handleRecovery
              : handleSignIn
        }
        className="mt-4 w-full max-w-[300px] space-y-5"
      >
        {(step === "email" || step === "register" || step === "recovery") && (
          <GlassField icon={<Mail className="h-5 w-5 shrink-0 text-[#F2F0EF]/80" />}>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && step === "email" && emailValid) {
                  e.preventDefault();
                  goTo("password");
                }
              }}
              className="relative z-10 h-11 w-0 flex-grow bg-transparent text-[#F2F0EF] placeholder:text-[#F2F0EF]/50 focus:outline-none"
              required
            />
            {step === "email" ? (
              <div
                className={cn(
                  "relative z-10 shrink-0 overflow-hidden transition-all duration-300",
                  emailValid ? "w-10 pr-1" : "w-0",
                )}
              >
                <GlassButton
                  type="button"
                  size="icon"
                  aria-label="Continue with email"
                  onClick={() => emailValid && goTo("password")}
                  contentClassName="text-[#F2F0EF]/80"
                >
                  <ArrowRight className="h-5 w-5" />
                </GlassButton>
              </div>
            ) : null}
          </GlassField>
        )}

        {step === "password" && (
          <>
            <p className="px-4 text-left text-xs font-semibold text-[#F2F0EF]/50">
              {email}
            </p>
            <GlassField
              icon={
                passwordReady ? (
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-2 text-[#F2F0EF]/80 transition-colors hover:text-[#F2F0EF]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                ) : (
                  <Lock className="h-5 w-5 shrink-0 text-[#F2F0EF]/80" />
                )
              }
              trailing={
                <div
                  className={cn(
                    "relative z-10 shrink-0 overflow-hidden transition-all duration-300",
                    passwordReady ? "w-10 pr-1" : "w-0",
                  )}
                >
                  <GlassButton
                    type="submit"
                    size="icon"
                    disabled={busy}
                    aria-label="Sign in"
                    contentClassName="text-[#F2F0EF]/80"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </GlassButton>
                </div>
              }
            >
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative z-10 h-11 w-0 flex-grow bg-transparent text-[#F2F0EF] placeholder:text-[#F2F0EF]/50 focus:outline-none"
                required
              />
            </GlassField>
            <button
              type="button"
              onClick={() => goTo("email")}
              className="flex items-center gap-2 text-sm text-[#F2F0EF]/70 transition-colors hover:text-[#F2F0EF]"
            >
              <ArrowLeft className="h-4 w-4" /> Go back
            </button>
          </>
        )}

        {(step === "register" || step === "recovery") && (
          <>
            <GlassField icon={<Lock className="h-5 w-5 shrink-0 text-[#F2F0EF]/80" />}>
              <input
                type="text"
                name="inviteCode"
                autoComplete="off"
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="relative z-10 h-11 w-0 flex-grow bg-transparent text-[#F2F0EF] placeholder:text-[#F2F0EF]/50 focus:outline-none"
                required
              />
            </GlassField>
            <GlassField icon={<Lock className="h-5 w-5 shrink-0 text-[#F2F0EF]/80" />}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder={step === "recovery" ? "New password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative z-10 h-11 w-0 flex-grow bg-transparent text-[#F2F0EF] placeholder:text-[#F2F0EF]/50 focus:outline-none"
                required
                minLength={8}
              />
            </GlassField>
            <GlassField icon={<Lock className="h-5 w-5 shrink-0 text-[#F2F0EF]/80" />}>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative z-10 h-11 w-0 flex-grow bg-transparent text-[#F2F0EF] placeholder:text-[#F2F0EF]/50 focus:outline-none"
                required
                minLength={8}
              />
            </GlassField>
            <GlassButton type="submit" disabled={busy} className="w-full">
              {busy
                ? "Processing…"
                : step === "recovery"
                  ? "Reset password"
                  : "Create account"}
            </GlassButton>
            <button
              type="button"
              onClick={() => goTo("email")}
              className="flex items-center gap-2 text-sm text-[#F2F0EF]/70 transition-colors hover:text-[#F2F0EF]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
          </>
        )}
      </form>

      {step === "email" && (
        <div className="mt-8 flex w-full max-w-[300px] items-center justify-between gap-3 text-xs font-medium tracking-wide text-[#F2F0EF]/50">
          <button
            type="button"
            onClick={() => goTo("recovery")}
            className="transition-colors hover:text-[#F2F0EF]"
          >
            Forgot password
          </button>
          <button
            type="button"
            onClick={() => goTo("register")}
            className="transition-colors hover:text-[#F2F0EF]"
          >
            Create account
          </button>
        </div>
      )}
    </div>
  );
}
