# Recruitment chat server (Render + OpenAI)

Small Express proxy: browser → this server → OpenAI Chat API.
The OpenAI API key stays in Render Environment — never in the static site or GitHub.

Knowledge for the chatbot is loaded from a **Google Drive folder** (when configured) and falls back to `knowledge.md` if Drive sync fails.

## Quick setup (you do this once)

### 1. Get an OpenAI API key

OpenAI does **not** have a permanent free API tier like Gemini. You need an account with billing enabled, but **`gpt-4o-mini`** is very cheap for a small recruitment chatbot (often pennies per month).

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / log in
3. Open [API keys](https://platform.openai.com/api-keys) → **Create new secret key**
4. Copy the key (starts with `sk-…`) — you won't see it again
5. Open [Billing](https://platform.openai.com/settings/organization/billing) and add a payment method + a small credit limit (e.g. $5/month) if prompted

New accounts sometimes receive starter credits — check your [Usage](https://platform.openai.com/usage) page.

### 2. Google Drive knowledge sync

The chatbot reads from this folder:

- Folder: [CRS recruitment knowledge](https://drive.google.com/drive/folders/1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF?usp=sharing)
- Folder ID: `1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF`

Supported file types:

| Type | Handling |
| --- | --- |
| Google Docs | Exported as plain text |
| PDF | Text extracted with `pdf-parse` |
| Other | Skipped with a warning in server logs |

The server caches Drive content in memory (default **10 minutes**) and refreshes on startup and when the cache is stale.

#### Option A — Service account (recommended)

Most reliable for listing folder contents on Render.

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project
2. **APIs & Services** → **Library** → enable **Google Drive API**
3. **APIs & Services** → **Credentials** → **Create credentials** → **Service account**
4. Create the account → **Keys** → **Add key** → **JSON** → download the JSON file
5. Open the JSON and copy the `client_email` value (e.g. `ucsd-crs-chat@….iam.gserviceaccount.com`)
6. In Google Drive, open the [knowledge folder](https://drive.google.com/drive/folders/1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF?usp=sharing) → **Share** → add the service account email as **Viewer**
7. On Render, set `GOOGLE_SERVICE_ACCOUNT_JSON` to either:
   - The full JSON string (paste as one line), or
   - Base64-encoded JSON (easier for multiline paste issues)

#### Option B — API key (public folder)

May work if the folder and all files are shared as **Anyone with the link → Viewer**. Listing folders with only an API key is less reliable than a service account.

1. Google Cloud Console → enable **Google Drive API**
2. **Credentials** → **Create credentials** → **API key**
3. Restrict the key to **Google Drive API** (recommended)
4. On Render, set `GOOGLE_API_KEY`

If listing fails with a 403/404, switch to Option A and share the folder with the service account.

#### Render environment variables (Drive)

| Variable | Required | Description |
| --- | --- | --- |
| `GOOGLE_DRIVE_FOLDER_ID` | No (has default) | `1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | One of these | Service account JSON (raw or base64) |
| `GOOGLE_API_KEY` | One of these | Google API key for public folder access |
| `DRIVE_KNOWLEDGE_TTL_MS` | No | Cache TTL in ms (default `600000` = 10 min) |
| `DRIVE_KNOWLEDGE_MAX_CHARS` | No | Max knowledge chars (default `80000`) |

Until Drive credentials are set, the server uses `knowledge.md` automatically.

### 3. Update Render

1. [Render Dashboard](https://dashboard.render.com) → **ucsd-x-crs-website**
2. **Environment**:
   - **Delete** `GEMINI_API_KEY` and `GEMINI_MODEL` (no longer used)
   - **Add** `OPENAI_API_KEY` = your `sk-…` key (no quotes)
   - **Add** `OPENAI_MODEL` = `gpt-4o-mini` (optional — this is the default)
   - **Add** `GOOGLE_DRIVE_FOLDER_ID` = `1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF` (optional — default in code)
   - **Add** `GOOGLE_SERVICE_ACCOUNT_JSON` and/or `GOOGLE_API_KEY` (see above)
3. **Settings** (confirm):
   - Root Directory = `chat-server`
   - Build Command = `npm install`
   - Start Command = `npm start`
4. **Manual Deploy** → **Clear build cache & deploy** (after first Drive setup)
5. Wait until **Live**, then open `/health` — expect:

```json
{
  "ok": true,
  "provider": "openai",
  "hasKey": true,
  "keyFormatValid": true,
  "model": "gpt-4o-mini",
  "knowledgeSource": "drive",
  "driveKnowledgeLoaded": true,
  "driveFileCount": 3,
  "lastDriveSync": "2026-07-11T…",
  "knowledgeChars": 12345
}
```

If Drive is not configured yet:

```json
{
  "knowledgeSource": "file",
  "driveKnowledgeLoaded": false,
  "driveConfigured": false
}
```

### 4. Test chat

1. https://ucsdxcrs.web.app/recruitment/
2. Send a message (first request after idle may take 30–60s on Render free tier)

## Local test

```bash
cd chat-server
npm install
set OPENAI_API_KEY=sk-your_key_here
set GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
npm start
```

Then set `NEXT_PUBLIC_CHAT_API_URL=http://localhost:10000/api/recruitment-chat` for local Next.

Check sync status: `http://localhost:10000/health`

## Update FAQ answers

**With Drive sync (preferred):** edit or add files in the [Google Drive folder](https://drive.google.com/drive/folders/1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF?usp=sharing). Changes appear within the cache TTL (~10 minutes) without redeploying.

**Fallback (no Drive credentials):**

1. Edit `content/recruitment-faq.md`
2. Copy to `chat-server/knowledge.md`
3. Push to GitHub — Render auto-redeploys

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/health` → `hasKey: false` | Set `OPENAI_API_KEY` on Render |
| `knowledgeSource: "file"` with `driveConfigured: true` | Check `driveSyncError` in `/health`; verify folder is shared with service account |
| `driveSyncError` mentions 403 / access | Share folder with service account email (Viewer) |
| `invalid_key` | Wrong/revoked key — create a new one at platform.openai.com/api-keys |
| `billing` / `insufficient_quota` | Add payment method + credits in OpenAI billing settings |
| `knowledgeTruncated: true` | Large PDF — trim source doc or raise `DRIVE_KNOWLEDGE_MAX_CHARS` |
| Slow first reply | Render free tier cold start — retry once |

## Sponsorship checkout (Stripe)

The Sponsors page sends people to Stripe-hosted Checkout. The secret key stays on this server. The static website never sees it.

Sandbox keys cannot pay out to a real Chase account. Test mode uses simulated payments. Add the nonprofit EIN and the Chase account in the Stripe Dashboard when you activate live mode:

1. [Stripe Dashboard](https://dashboard.stripe.com) → switch to **Test mode** while using `sk_test_` / `rk_test_` keys.
2. **Settings → Business** → legal name and EIN of the nonprofit organization.
3. **Settings → Bank accounts and scheduling** → add the Chase account. Use a test bank account in test mode. Add the real Chase account only after the account is activated for live payments.
4. Sponsorship charges land in the Stripe balance, then Stripe pays that balance out to the Chase account on your payout schedule.

### Where to paste keys

| Key | Paste it here | Do not paste it here |
| --- | --- | --- |
| Secret or restricted key (`sk_test_…` or `rk_test_…`) | `chat-server/.env` on `STRIPE_SECRET_KEY=` for local runs, and Render → **ucsd-x-crs-website** → **Environment** → `STRIPE_SECRET_KEY` for the live site | Next.js `.env.local`, GitHub, the Sponsors page |
| Publishable key (`pk_test_…`) | Project-root `.env.local` on `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=` | The chat server. This hosted Checkout flow does not read it. |
| Webhook signing secret (`whsec_…`) | `chat-server/.env` and Render as `STRIPE_WEBHOOK_SECRET` | The website |

Prefer a restricted key (`rk_test_`) with **Checkout Sessions: Write** and **Checkout Sessions: Read**. Add **Invoices: Write** if receipt creation returns a permissions error.

```bash
cd chat-server
cp .env.example .env
# Paste the secret key on the STRIPE_SECRET_KEY line, then:
npm install
npm test
npm start
```

For local website testing, set `NEXT_PUBLIC_SPONSORSHIP_API_URL=http://localhost:10000` in the project-root `.env.local`, then run `npm run dev` from the repo root.

Webhook endpoint (after the server is deployed): `https://ucsd-x-crs-website.onrender.com/api/sponsorship/webhook`

Listen for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`.

Leave `STRIPE_ALLOW_LIVE=false` until you are ready to accept real sponsorships with a live key.

## Security

| Store here | OpenAI key? | Google credentials? | Stripe secret? |
| --- | --- | --- | --- |
| GitHub | No | No | No |
| `NEXT_PUBLIC_*` | No | No | No (publishable key only, and this flow does not use it) |
| Render Environment | **Yes** | **Yes** | **Yes** |
| Public chat API URL | OK (endpoint only) | No | No |
