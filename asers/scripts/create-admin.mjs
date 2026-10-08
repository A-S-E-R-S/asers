#!/usr/bin/env node
// Creates (or promotes) a national admin account. Use this once to bootstrap;
// after that, national admins can add other admins from /admin.
//
//   npm run admin:create -- --email you@asers.org --first Ada --last Lovelace           (local D1)
//   npm run admin:create -- --email you@asers.org --first Ada --last Lovelace --remote  (production D1)
//
// Pass --password to choose one; otherwise a random password is generated and printed.
// Hash format must match src/lib/crypto.ts.

import { execFileSync } from "node:child_process";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const email = opt("email")?.trim().toLowerCase();
const first = opt("first")?.trim();
const last = opt("last")?.trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run admin:create -- --email you@example.com --first First --last Last [--password pw] [--remote]");
  process.exit(1);
}

const password = opt("password") ?? randomBytes(12).toString("base64url");
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100_000, 32, "sha256");
const passwordHash = `pbkdf2$100000$${salt.toString("base64")}$${hash.toString("base64")}`;

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const sql = `INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified_at, is_national_admin)
VALUES (${q(randomUUID())}, ${q(email)}, ${q(passwordHash)}, ${q(first || "Admin")}, ${q(last || "User")}, CURRENT_TIMESTAMP, 1)
ON CONFLICT(email) DO UPDATE SET is_national_admin = 1, password_hash = excluded.password_hash,
  email_verified_at = COALESCE(users.email_verified_at, CURRENT_TIMESTAMP), disabled = 0, updated_at = CURRENT_TIMESTAMP;`;

execFileSync(
  "npx",
  ["wrangler", "d1", "execute", "DB", flag("remote") ? "--remote" : "--local", "--command", sql],
  { stdio: "inherit" }
);

console.log(`\nNational admin ready: ${email}`);
if (!opt("password")) console.log(`Temporary password: ${password}\nChange it from /account after logging in.`);
