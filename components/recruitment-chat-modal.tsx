"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, X } from "lucide-react";
import { getCookie, setCookie } from "@/lib/cookies";
import { getChatApiUrl } from "@/lib/recruitment";
import { cn } from "@/lib/utils";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

const COOKIE_KEY = "crs_recruitment_chat_v1";
const MAX_MESSAGES = 40;
const MAX_COOKIE_CHARS = 3500;

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = getCookie(COOKIE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        typeof m.id === "string" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

function persistMessages(messages: ChatMessage[]) {
  const trimmed = messages.slice(-MAX_MESSAGES);
  let payload = JSON.stringify(trimmed);
  while (payload.length > MAX_COOKIE_CHARS && trimmed.length > 2) {
    trimmed.shift();
    payload = JSON.stringify(trimmed);
  }
  setCookie(COOKIE_KEY, payload, 30);
}

const CHAT_FETCH_TIMEOUT_MS = 90_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAssistantReplyOnce(
  userText: string,
  history: ChatMessage[],
): Promise<string> {
  const prior = history
    .slice(0, -1)
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));

  let res: Response;
  try {
    res = await fetchWithTimeout(
      getChatApiUrl(),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: prior,
        }),
      },
      CHAT_FETCH_TIMEOUT_MS,
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Chat timed out (the free server may be waking up). Please try again in a moment.",
      );
    }
    throw new Error(
      "Could not reach the chat server. Please try again shortly, or use Contact / Fall 2026 Application.",
    );
  }

  let data: {
    reply?: string;
    error?: string;
    kind?: string;
    detail?: string;
  } = {};
  try {
    data = (await res.json()) as {
      reply?: string;
      error?: string;
      kind?: string;
      detail?: string;
    };
  } catch {
    /* non-JSON body */
  }

  if (!res.ok) {
    // Billing/credits is project-level — not a cold start or missing Drive file.
    if (data.kind === "billing" || /billing|quota/i.test(data.error || "")) {
      throw new Error(
        data.error ||
          "Chat is temporarily unavailable (OpenAI billing/quota). Please use Contact / Fall 2026 Application, or try again later.",
      );
    }
    if (data.kind === "invalid_key" || data.kind === "missing_key") {
      throw new Error(
        data.error ||
          "OpenAI API key problem. Update OPENAI_API_KEY in Render Environment.",
      );
    }
    throw new Error(
      data.error ||
        `Chat unavailable (${res.status}). Try again shortly, or use Contact / Fall 2026 Application.`,
    );
  }

  if (!data.reply?.trim()) {
    throw new Error(
      "No reply from the assistant. Please try again, or use Contact / Fall 2026 Application.",
    );
  }

  return data.reply.trim();
}

/** One automatic retry helps with Render free-tier cold starts / brief 502s. */
async function fetchAssistantReply(
  userText: string,
  history: ChatMessage[],
): Promise<string> {
  try {
    return await fetchAssistantReplyOnce(userText, history);
  } catch (first) {
    await new Promise((r) => setTimeout(r, 1500));
    try {
      return await fetchAssistantReplyOnce(userText, history);
    } catch {
      throw first instanceof Error
        ? first
        : new Error(
            "Chat is temporarily unavailable. Please try again, or use Contact / Fall 2026 Application.",
          );
    }
  }
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[#0a1218] text-[#F2F0EF]"
            : "bg-black/[0.05] text-[#0a1218]",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div
      className="flex items-center gap-[0.2rem] px-0.5"
      aria-label="Thinking"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-[0.35rem] rounded-full bg-black/40"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

type RecruitmentChatModalProps = {
  open: boolean;
  onClose: () => void;
  initialMessage?: string | null;
  seedKey?: number;
};

export function RecruitmentChatModal({
  open,
  onClose,
  initialMessage,
  seedKey = 0,
}: RecruitmentChatModalProps) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pendingInitial = useRef<string | null>(null);
  const lastSeedKey = useRef(-1);
  const busyRef = useRef(false);

  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, busy, error]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setError(null);
    setDraft("");

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    let historyForApi: ChatMessage[] = [];
    setMessages((prev) => {
      historyForApi = [...prev, userMsg];
      return historyForApi;
    });

    try {
      const reply = await fetchAssistantReply(trimmed, historyForApi);
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !initialMessage?.trim()) return;
    if (lastSeedKey.current === seedKey) return;
    lastSeedKey.current = seedKey;
    pendingInitial.current = initialMessage;
  }, [open, initialMessage, seedKey]);

  useEffect(() => {
    if (!open || !hydrated || busy) return;
    const pending = pendingInitial.current;
    if (!pending) return;
    pendingInitial.current = null;
    void send(pending);
  }, [open, hydrated, busy, send]);

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    void send(draft);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close chat"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex h-[min(78dvh,640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#F2F0EF] shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <div>
                <h2
                  id={titleId}
                  className="text-base font-semibold tracking-tight text-[#0a1218]"
                >
                  Triton Motorsports
                </h2>
                <p className="mt-0.5 text-xs text-black/40">
                  Ask about roles, tryouts, and how to join
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-full bg-black/[0.04] text-[#0a1218] transition hover:bg-black/[0.08]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <div
              ref={listRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
            >
              {messages.length === 0 && !busy && !error && (
                <p className="my-auto text-center text-sm text-black/40">
                  Ask anything about joining Triton Motorsports — drivers, engineers,
                  pit crew, media, and ops.
                </p>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-black/[0.05] px-3.5 py-2.5">
                    <ThinkingDots />
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>

            <form
              onSubmit={onSubmit}
              className="border-t border-black/[0.06] px-3 py-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-black/10 bg-[#f7f8f9] px-3 py-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  placeholder="Continue the conversation…"
                  disabled={busy}
                  className="max-h-28 min-h-[2rem] flex-1 resize-none bg-transparent py-1.5 text-sm text-[#0a1218] outline-none placeholder:text-black/35"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || busy}
                  aria-label="Send"
                  className={cn(
                    "mb-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition",
                    draft.trim() && !busy
                      ? "bg-[#0a1218] text-[#F2F0EF] hover:bg-black"
                      : "bg-black/[0.06] text-black/30",
                  )}
                >
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
