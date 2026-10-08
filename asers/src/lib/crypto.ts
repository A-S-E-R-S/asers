// Password hashing and token helpers built on WebCrypto (works in Workers and Node).
// Hash format: pbkdf2$<iterations>$<salt b64>$<hash b64>. scripts/create-admin.mjs
// produces the same format with node:crypto, so keep them in sync.

const ITERATIONS = 100_000; // Workers caps PBKDF2 at 100k iterations
const encoder = new TextEncoder();

function toB64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, iter, saltB64, hashB64] = stored.split("$");
  if (scheme !== "pbkdf2" || !iter || !saltB64 || !hashB64) return false;
  const expected = fromB64(hashB64);
  const actual = await pbkdf2(password, fromB64(saltB64), Number(iter));
  return timingSafeEqual(actual, expected);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** URL-safe random token (256 bits). */
export function randomToken(): string {
  return toB64(crypto.getRandomValues(new Uint8Array(32)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Uniform 6-digit numeric code. */
export function randomCode(): string {
  const buf = new Uint32Array(1);
  // Rejection sampling avoids modulo bias.
  const limit = Math.floor(0xffffffff / 1_000_000) * 1_000_000;
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return String(buf[0] % 1_000_000).padStart(6, "0");
}
