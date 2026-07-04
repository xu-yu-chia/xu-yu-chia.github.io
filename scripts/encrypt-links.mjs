import { randomBytes, webcrypto } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const outputPath = process.argv[2] || "links/vault.json";
const inputPath = process.argv[3] || process.env.QUICK_LINKS_JSON_PATH || "links/links.json";
const password = cleanSecret(process.env.HIDE_LINK || process.env.QUICK_LINKS_PASSWORD || "");
let plainJson = process.env.QUICK_LINKS_JSON;
const iterations = Number(process.env.QUICK_LINKS_ITERATIONS || 250000);

try {
  if (!password) {
    throw new Error("Missing HIDE_LINK. HIDE_LINK must be the unlock password/key.");
  }

  if (!plainJson) {
    if (!existsSync(inputPath)) {
      throw new Error(
        `Missing quick links JSON. Set QUICK_LINKS_JSON, or create ${inputPath} for local encryption.`
      );
    }
    plainJson = await readFile(inputPath, "utf8");
  }

  if (!Number.isInteger(iterations) || iterations < 100000) {
    throw new Error("QUICK_LINKS_ITERATIONS must be an integer >= 100000.");
  }

  const payload = normalizePayload(parseJson(plainJson));
  if (!Array.isArray(payload.links) || payload.links.length === 0) {
    throw new Error("Quick links JSON must contain at least one link.");
  }

  const normalized = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const subtle = webcrypto.subtle;

  const keyMaterial = await subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const key = await subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const encrypted = await subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(normalized));

  const vault = {
    version: 1,
    algorithm: "AES-256-GCM",
    kdf: "PBKDF2-SHA256",
    iterations,
    salt: Buffer.from(salt).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    tag_length: 128,
    ciphertext: Buffer.from(encrypted).toString("base64"),
    updatedAt: new Date().toISOString()
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(vault, null, 2) + "\n", "utf8");
  console.log(`Encrypted quick links written to ${outputPath}`);
} catch (error) {
  const message = sanitizeAnnotation(error);
  console.error(message);
  console.error(`::error file=scripts/encrypt-links.mjs,line=1::${message}`);
  process.exit(1);
}

function cleanSecret(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:text)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function sanitizeAnnotation(error) {
  return String(error?.message || error || "Unknown error")
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

function parseJson(value) {
  const text = String(value || "").trim();
  const candidates = [
    text,
    text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/[\u201c\u201d]/g, "\"")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/;\s*(?="[^"]+"\s*:)/g, ",")
      .replace(/;\s*(?=[}\]])/g, "")
      .replace(/;\s*$/g, "")
      .trim()
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      // Try the repaired candidate before reporting a generic format error.
    }
  }

  throw new Error("Quick links JSON is not valid JSON.");
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return { links: normalizeLinks(payload) };
  if (!payload || typeof payload !== "object") return { links: [] };

  const directLinks = linksFromKnownKeys(payload);
  if (directLinks.length) return { ...payload, links: directLinks };

  const groupedLinks = linksFromGroups(payload.groups || payload.group || payload.categories);
  if (groupedLinks.length) return { ...payload, links: groupedLinks };

  const mapLinks = linksFromMap(payload);
  if (mapLinks.length) return { links: mapLinks };

  return { ...payload, links: [] };
}

function linksFromKnownKeys(payload) {
  const keys = ["links", "link", "items", "bookmarks", "quickLinks", "quick_links", "urls"];
  for (const key of keys) {
    if (!payload[key]) continue;
    if (Array.isArray(payload[key])) return normalizeLinks(payload[key]);
    if (typeof payload[key] === "object") return linksFromMap(payload[key]);
  }
  return [];
}

function linksFromGroups(groups) {
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((group) => {
    if (!group || typeof group !== "object") return [];
    const groupName = group.group || group.category || group.title || group.name || "Links";
    return linksFromKnownKeys(group).map((link) => ({ ...link, group: link.group || groupName }));
  });
}

function normalizeLinks(items, group) {
  return items
    .map((item) => normalizeLink(item, group))
    .filter((item) => item && item.title && item.url && isUrl(item.url));
}

function normalizeLink(item, group) {
  if (typeof item === "string") {
    return {
      title: safeHostname(item),
      url: item,
      group: group || "Links"
    };
  }
  if (!item || typeof item !== "object") return null;
  const url = item.url || item.href || item.link;
  const title = item.title || item.name || item.label || safeHostname(url);
  return { ...item, title, url, group: item.group || item.category || group || "Links" };
}

function linksFromMap(map) {
  return Object.entries(map)
    .filter(([key]) => !["password", "passphrase", "unlockPassword"].includes(key))
    .flatMap(([title, value]) => {
      if (Array.isArray(value)) return normalizeLinks(value, title);
      if (typeof value === "string") return [{ title, url: value, group: "Links" }];
      if (value && typeof value === "object") {
        const normalized = normalizeLink({ title, ...value }, value.group || value.category || "Links");
        return normalized ? [normalized] : [];
      }
      return [];
    })
    .filter((item) => item && item.title && item.url && isUrl(item.url));
}

function safeHostname(value) {
  try {
    return new URL(value).hostname;
  } catch (_error) {
    return "Link";
  }
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}
