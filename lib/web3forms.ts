/**
 * Web3Forms client submit — access key is public by design (client-side API).
 * Set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in `.env.local` (and at build time for Firebase).
 * Create a key at https://web3forms.com/ — use your Porkbun org address (forwards to Gmail).
 */

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function getWeb3FormsAccessKey() {
  return process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() ?? "";
}

export type ContactFormFields = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  organizationType: string | null;
  inquiryFocus: string | null;
  budgetAllocated: boolean | null;
  timeframe: string | null;
  message: string;
  attachmentNames: string[];
  privacyAgreed: boolean;
};

export type Web3FormsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitContactViaWeb3Forms(
  fields: ContactFormFields,
): Promise<Web3FormsResult> {
  const accessKey = getWeb3FormsAccessKey();
  if (!accessKey) {
    return {
      ok: false,
      error:
        "Contact form is not configured yet. Add NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY and rebuild.",
    };
  }

  const fullName = `${fields.firstName} ${fields.lastName}`.trim();
  const attachmentLine =
    fields.attachmentNames.length > 0
      ? fields.attachmentNames.join(", ")
      : "None (file uploads require Web3Forms Pro — names listed for reference only)";

  const body = {
    access_key: accessKey,
    subject: `UCSD x CRS contact — ${fullName || "New inquiry"}`,
    from_name: "UCSD x CRS Website",
    name: fullName,
    email: fields.email,
    replyto: fields.email,
    Organization: fields.organization || "—",
    "Organization type": fields.organizationType ?? "—",
    "Inquiry focus": fields.inquiryFocus ?? "—",
    "Budget allocated":
      fields.budgetAllocated === null
        ? "—"
        : fields.budgetAllocated
          ? "Yes"
          : "No",
    Timeframe: fields.timeframe ?? "—",
    message: fields.message.trim() || "(No additional message)",
    Attachments: attachmentLine,
    "Privacy agreed": fields.privacyAgreed ? "Yes" : "No",
    botcheck: false,
  };

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as {
      success?: boolean;
      message?: string;
    } | null;

    if (!response.ok || data?.success === false) {
      return {
        ok: false,
        error:
          data?.message?.trim() ||
          "Could not send your message. Please try again in a moment.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Network error. Check your connection and try again.",
    };
  }
}
