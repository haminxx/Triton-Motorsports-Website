const express = require("express");
const cors = require("cors");
const {
  refreshKnowledge,
  getKnowledge,
  getHealthFields,
} = require("./drive-knowledge");

const PORT = Number(process.env.PORT) || 10000;

/** Strip quotes/newlines from copy-paste mistakes in Render Environment. */
function normalizeApiKey(raw) {
  if (raw == null) return "";
  let key = String(raw)
    .replace(/^\uFEFF/, "")
    .replace(/[\r\n]+/g, "")
    .trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

function openAiKeyLooksValid(key) {
  return /^sk-[A-Za-z0-9_-]{10,}$/.test(key);
}

const OPENAI_API_KEY = normalizeApiKey(process.env.OPENAI_API_KEY);
const OPENAI_MODEL =
  process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

const ALLOWED_ORIGINS = new Set([
  "https://ucsdxcrs.web.app",
  "https://ucsdxcrs.firebaseapp.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function buildSystemPrompt(knowledge) {
  return [
    "You are the Triton Motorsports recruitment assistant on the official website.",
    "Answer ONLY using the knowledge base below. Do not invent deadlines, fees, schedules, or policies.",
    "If the answer is not in the knowledge base, say you do not have that information yet and suggest the Fall 2026 Application CTA on the Recruitment page and/or the Contact page.",
    "Keep replies concise (2–5 short sentences). Be friendly and practical.",
    "",
    "=== KNOWLEDGE BASE ===",
    knowledge,
    "=== END KNOWLEDGE BASE ===",
  ].join("\n");
}

function toOpenAiMessages(systemPrompt, history, message) {
  const messages = [{ role: "system", content: systemPrompt }];

  for (const turn of (history || []).slice(-12)) {
    if (!turn?.content?.trim()) continue;
    if (turn.role !== "user" && turn.role !== "assistant") continue;
    messages.push({
      role: turn.role,
      content: String(turn.content).trim().slice(0, 2000),
    });
  }

  messages.push({
    role: "user",
    content: String(message).trim().slice(0, 2000),
  });

  return messages;
}

function classifyOpenAiError(message, status) {
  const m = String(message || "");
  if (
    /invalid.?api.?key|incorrect api key|invalid_api_key|authentication/i.test(
      m,
    ) ||
    status === 401
  ) {
    return "invalid_key";
  }
  if (
    /insufficient_quota|billing|payment|exceeded|rate.?limit|429/i.test(m) ||
    status === 429
  ) {
    return "billing";
  }
  if (/model.*not found|does not exist|404/i.test(m) || status === 404) {
    return "model_unavailable";
  }
  return "unknown";
}

function publicErrorMessage(kind) {
  switch (kind) {
    case "invalid_key":
      return "Chat server OpenAI API key is invalid. Update OPENAI_API_KEY in Render Environment (from https://platform.openai.com/api-keys).";
    case "billing":
      return "Chat is temporarily unavailable (OpenAI billing/quota). Add credits at https://platform.openai.com/settings/organization/billing, or use Contact / Fall 2026 Application.";
    case "model_unavailable":
      return "Chat model is unavailable. Try again later, or use Contact / Fall 2026 Application.";
    default:
      return "Chat is temporarily unavailable. Please try again, or use Contact / Fall 2026 Application.";
  }
}

async function callOpenAi(apiKey, systemPrompt, history, message) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: toOpenAiMessages(systemPrompt, history, message),
      temperature: 0.4,
      max_tokens: 512,
    }),
  });

  const data = await res.json();
  const errMsg =
    data?.error?.message || `OpenAI HTTP ${res.status}`;

  if (!res.ok) {
    const err = new Error(errMsg);
    err.status = res.status;
    err.kind = classifyOpenAiError(errMsg, res.status);
    throw err;
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    const err = new Error("Empty OpenAI response");
    err.kind = "unknown";
    throw err;
  }

  return text;
}

const app = express();
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "32kb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ucsdxcrs-recruitment-chat",
    provider: "openai",
    website: "https://ucsdxcrs.web.app/recruitment/",
    chatEndpoint: "POST /api/recruitment-chat",
    note: "API server only — visit the website URL above for the recruitment page.",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "openai",
    hasKey: Boolean(OPENAI_API_KEY),
    keyFormatValid: openAiKeyLooksValid(OPENAI_API_KEY),
    model: OPENAI_MODEL,
    ...getHealthFields(),
  });
});

app.post("/api/recruitment-chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(503).json({
      error:
        "Chat server is missing OPENAI_API_KEY. Add it in Render Environment.",
      kind: "missing_key",
    });
    return;
  }

  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message || message.length > 2000) {
    res.status(400).json({ error: "Invalid message", kind: "bad_request" });
    return;
  }

  const historyRaw = Array.isArray(req.body?.history) ? req.body.history : [];
  const history = historyRaw
    .filter(
      (t) =>
        t &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string",
    )
    .slice(-12);

  try {
    const { text: knowledge } = await getKnowledge();
    const reply = await callOpenAi(
      OPENAI_API_KEY,
      buildSystemPrompt(knowledge),
      history,
      message,
    );
    res.status(200).json({ reply });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const kind = err?.kind || classifyOpenAiError(detail, err?.status);
    console.error("recruitment-chat error", kind, detail);
    res.status(502).json({
      error: publicErrorMessage(kind),
      kind,
      detail: detail.slice(0, 240),
    });
  }
});

refreshKnowledge({ force: true }).catch((err) => {
  console.warn(
    "drive-knowledge: initial sync failed",
    err instanceof Error ? err.message : err,
  );
});

app.listen(PORT, () => {
  if (OPENAI_API_KEY && !openAiKeyLooksValid(OPENAI_API_KEY)) {
    console.warn(
      "OPENAI_API_KEY is set but does not look like an OpenAI key (expected sk-… from https://platform.openai.com/api-keys).",
    );
  }
  console.log(
    `Recruitment chat listening on :${PORT} (provider=openai, model=${OPENAI_MODEL})`,
  );
});
