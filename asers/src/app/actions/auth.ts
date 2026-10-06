"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { first, run } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { resetEmail, sendEmail } from "@/lib/email";
import {
  checkVerificationCode,
  clientIp,
  createSession,
  destroyAllSessions,
  destroySession,
  findResetToken,
  findUserByEmail,
  getCurrentUser,
  issueResetLink,
  issueVerificationCode,
  normalizeEmail,
  rateLimit,
  safeNext,
} from "@/lib/auth";
import { type ActionState, isEmail, isPhone, str } from "@/lib/form";
import { PASSWORD_MIN } from "@/lib/options";

const FIFTEEN_MIN = 15 * 60 * 1000;
// A valid hash of a random password, used to equalize timing for unknown emails.
const DUMMY_HASH = "pbkdf2$100000$c2FsdHNhbHRzYWx0c2FsdA==$X9pCnhYv8gq0ZbM5r9cPq3n1g0bV9t7mJ1vQ0kF2a5E=";
const HOUR = 60 * 60 * 1000;

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = normalizeEmail(str(fd, "email", 254));
  const password = str(fd, "password", 200);
  const next = safeNext(str(fd, "next"));
  if (!email || !password) return { error: "Enter your email and password." };

  // Per-IP limits stop guessing from one place; the per-email limit is keyed by
  // IP too so nobody can lock a known user (e.g. an admin) out from elsewhere,
  // with a loose global cap against distributed guessing.
  const ip = await clientIp();
  const allowed =
    (await rateLimit(`login:ip:${ip}`, 30, FIFTEEN_MIN)) &&
    (await rateLimit(`login:email-ip:${email}:${ip}`, 10, FIFTEEN_MIN)) &&
    (await rateLimit(`login:email:${email}`, 100, FIFTEEN_MIN));
  if (!allowed) return { error: "Too many login attempts. Please wait 15 minutes and try again." };

  const user = await findUserByEmail(email);
  // Hash even for unknown emails so response time doesn't reveal which accounts exist.
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !user.password_hash || !ok) {
    return { error: "Incorrect email or password." };
  }
  if (user.disabled) return { error: "This account has been disabled. Contact contact@asers.org." };

  await createSession(user.id);
  await run("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", user.id);
  if (!user.email_verified_at) redirect(`/verify?next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function verifyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const code = str(fd, "code", 10).replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your email." };
  if (!(await rateLimit(`verify:${user.id}`, 20, 60 * 60 * 1000))) {
    return { error: "Too many attempts. Please wait an hour and request a new code." };
  }
  const result = await checkVerificationCode(user.id, code);
  if (result === "ok") redirect(safeNext(str(fd, "next")));
  return {
    error: {
      invalid: "That code isn't right. Check the latest email from us and try again.",
      expired: "That code has expired. Send a new one below.",
      locked: "Too many incorrect attempts. Send a new code below.",
    }[result],
  };
}

export async function resendCodeAction(_prev: ActionState, _fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) redirect("/dashboard");
  if (!(await rateLimit(`resend:${user.id}`, 5, HOUR))) {
    return { error: "You've requested several codes already. Please wait a bit and check your spam folder." };
  }
  await issueVerificationCode(user);
  return { message: `We sent a new code to ${user.email}.` };
}

/** Lets an unverified user fix a typo in their email. */
export async function changeUnverifiedEmailAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.emailVerified) return { error: "Your email is already verified. Change it from your account page." };
  const email = normalizeEmail(str(fd, "email", 254));
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  if (email === user.email) return { error: "That's the email you already have." };
  if (await findUserByEmail(email)) return { error: "Another account already uses that email." };
  if (!(await rateLimit(`resend:${user.id}`, 5, HOUR))) {
    return { error: "Too many emails sent. Please wait a bit before trying again." };
  }
  try {
    await run("UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", email, user.id);
  } catch {
    return { error: "Another account already uses that email." };
  }
  // Codes and reset links were issued for the old address; never let them verify the new one.
  await run("DELETE FROM auth_codes WHERE user_id = ?", user.id);
  await issueVerificationCode({ id: user.id, email });
  revalidatePath("/verify");
  return { message: `Email updated. We sent a new code to ${email}.`, ok: Date.now() };
}

export async function forgotPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = normalizeEmail(str(fd, "email", 254));
  if (!isEmail(email)) return { error: "Enter a valid email address." };
  const ip = await clientIp();
  if (!(await rateLimit(`forgot:ip:${ip}`, 10, HOUR)) || !(await rateLimit(`forgot:${email}`, 3, HOUR))) {
    return { error: "Too many reset requests. Please wait an hour and try again." };
  }
  const user = await findUserByEmail(email);
  if (user && !user.disabled) {
    await sendEmail(resetEmail(email, await issueResetLink(user.id, HOUR)));
  }
  return {
    message: `If an account exists for ${email}, we've sent a link to reset the password. Check your spam folder if it doesn't arrive in a few minutes.`,
  };
}

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const token = str(fd, "token", 200);
  const password = str(fd, "password", 200);
  const confirm = str(fd, "confirm", 200);
  if (password.length < PASSWORD_MIN) return { error: `Password must be at least ${PASSWORD_MIN} characters.` };
  if (password !== confirm) return { error: "Passwords don't match." };
  const found = await findResetToken(token);
  if (!found) return { error: "This link is invalid or has expired. Request a new one." };

  await run(
    `UPDATE users SET password_hash = ?, email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP),
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    await hashPassword(password),
    found.user_id
  );
  await run("DELETE FROM auth_codes WHERE user_id = ?", found.user_id);
  await destroyAllSessions(found.user_id);
  await createSession(found.user_id);
  redirect("/dashboard");
}

export async function updateProfileAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const firstName = str(fd, "firstName", 80);
  const lastName = str(fd, "lastName", 80);
  const phone = str(fd, "phone", 40);
  if (!firstName || !lastName) return { error: "First and last name are required." };
  if (phone && !isPhone(phone)) return { error: "Enter a valid phone number (at least 10 digits)." };
  await run(
    "UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    firstName,
    lastName,
    phone || null,
    user.id
  );
  revalidatePath("/", "layout");
  return { message: "Profile saved." };
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const current = str(fd, "current", 200);
  const password = str(fd, "password", 200);
  const confirm = str(fd, "confirm", 200);
  const row = await first<{ password_hash: string | null }>("SELECT password_hash FROM users WHERE id = ?", user.id);
  if (row?.password_hash && !(await verifyPassword(current, row.password_hash))) {
    return { error: "Your current password is incorrect." };
  }
  if (password.length < PASSWORD_MIN) return { error: `New password must be at least ${PASSWORD_MIN} characters.` };
  if (password !== confirm) return { error: "New passwords don't match." };
  await run(
    "UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    await hashPassword(password),
    user.id
  );
  // Sign out other devices.
  await destroyAllSessions(user.id);
  await createSession(user.id);
  return { message: "Password changed. Other devices have been signed out.", ok: Date.now() };
}
