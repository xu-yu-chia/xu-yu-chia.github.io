import { randomBytes, webcrypto } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const outputPath = process.argv[2] || "links/vault.json";
const bundledSecret = process.env.HIDE_LINK;
let password = process.env.QUICK_LINKS_PASSWORD;
let plainJson = process.env.QUICK_LINKS_JSON;
const iterations = Number(process.env.QUICK_LINKS_ITERATIONS || 250000);

if (bundledSecret) {
  const parsedSecret = parseBundledSecret(bundledSecret);
  password = parsedSecret.password ? String(parsedSecret.password).trim() : password;
  plainJson = JSON.stringify(normalizePayload(parsedSecret.payload));
}

function parseBundledSecret(value) {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("HIDE_LINK is empty.");

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const payload = parseJsonSecret(trimmed);
    if (Array.isArray(payload)) return { password, payload: { links: payload } };

    const { password: secretPassword, passphrase, unlockPassword, ...payloadWithoutPassword } = payload;
    return {
      password: secretPassword || passphrase || unlockPassword,
      payload: payloadWithoutPassword
    };
  }

  return parseTextSecret(trimmed);
}

function parseJsonSecret(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    const repaired = value
      .replace(/;\s*(?="[^"]+"\s*:)/g, ",")
      .replace(/;\s*(?=[}\]])/g, "");

    if (repaired !== value) {
      try {
        return JSON.parse(repaired);
      } catch (_repairError) {
        // Fall through to the sanitized error below.
      }
    }

    throw new Error(
      "HIDE_LINK is not valid JSON. Use commas between JSON fields, or use text format: password=...; Title=https://..."
    );
  }
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
      secretPassword = passwordMatch[2].trim();
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
      secretPassword = line;
      continue;
    }

    throw new Error("HIDE_LINK text format has an invalid line. Use: password=...; Title=https://...");
  }

  return { password: secretPassword, payload: { links } };
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return { links: payload };
  if (!payload || typeof payload !== "object") return { links: [] };
  if (Array.isArray(payload.links)) return payload;
  if (payload.links && typeof payload.links === "object") {
    return { ...payload, links: linksFromMap(payload.links) };
  }

  const links = linksFromMap(payload);
  if (links.length) return { links };
  return payload;
}

function linksFromMap(map) {
  return Object.entries(map)
    .filter(([key]) => !["password", "passphrase", "unlockPassword"].includes(key))
    .map(([title, value]) => {
      if (typeof value === "string") return { title, url: value };
      if (value && typeof value === "object") return { title, ...value };
      return null;
    })
    .filter((item) => item && item.title && item.url);
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
