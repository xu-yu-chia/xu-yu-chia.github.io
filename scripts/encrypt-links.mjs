import { randomBytes, webcrypto } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const outputPath = process.argv[2] || "links/vault.json";
const bundledSecret = process.env.HIDE_LINK;
let password = process.env.QUICK_LINKS_PASSWORD;
let plainJson = process.env.QUICK_LINKS_JSON;
const iterations = Number(process.env.QUICK_LINKS_ITERATIONS || 250000);

function sanitizeAnnotation(error) {
  return String(error?.message || error || "Unknown error")
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

try {
if (bundledSecret) {
  const parsedSecret = parseBundledSecret(bundledSecret);
  password = parsedSecret.password ? String(parsedSecret.password).trim() : password;
  const bundledPayload = normalizePayload(parsedSecret.payload);
  const hasBundledLinks = Array.isArray(bundledPayload.links) && bundledPayload.links.length > 0;
  if (hasBundledLinks || !plainJson) {
    plainJson = JSON.stringify(bundledPayload);
  }
}

function parseBundledSecret(value) {
  const trimmed = stripCodeFence(value).trim();
  if (!trimmed) throw new Error("HIDE_LINK is empty.");

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return secretConfigFromPayload(parseJsonSecret(trimmed));
  }

  try {
    return parseTextSecret(trimmed);
  } catch (error) {
    const loosePayload = parseLooseSecret(trimmed);
    if (loosePayload) return secretConfigFromPayload(loosePayload);
    throw error;
  }
}

function secretConfigFromPayload(payload) {
  if (Array.isArray(payload)) return { password, payload: { links: payload } };

  const { password: secretPassword, passphrase, unlockPassword, ...payloadWithoutPassword } = payload;
  return {
    password: stripOptionalQuotes(secretPassword || passphrase || unlockPassword || ""),
    payload: payloadWithoutPassword
  };
}

function parseJsonSecret(value) {
  const candidates = [value, repairLooseJson(value)];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (_error) {
      // Try the next representation and report a sanitized message at the end.
    }
  }

  const loosePayload = parseLooseSecret(value);
  if (loosePayload) return loosePayload;

  throw new Error(
    "HIDE_LINK is not valid JSON. Use commas between JSON fields, or use text format: password=...; Title=https://..."
  );
}

function stripCodeFence(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:json|text)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

function repairLooseJson(value) {
  return stripCodeFence(value)
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/;\s*(?="[^"]+"\s*:)/g, ",")
    .replace(/;\s*(?=\{)/g, ",")
    .replace(/;\s*(?=[}\]])/g, "")
    .replace(/;\s*$/g, "")
    .trim();
}

function stripOptionalQuotes(value) {
  return String(value || "").replace(/^["']|["']$/g, "").trim();
}

function parseLooseSecret(value) {
  const text = stripCodeFence(value).replace(/[{}[\]]/g, "\n");
  const passwordMatch = text.match(/["']?(password|passphrase|unlockPassword)["']?\s*[:=]\s*["']?([^"';,\n}]+)/i);
  const secretPassword = passwordMatch ? stripOptionalQuotes(passwordMatch[2].trim()) : undefined;
  const links = [];
  const seenUrls = new Set();

  const pushLink = (title, url) => {
    const normalizedUrl = String(url || "").trim();
    if (!isUrl(normalizedUrl) || seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);
    links.push({
      title: String(title || new URL(normalizedUrl).hostname).trim(),
      url: normalizedUrl,
      group: "Links",
      note: "",
      icon: "fa-link"
    });
  };

  const objectLinkPattern = /["']?(?:title|name)["']?\s*[:=]\s*["']?([^"';,\n}]+)["']?[\s\S]{0,300}?["']?(?:url|href)["']?\s*[:=]\s*["']?(https?:\/\/[^"'\s;,}\]]+)/gi;
  for (const match of text.matchAll(objectLinkPattern)) {
    pushLink(match[1], match[2]);
  }

  const pairPattern = /([^:=;\n,[\]"']+?)\s*[:=]\s*(https?:\/\/[^"'\s;,}\]]+)/gi;
  for (const match of text.matchAll(pairPattern)) {
    const title = match[1].trim();
    if (/^(url|href)$/i.test(title)) continue;
    pushLink(title, match[2]);
  }

  if (!links.length) return null;
  return secretPassword ? { password: secretPassword, links } : { links };
}

function parseTextSecret(value) {
  const links = [];
  let secretPassword = password;
  const lines = value
    .split(/[\r\n;]+/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  for (const line of lines) {
    const passwordMatch = line.match(/^(password|passphrase|unlockPassword)\s*[:=]\s*(.+)$/i);
    if (passwordMatch) {
      secretPassword = stripOptionalQuotes(passwordMatch[2].trim());
      continue;
    }

    const pipeParts = line.split("|").map((part) => part.trim());
    if (pipeParts.length >= 2 && isUrl(pipeParts[1])) {
      links.push({
        title: pipeParts[0],
        url: pipeParts[1],
        group: pipeParts[2] || "Links",
        note: pipeParts[3] || "",
        icon: pipeParts[4] || "fa-link"
      });
      continue;
    }

    const keyValueMatch = line.match(/^([^:=]+)\s*[:=]\s*(https?:\/\/.+)$/i);
    if (keyValueMatch) {
      links.push({
        title: keyValueMatch[1].trim(),
        url: keyValueMatch[2].trim(),
        group: "Links",
        note: "",
        icon: "fa-link"
      });
      continue;
    }

    if (isUrl(line)) {
      links.push({
        title: new URL(line).hostname,
        url: line,
        group: "Links",
        note: "",
        icon: "fa-link"
      });
      continue;
    }

    if (!secretPassword && links.length === 0) {
      secretPassword = stripOptionalQuotes(line);
      continue;
    }

    throw new Error("HIDE_LINK text format has an invalid line. Use: password=...; Title=https://...");
  }

  return { password: secretPassword, payload: { links } };
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return { links: normalizeLinks(payload) };
  if (!payload || typeof payload !== "object") return { links: [] };

  const directLinks = linksFromKnownKeys(payload);
  if (directLinks.length) {
    return { ...payload, links: directLinks };
  }

  const groupedLinks = linksFromGroups(payload.groups || payload.group || payload.categories);
  if (groupedLinks.length) {
    return { ...payload, links: groupedLinks };
  }

  const links = linksFromMap(payload);
  if (links.length) return { links };
  return payload;
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
    .filter((item) => item && item.title && item.url);
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
      return null;
    })
    .filter((item) => item && item.title && item.url);
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

if (!password) throw new Error("Missing password in HIDE_LINK.");
if (!plainJson) throw new Error("Missing links payload in HIDE_LINK.");
if (!Number.isInteger(iterations) || iterations < 100000) {
  throw new Error("QUICK_LINKS_ITERATIONS must be an integer >= 100000.");
}

const payload = normalizePayload(JSON.parse(plainJson));
if (!Array.isArray(payload.links) || payload.links.length === 0) {
  throw new Error("HIDE_LINK must contain at least one link.");
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
