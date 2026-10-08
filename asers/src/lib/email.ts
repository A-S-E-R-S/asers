import "server-only";
import { headers } from "next/headers";
import { env } from "@/lib/db";

/**
 * Base URL for links in emails. Uses APP_URL so a spoofed Host header can't
 * redirect reset links elsewhere; local dev hosts are allowed through so links
 * work on localhost.
 */
export async function appUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  return (env().APP_URL || "https://asers.org").replace(/\/$/, "");
}

type Message = { to: string; subject: string; text: string; html?: string };

/** Sends via the Cloudflare Email binding; logs the message if that fails or isn't configured. */
export async function sendEmail(msg: Message): Promise<boolean> {
  const e = env();
  const html = msg.html ?? layout(msg.subject, textToHtml(msg.text));
  try {
    if (!e.EMAIL) throw new Error("EMAIL binding not configured");
    await e.EMAIL.send({
      from: { email: e.EMAIL_FROM || "no-reply@asers.org", name: e.EMAIL_FROM_NAME || "ASERS" },
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
      html,
    });
    return true;
  } catch (err) {
    console.warn(
      `[email] not sent (${err instanceof Error ? err.message : String(err)}). ` +
        `To: ${msg.to} | Subject: ${msg.subject}\n${msg.text}`
    );
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => {
      const escaped = escapeHtml(p).replace(/\n/g, "<br>");
      // Turn bare URLs into links.
      return `<p style="margin:0 0 16px">${escaped.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#21388b">$1</a>'
      )}</p>`;
    })
    .join("");
}

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f8;font-family:Arial,Helvetica,sans-serif;color:#12151c">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-top:6px solid #21388b">
<tr><td style="padding:28px 32px">
<p style="margin:0 0 4px;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#21388b">ASERS</p>
<h1 style="margin:0 0 20px;font-size:22px">${escapeHtml(title)}</h1>
<div style="font-size:15px;line-height:1.6">${body}</div>
</td></tr></table>
<p style="font-size:12px;color:#2b3038">American Science and Engineering Research Symposium · asers.org</p>
</td></tr></table></body></html>`;
}

export function verificationEmail(to: string, code: string): Message {
  return {
    to,
    subject: `Your ASERS verification code: ${code}`,
    text: `Your ASERS verification code is ${code}.\n\nEnter it on the verification page to finish setting up your account. The code expires in 30 minutes.\n\nIf you didn't create an ASERS account, you can ignore this email.`,
  };
}

export function resetEmail(to: string, link: string): Message {
  return {
    to,
    subject: "Reset your ASERS password",
    text: `Someone (hopefully you) asked to reset the password for your ASERS account.\n\nSet a new password here (the link expires in 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email; your password won't change.`,
  };
}

export function partnerInviteEmail(
  to: string,
  partnerName: string,
  chapterName: string,
  projectTitle: string,
  link: string
): Message {
  return {
    to,
    subject: `${partnerName} added you to a ${chapterName} team project`,
    text: `${partnerName} registered your team project "${projectTitle}" for ${chapterName} and listed you as their team partner.\n\nSet a password to access your ASERS dashboard (the link expires in 7 days):\n${link}\n\nIf this wasn't expected, contact your chapter or reply to ${partnerName}.`,
  };
}

export function accountInviteEmail(to: string, inviter: string, what: string, link: string): Message {
  return {
    to,
    subject: "You've been given an ASERS account",
    text: `${inviter} set up an ASERS account for you (${what}).\n\nSet your password here (the link expires in 7 days):\n${link}\n\nThen log in at the same site with this email address.`,
  };
}

export function statusEmail(
  to: string,
  firstName: string,
  roleLabel: string,
  chapterName: string,
  status: "approved" | "rejected",
  dashboardUrl: string
): Message {
  const approved = status === "approved";
  return {
    to,
    subject: approved
      ? `Your ${chapterName} ${roleLabel} registration is approved`
      : `Update on your ${chapterName} ${roleLabel} registration`,
    text: approved
      ? `Hi ${firstName},\n\nYour ${roleLabel.toLowerCase()} registration for ${chapterName} has been approved.\n\nSee next steps on your dashboard:\n${dashboardUrl}`
      : `Hi ${firstName},\n\nYour ${roleLabel.toLowerCase()} registration for ${chapterName} was not approved. If you think this is a mistake, please contact the chapter.\n\nDashboard:\n${dashboardUrl}`,
  };
}

export function newStudentForSraEmail(
  to: string,
  sraFirstName: string,
  studentNames: string,
  chapterName: string,
  dashboardUrl: string
): Message {
  return {
    to,
    subject: `New ${chapterName} student registration to review`,
    text: `Hi ${sraFirstName},\n\n${studentNames} just registered for ${chapterName} from your school and ${studentNames.includes(" and ") ? "are" : "is"} waiting for your approval.\n\nReview and approve students on your SRA dashboard:\n${dashboardUrl}`,
  };
}
