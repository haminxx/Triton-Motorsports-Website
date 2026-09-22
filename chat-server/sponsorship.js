const crypto = require("crypto");
const Stripe = require("stripe");

const MIN_AMOUNT_CENTS = 100;
const MAX_AMOUNT_CENTS = 2_500_000;
const DEFAULT_SITE_ORIGIN = "https://ucsdxcrs.web.app";

const ALLOWED_ORIGINS = new Set([
  "https://ucsdxcrs.web.app",
  "https://ucsdxcrs.firebaseapp.com",
  "https://tritonmotorsports.org",
  "https://www.tritonmotorsports.org",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function normalizeSecret(raw) {
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

function classifyStripeKey(key) {
  if (!key) return "missing";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  return "invalid";
}

function integrationIdentifier() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(8);
  let suffix = "";
  for (let i = 0; i < 8; i += 1) suffix += alphabet[bytes[i] % 26];
  return `crs_sponsorship_${suffix}`;
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function parseSponsorshipRequest(body) {
  const sponsorName = cleanText(body?.sponsorName, 80);
  const email = cleanText(body?.email, 254).toLowerCase();
  const organization = cleanText(body?.organization, 120);
  const note = cleanText(body?.note, 240);
  const tier = cleanText(body?.tier, 40) || "custom";
  const amountCents = body?.amountCents;
  const errors = [];

  if (sponsorName.length < 2) errors.push("Enter the sponsor name.");
  if (!isEmail(email)) errors.push("Enter a valid email address.");
  if (
    !Number.isInteger(amountCents) ||
    amountCents < MIN_AMOUNT_CENTS ||
    amountCents > MAX_AMOUNT_CENTS
  ) {
    errors.push("Enter an amount between $1 and $25,000.");
  }
  if (!/^[a-z0-9_-]{1,40}$/i.test(tier)) {
    errors.push("Choose a sponsorship amount.");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: { sponsorName, email, organization, note, tier, amountCents },
  };
}

function resolveSiteOrigin(originHeader) {
  if (originHeader && ALLOWED_ORIGINS.has(originHeader)) return originHeader;
  const configured = normalizeSecret(process.env.STRIPE_SITE_URL).replace(
    /\/$/,
    "",
  );
  if (configured && ALLOWED_ORIGINS.has(configured)) return configured;
  return DEFAULT_SITE_ORIGIN;
}

function stripeRuntime() {
  const key = normalizeSecret(process.env.STRIPE_SECRET_KEY);
  const mode = classifyStripeKey(key);
  const liveAllowed = process.env.STRIPE_ALLOW_LIVE === "true";
  return { key, mode, liveAllowed };
}

function getStripeClient() {
  const { key, mode, liveAllowed } = stripeRuntime();
  if (mode === "missing") {
    const err = new Error("missing_key");
    err.code = "missing_key";
    throw err;
  }
  if (mode === "invalid") {
    const err = new Error("invalid_key");
    err.code = "invalid_key";
    throw err;
  }
  if (mode === "live" && !liveAllowed) {
    const err = new Error("live_disabled");
    err.code = "live_disabled";
    throw err;
  }
  return new Stripe(key);
}

function publicStripeError(code) {
  switch (code) {
    case "missing_key":
      return "Sponsorship checkout is not set up yet. Add the sandbox secret key on the server.";
    case "invalid_key":
      return "The Stripe key on the server is not a valid test or restricted key.";
    case "live_disabled":
      return "Live charges are turned off. Use a sandbox test key until the Chase payout account is ready.";
    default:
      return "Sponsorship checkout is temporarily unavailable. Please try again.";
  }
}

function stripeHealth() {
  const { mode, liveAllowed } = stripeRuntime();
  return {
    stripeConfigured:
      mode === "test" || (mode === "live" && liveAllowed),
    stripeMode: mode,
    stripeLiveAllowed: liveAllowed,
    stripeWebhookConfigured: Boolean(
      normalizeSecret(process.env.STRIPE_WEBHOOK_SECRET),
    ),
  };
}

function checkoutParams(value, origin) {
  const description = value.organization
    ? `${value.sponsorName} · ${value.organization}`
    : value.sponsorName;

  return {
    mode: "payment",
    customer_email: value.email,
    customer_creation: "always",
    client_reference_id: value.sponsorName.slice(0, 200),
    integration_identifier: integrationIdentifier(),
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: "Triton Motorsports sponsorship",
        footer: "Triton Motorsports — Collegiate Racing Series sponsorship.",
        metadata: {
          sponsor_name: value.sponsorName,
          organization: value.organization,
        },
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: value.amountCents,
          product_data: {
            name: "Triton Motorsports sponsorship",
            description: description.slice(0, 200),
          },
        },
      },
    ],
    metadata: {
      purpose: "sponsorship",
      sponsor_name: value.sponsorName,
      sponsor_email: value.email,
      organization: value.organization,
      tier: value.tier,
      note: value.note,
    },
    success_url: `${origin}/sponsors/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/sponsors/?checkout=canceled`,
  };
}

async function createSponsorshipCheckout(body, originHeader, idempotencyKey) {
  const parsed = parseSponsorshipRequest(body);
  if (!parsed.ok) {
    return { status: 400, body: { error: parsed.errors[0] } };
  }

  const stripe = getStripeClient();
  const origin = resolveSiteOrigin(originHeader);
  const params = checkoutParams(parsed.value, origin);
  const requestOptions = {};
  if (
    typeof idempotencyKey === "string" &&
    /^[A-Za-z0-9_-]{8,255}$/.test(idempotencyKey)
  ) {
    requestOptions.idempotencyKey = idempotencyKey;
  }

  const session = await stripe.checkout.sessions.create(params, requestOptions);
  if (!session.url) {
    return { status: 502, body: { error: publicStripeError("unknown") } };
  }
  return { status: 200, body: { url: session.url } };
}

function sessionErrorStatus(err) {
  if (
    err?.code === "missing_key" ||
    err?.code === "invalid_key" ||
    err?.code === "live_disabled"
  ) {
    return 503;
  }
  return 502;
}

async function checkoutHandler(req, res) {
  try {
    const headerKey = req.get("idempotency-key");
    const result = await createSponsorshipCheckout(
      req.body,
      req.get("origin"),
      headerKey,
    );
    res.status(result.status).json(result.body);
  } catch (err) {
    const code = err?.code || "unknown";
    console.error(
      "sponsorship checkout error",
      code,
      err instanceof Error ? err.message.slice(0, 240) : "unknown",
    );
    res.status(sessionErrorStatus(err)).json({ error: publicStripeError(code) });
  }
}

async function sessionHandler(req, res) {
  const sessionId = typeof req.query.session_id === "string" ? req.query.session_id : "";
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    res.status(400).json({ error: "Invalid checkout session." });
    return;
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.purpose !== "sponsorship") {
      res.status(404).json({ error: "Sponsorship checkout not found." });
      return;
    }
    res.status(200).json({
      paymentStatus: session.payment_status,
      status: session.status,
      amountTotal: session.amount_total,
      currency: session.currency,
      sponsorName: session.metadata.sponsor_name || "",
      organization: session.metadata.organization || "",
      email: session.customer_details?.email || session.customer_email || "",
    });
  } catch (err) {
    if (err?.code === "resource_missing" || err?.statusCode === 404) {
      res.status(404).json({ error: "Sponsorship checkout not found." });
      return;
    }
    const code = err?.code || "unknown";
    console.error(
      "sponsorship session error",
      code,
      err instanceof Error ? err.message.slice(0, 240) : "unknown",
    );
    res.status(sessionErrorStatus(err)).json({ error: publicStripeError(code) });
  }
}

async function webhookHandler(req, res) {
  const secret = normalizeSecret(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secret) {
    res.status(503).json({ error: "Webhook signing secret is not configured." });
    return;
  }
  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: "Expected a raw webhook body." });
    return;
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    res
      .status(sessionErrorStatus(err))
      .json({ error: publicStripeError(err?.code) });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.get("stripe-signature"),
      secret,
    );
  } catch (err) {
    console.error(
      "sponsorship webhook signature error",
      err instanceof Error ? err.message.slice(0, 180) : "invalid",
    );
    res.status(400).json({ error: "Invalid Stripe signature." });
    return;
  }

  const tracked = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
  ]);
  if (tracked.has(event.type)) {
    const session = event.data?.object || {};
    if (session.metadata?.purpose === "sponsorship") {
      console.log(
        JSON.stringify({
          source: "sponsorship-webhook",
          event: event.type,
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
          currency: session.currency,
          sponsorName: session.metadata.sponsor_name || null,
          organization: session.metadata.organization || null,
        }),
      );
    }
  }

  res.status(200).json({ received: true });
}

module.exports = {
  ALLOWED_ORIGINS,
  MIN_AMOUNT_CENTS,
  MAX_AMOUNT_CENTS,
  classifyStripeKey,
  integrationIdentifier,
  parseSponsorshipRequest,
  resolveSiteOrigin,
  checkoutParams,
  stripeHealth,
  publicStripeError,
  checkoutHandler,
  sessionHandler,
  webhookHandler,
};
