import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { all, first, run } from "@/lib/db";
import { randomCode, randomToken, sha256Hex } from "@/lib/crypto";
import { appUrl, sendEmail, verificationEmail } from "@/lib/email";

const SESSION_COOKIE = "asers_session";
const SESSION_DAYS = 30;
const VERIFY_TTL_MS = 30 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  emailVerified: boolean;
  isNationalAdmin: boolean;
  hasPassword: boolean;
};

export type UserRow = {
  id: string;
  email: string;
  password_hash: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email_verified_at: string | null;
  is_national_admin: number;
  disabled: number;
};

export function toUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    emailVerified: !!r.email_verified_at,
    isNationalAdmin: !!r.is_national_admin,
    hasPassword: !!r.password_hash,
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  return first<UserRow>("SELECT * FROM users WHERE email = ?", normalizeEmail(email));
}

// ---------------------------------------------------------------- sessions

export async function createSession(userId: string): Promise<void> {
  const token = randomToken();
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  await run(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    await sha256Hex(token),
    userId,
    expires
  );
  // Opportunistic cleanup of this user's stale sessions.
  await run("DELETE FROM sessions WHERE user_id = ? AND expires_at < ?", userId, Date.now());
  const h = await headers();
  const secure = h.get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE id = ?", await sha256Hex(token));
  jar.delete(SESSION_COOKIE);
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await run("DELETE FROM sessions WHERE user_id = ?", userId);
}

/** The logged-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await first<UserRow>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > ? AND u.disabled = 0`,
    await sha256Hex(token),
    Date.now()
  );
  return row ? toUser(row) : null;
});

export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

export async function requireVerifiedUser(next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!user.emailVerified) redirect(next ? `/verify?next=${encodeURIComponent(next)}` : "/verify");
  return user;
}

/** Only allow same-site relative redirects. */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  // Parse the way a browser would (it strips tabs/newlines and treats "\\" as "/"),
  // and only accept results that stay on our own origin.
  try {
    const base = "https://same-origin.invalid";
    const u = new URL(next, base);
    if (u.origin !== base) return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------- admin scope

export type AdminScope = { national: boolean; chapters: string[] };

export const getAdminScope = cache(async (user: User | null): Promise<AdminScope> => {
  if (!user || !user.emailVerified) return { national: false, chapters: [] };
  if (user.isNationalAdmin) return { national: true, chapters: [] };
  const rows = await all<{ chapter_slug: string }>(
    "SELECT chapter_slug FROM chapter_admins WHERE user_id = ?",
    user.id
  );
  return { national: false, chapters: rows.map((r) => r.chapter_slug) };
});

export function canManageChapter(scope: AdminScope, slug: string): boolean {
  return scope.national || scope.chapters.includes(slug);
}

export function isAnyAdmin(scope: AdminScope): boolean {
  return scope.national || scope.chapters.length > 0;
}

// ---------------------------------------------------------------- rate limiting

/** Fixed-window counter. Returns false once `limit` hits in `windowMs` are exceeded. */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const cutoff = now - windowMs;
  const row = await first<{ count: number }>(
    `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN window_start < ? THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END
     RETURNING count`,
    key,
    now,
    cutoff,
    cutoff
  );
  return (row?.count ?? 0) <= limit;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}

// ---------------------------------------------------------------- email codes / tokens

export async function issueVerificationCode(user: { id: string; email: string }): Promise<void> {
  const code = randomCode();
  await run(
    `INSERT INTO auth_codes (user_id, purpose, code_hash, expires_at, attempts, created_at)
     VALUES (?, 'verify', ?, ?, 0, ?)
     ON CONFLICT(user_id, purpose) DO UPDATE SET
       code_hash = excluded.code_hash, expires_at = excluded.expires_at,
       attempts = 0, created_at = excluded.created_at`,
    user.id,
    await sha256Hex(`${user.id}:${code}`),
    Date.now() + VERIFY_TTL_MS,
    Date.now()
  );
  await sendEmail(verificationEmail(user.email, code));
}

export type CodeResult = "ok" | "invalid" | "expired" | "locked";

export async function checkVerificationCode(userId: string, code: string): Promise<CodeResult> {
  // Count the attempt before comparing so parallel guesses can't exceed the limit.
  const row = await first<{ code_hash: string; attempts: number }>(
    `UPDATE auth_codes SET attempts = attempts + 1
     WHERE user_id = ? AND purpose = 'verify' AND attempts < ? AND expires_at > ?
     RETURNING code_hash, attempts`,
    userId,
    MAX_CODE_ATTEMPTS,
    Date.now()
  );
  if (!row) {
    const existing = await first<{ attempts: number }>(
      "SELECT attempts FROM auth_codes WHERE user_id = ? AND purpose = 'verify' AND expires_at > ?",
      userId,
      Date.now()
    );
    return existing ? "locked" : "expired";
  }
  if ((await sha256Hex(`${userId}:${code.trim()}`)) !== row.code_hash) {
    return row.attempts >= MAX_CODE_ATTEMPTS ? "locked" : "invalid";
  }
  await run(
    "UPDATE users SET email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    userId
  );
  await run("DELETE FROM auth_codes WHERE user_id = ? AND purpose = 'verify'", userId);
  return "ok";
}

/** Creates a single-use password (re)set link. */
export async function issueResetLink(userId: string, ttlMs: number): Promise<string> {
  const token = randomToken();
  await run(
    `INSERT INTO auth_codes (user_id, purpose, code_hash, expires_at, attempts, created_at)
     VALUES (?, 'reset', ?, ?, 0, ?)
     ON CONFLICT(user_id, purpose) DO UPDATE SET
       code_hash = excluded.code_hash, expires_at = excluded.expires_at,
       attempts = 0, created_at = excluded.created_at`,
    userId,
    await sha256Hex(token),
    Date.now() + ttlMs,
    Date.now()
  );
  return `${await appUrl()}/reset-password?token=${token}`;
}

export async function findResetToken(
  token: string
): Promise<{ user_id: string; email: string; first_name: string } | null> {
  if (!token) return null;
  return first(
    `SELECT a.user_id, u.email, u.first_name FROM auth_codes a JOIN users u ON u.id = a.user_id
     WHERE a.code_hash = ? AND a.purpose = 'reset' AND a.expires_at > ? AND u.disabled = 0`,
    await sha256Hex(token),
    Date.now()
  );
}
