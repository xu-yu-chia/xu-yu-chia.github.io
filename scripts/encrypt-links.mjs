import { randomBytes, webcrypto } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const outputPath = process.argv[2] || "links/vault.json";
const bundledSecret = process.env.HIDE_LINK;
let password = process.env.QUICK_LINKS_PASSWORD;
let plainJson = process.env.QUICK_LINKS_JSON;
const iterations = Number(process.env.QUICK_LINKS_ITERATIONS || 250000);

if (bundledSecret) {
  const bundledPayload = JSON.parse(bundledSecret);
  password = bundledPayload.password || bundledPayload.passphrase || password;

  if (!Array.isArray(bundledPayload)) {
    const { password: _password, passphrase: _passphrase, ...payloadWithoutPassword } = bundledPayload;
    plainJson = JSON.stringify(payloadWithoutPassword);
  }
}

if (!password) throw new Error("Missing password in HIDE_LINK.");
if (!plainJson) throw new Error("Missing links payload in HIDE_LINK.");
if (!Number.isInteger(iterations) || iterations < 100000) {
  throw new Error("QUICK_LINKS_ITERATIONS must be an integer >= 100000.");
}

const payload = JSON.parse(plainJson);
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
