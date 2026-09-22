const test = require("node:test");
const assert = require("node:assert/strict");
const {
  classifyStripeKey,
  integrationIdentifier,
  parseSponsorshipRequest,
  resolveSiteOrigin,
  checkoutParams,
  donationCheckoutParams,
  publicStripeError,
} = require("./sponsorship");

test("classifies sandbox and live keys without echoing them", () => {
  assert.equal(classifyStripeKey(""), "missing");
  assert.equal(classifyStripeKey("sk_test_abc"), "test");
  assert.equal(classifyStripeKey("rk_test_abc"), "test");
  assert.equal(classifyStripeKey("sk_live_abc"), "live");
  assert.equal(classifyStripeKey("rk_live_abc"), "live");
  assert.equal(classifyStripeKey("pk_test_abc"), "invalid");
});

test("rejects amounts outside $1 to $25,000 and incomplete sponsor details", () => {
  const missing = parseSponsorshipRequest({
    sponsorName: "A",
    email: "not-an-email",
    amountCents: 50,
    tier: "custom",
  });
  assert.equal(missing.ok, false);

  const ok = parseSponsorshipRequest({
    sponsorName: "Alex Rivera",
    email: "Alex@Example.com",
    organization: "Harbor Lab",
    note: "Logo on the car",
    amountCents: 25000,
    tier: "250",
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.email, "alex@example.com");
  assert.equal(ok.value.amountCents, 25000);

  const tooHigh = parseSponsorshipRequest({
    sponsorName: "Alex Rivera",
    email: "alex@example.com",
    amountCents: 2_500_001,
    tier: "custom",
  });
  assert.equal(tooHigh.ok, false);
});

test("builds a hosted Checkout session without payment_method_types or tax", () => {
  const parsed = parseSponsorshipRequest({
    sponsorName: "Alex Rivera",
    email: "alex@example.com",
    organization: "Harbor Lab",
    note: "",
    amountCents: 10000,
    tier: "100",
  });
  const params = checkoutParams(parsed.value, "http://localhost:3000");
  assert.equal(params.mode, "payment");
  assert.equal(params.customer_email, "alex@example.com");
  assert.equal(params.line_items[0].price_data.unit_amount, 10000);
  assert.equal(params.line_items[0].price_data.currency, "usd");
  assert.equal(params.metadata.purpose, "sponsorship");
  assert.equal("payment_method_types" in params, false);
  assert.equal("automatic_tax" in params, false);
  assert.match(params.integration_identifier, /^crs_sponsorship_[a-z]{8}$/);
  assert.match(params.success_url, /\{CHECKOUT_SESSION_ID\}$/);
  assert.equal(
    params.cancel_url,
    "http://localhost:3000/sponsors/?checkout=canceled",
  );
});

test("integration identifier suffix is eight letters", () => {
  for (let i = 0; i < 20; i += 1) {
    assert.match(integrationIdentifier(), /^crs_sponsorship_[a-z]{8}$/);
  }
});

test("return origin stays on the team site", () => {
  assert.equal(
    resolveSiteOrigin("https://evil.example"),
    "https://ucsdxcrs.web.app",
  );
  assert.equal(
    resolveSiteOrigin("http://localhost:3000"),
    "http://localhost:3000",
  );
  assert.equal(
    resolveSiteOrigin("https://www.tritonmotorsports.org"),
    "https://www.tritonmotorsports.org",
  );
});

test("public errors do not mention secret values", () => {
  const message = publicStripeError("missing_key");
  assert.equal(/sk_|rk_|whsec_/.test(message), false);
});

test("donation checkout lets Stripe collect the amount", () => {
  const params = donationCheckoutParams("price_test", "http://localhost:3000");
  assert.equal(params.mode, "payment");
  assert.equal(params.submit_type, "donate");
  assert.equal(params.metadata.purpose, "donation");
  assert.equal(params.line_items[0].price, "price_test");
  assert.equal("payment_method_types" in params, false);
  assert.equal("automatic_tax" in params, false);
  assert.equal("unit_amount" in (params.line_items[0].price_data || {}), false);
  assert.match(params.integration_identifier, /^crs_donation_[a-z]{8}$/);
  assert.equal(
    params.cancel_url,
    "http://localhost:3000/sponsors/?checkout=canceled",
  );
});
