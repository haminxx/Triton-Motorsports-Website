"use client";

import { useState, type FormEvent } from "react";
import {
  MemberSignIn,
  type MemberSignInMode,
} from "@/components/ui/member-sign-in";
import { loadGoogleIdentityScript } from "@/lib/google-identity";
import {
  createStaffAccount,
  getGoogleClientId,
  isValidEmail,
  recoverStaffPassword,
  signInStaff,
  signInStaffWithGoogle,
} from "@/lib/staff-auth";

export function StaffAuthPanel() {
  const [mode, setMode] = useState<MemberSignInMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function resetStatus() {
    setError(null);
    setMessage(null);
  }

  function goTo(next: MemberSignInMode) {
    setMode(next);
    resetStatus();
    setPassword("");
    setConfirmPassword("");
    if (next === "signin") setInviteCode("");
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
        setBusy(false);
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

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetStatus();

    if (mode === "register") {
      await handleRegister();
      return;
    }
    if (mode === "recovery") {
      await handleRecovery();
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    const result = await signInStaff(email, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Access granted. Welcome, ${result.email}.`);
  }

  async function handleRegister() {
    if (!email.trim() || !password || !inviteCode.trim()) {
      setError("Enter your email, invite code, and password.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
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
    setPassword("");
    setConfirmPassword("");
    setInviteCode("");
    setMode("signin");
  }

  async function handleRecovery() {
    if (!email.trim() || !password || !inviteCode.trim()) {
      setError("Enter your email, invite code, and a new password.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
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
    setPassword("");
    setConfirmPassword("");
    setInviteCode("");
    setMode("signin");
  }

  return (
    <MemberSignIn
      mode={mode}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      inviteCode={inviteCode}
      error={error}
      message={message}
      busy={busy}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onInviteCodeChange={setInviteCode}
      onSubmit={handleSignIn}
      onGoogle={handleGoogleSignIn}
      onSignUp={() => goTo("register")}
      onForgotPassword={() => goTo("recovery")}
      onBack={() => goTo("signin")}
    />
  );
}
