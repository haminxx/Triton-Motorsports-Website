const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const pdfParse = require("pdf-parse");

const KNOWLEDGE_PATH = path.join(__dirname, "knowledge.md");
const KNOWLEDGE_FALLBACK =
  "Triton Motorsports is a student-led Collegiate Racing Series team.";

const MAX_KNOWLEDGE_CHARS = Number(process.env.DRIVE_KNOWLEDGE_MAX_CHARS) || 80_000;
const CACHE_TTL_MS =
  Number(process.env.DRIVE_KNOWLEDGE_TTL_MS) || 10 * 60 * 1000;

const FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() ||
  "1x1aL_4j-xgzGf7idPT1DWSgjzr1GN8CF";

const GOOGLE_DOC_MIME = "application/vnd.google-apps.document";
const PDF_MIME = "application/pdf";
const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

/** @type {{ text: string, source: string, loaded: boolean, chars: number, fileCount: number, lastSync: string | null, truncated: boolean, driveError: string | null, syncing: boolean }} */
let cache = {
  text: "",
  source: "fallback",
  loaded: false,
  chars: 0,
  fileCount: 0,
  lastSync: null,
  truncated: false,
  driveError: null,
  syncing: false,
};

function loadFileKnowledge() {
  try {
    const text = fs.readFileSync(KNOWLEDGE_PATH, "utf8").trim();
    if (!text) throw new Error("knowledge.md is empty");
    return { text, loaded: true };
  } catch {
    return { text: KNOWLEDGE_FALLBACK, loaded: false };
  }
}

function parseServiceAccountJson(raw) {
  if (!raw?.trim()) return null;

  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) {
    try {
      jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hasDriveCredentials() {
  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  const serviceAccount = parseServiceAccountJson(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  );
  return Boolean(apiKey || serviceAccount);
}

async function createDriveClient() {
  const serviceAccount = parseServiceAccountJson(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  );

  if (serviceAccount) {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [DRIVE_READONLY_SCOPE],
    });
    return google.drive({ version: "v3", auth });
  }

  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (apiKey) {
    return google.drive({ version: "v3", auth: apiKey });
  }

  return null;
}

async function listFolderFiles(drive, folderId) {
  const files = [];
  let pageToken;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: "name",
      pageToken,
    });

    if (res.data.files?.length) {
      files.push(...res.data.files);
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return files;
}

async function exportGoogleDoc(drive, fileId) {
  const res = await drive.files.export(
    { fileId, mimeType: "text/plain" },
    { responseType: "text" },
  );
  return String(res.data || "").trim();
}

async function downloadPdfBuffer(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" },
  );
  return Buffer.from(res.data);
}

async function extractPdfText(buffer) {
  const parsed = await pdfParse(buffer);
  return String(parsed.text || "").trim();
}

function buildKnowledgeDocument(sections) {
  const parts = sections
    .filter((s) => s.text)
    .map((s) => `## ${s.name}\n\n${s.text}`);

  let text = parts.join("\n\n---\n\n").trim();
  let truncated = false;

  if (text.length > MAX_KNOWLEDGE_CHARS) {
    text = `${text.slice(0, MAX_KNOWLEDGE_CHARS)}\n\n[Knowledge truncated at ${MAX_KNOWLEDGE_CHARS} characters]`;
    truncated = true;
  }

  return { text, truncated, fileCount: sections.length };
}

async function fetchDriveKnowledge() {
  const drive = await createDriveClient();
  if (!drive) {
    throw new Error(
      "Drive sync not configured (set GOOGLE_API_KEY or GOOGLE_SERVICE_ACCOUNT_JSON)",
    );
  }

  const files = await listFolderFiles(drive, FOLDER_ID);
  const sections = [];

  for (const file of files) {
    const { id, name, mimeType } = file;
    if (!id || !name) continue;

    try {
      if (mimeType === GOOGLE_DOC_MIME) {
        const text = await exportGoogleDoc(drive, id);
        if (text) sections.push({ name, text });
        continue;
      }

      if (mimeType === PDF_MIME) {
        const buffer = await downloadPdfBuffer(drive, id);
        const text = await extractPdfText(buffer);
        if (text) sections.push({ name, text });
        continue;
      }

      console.warn(
        `drive-knowledge: skipping unsupported file "${name}" (${mimeType || "unknown"})`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.warn(`drive-knowledge: failed to process "${name}": ${detail}`);
    }
  }

  if (!sections.length) {
    throw new Error("No supported files found in Drive folder");
  }

  return buildKnowledgeDocument(sections);
}

function applyCacheUpdate({
  text,
  source,
  loaded,
  fileCount,
  truncated,
  driveError,
}) {
  cache = {
    text,
    source,
    loaded,
    chars: text.length,
    fileCount,
    lastSync: new Date().toISOString(),
    truncated: Boolean(truncated),
    driveError: driveError || null,
    syncing: false,
  };
}

async function refreshKnowledge({ force = false } = {}) {
  if (cache.syncing && !force) return cache;

  const stale =
    !cache.lastSync ||
    Date.now() - new Date(cache.lastSync).getTime() >= CACHE_TTL_MS;

  if (!force && !stale && cache.loaded) return cache;

  cache.syncing = true;

  if (!hasDriveCredentials()) {
    const fileKnowledge = loadFileKnowledge();
    applyCacheUpdate({
      text: fileKnowledge.text,
      source: fileKnowledge.loaded ? "file" : "fallback",
      loaded: fileKnowledge.loaded,
      fileCount: 0,
      truncated: false,
      driveError: "Drive credentials not configured",
    });
    return cache;
  }

  try {
    const driveKnowledge = await fetchDriveKnowledge();
    applyCacheUpdate({
      text: driveKnowledge.text,
      source: "drive",
      loaded: true,
      fileCount: driveKnowledge.fileCount,
      truncated: driveKnowledge.truncated,
      driveError: null,
    });
    console.log(
      `drive-knowledge: synced ${driveKnowledge.fileCount} file(s), ${cache.chars} chars${driveKnowledge.truncated ? " (truncated)" : ""}`,
    );
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn(`drive-knowledge: sync failed, using knowledge.md — ${detail}`);

    const fileKnowledge = loadFileKnowledge();
    applyCacheUpdate({
      text: fileKnowledge.text,
      source: fileKnowledge.loaded ? "file" : "fallback",
      loaded: fileKnowledge.loaded,
      fileCount: 0,
      truncated: false,
      driveError: detail,
    });
  }

  return cache;
}

function getKnowledgeSnapshot() {
  if (!cache.text) {
    const fileKnowledge = loadFileKnowledge();
    return {
      text: fileKnowledge.text,
      source: fileKnowledge.loaded ? "file" : "fallback",
      loaded: fileKnowledge.loaded,
      chars: fileKnowledge.text.length,
      fileCount: 0,
      lastSync: null,
      truncated: false,
      driveError: hasDriveCredentials()
        ? "Not synced yet"
        : "Drive credentials not configured",
      driveKnowledgeLoaded: false,
      knowledgeSource: fileKnowledge.loaded ? "file" : "fallback",
    };
  }

  return {
    text: cache.text,
    source: cache.source,
    loaded: cache.loaded,
    chars: cache.chars,
    fileCount: cache.fileCount,
    lastSync: cache.lastSync,
    truncated: cache.truncated,
    driveError: cache.driveError,
    driveKnowledgeLoaded: cache.source === "drive" && cache.loaded,
    knowledgeSource: cache.source,
  };
}

async function getKnowledge() {
  const snapshot = getKnowledgeSnapshot();
  const stale =
    !snapshot.lastSync ||
    Date.now() - new Date(snapshot.lastSync).getTime() >= CACHE_TTL_MS;

  if (stale || !snapshot.loaded) {
    await refreshKnowledge();
  }

  return getKnowledgeSnapshot();
}

function getHealthFields() {
  const snapshot = getKnowledgeSnapshot();
  return {
    knowledgeLoaded: snapshot.loaded,
    knowledgeChars: snapshot.chars,
    knowledgeTruncated: snapshot.truncated,
    driveKnowledgeLoaded: snapshot.driveKnowledgeLoaded,
    driveFileCount: snapshot.fileCount,
    lastDriveSync: snapshot.lastSync,
    knowledgeSource: snapshot.knowledgeSource,
    driveSyncError: snapshot.driveError,
    driveFolderId: FOLDER_ID,
    driveConfigured: hasDriveCredentials(),
  };
}

module.exports = {
  refreshKnowledge,
  getKnowledge,
  getHealthFields,
  FOLDER_ID,
  MAX_KNOWLEDGE_CHARS,
  CACHE_TTL_MS,
};
