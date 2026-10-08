"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, audit, batch, first, newId, run, stmt } from "@/lib/db";
import { accountInviteEmail, appUrl, resetEmail, sendEmail, statusEmail } from "@/lib/email";
import { destroyAllSessions, findUserByEmail, issueResetLink, normalizeEmail, type User } from "@/lib/auth";
import { adminForChapter, nationalAdmin } from "@/lib/admin";
import { getChapter } from "@/lib/chapters";
import type { JudgeData } from "@/lib/registrations";
import { type ActionState, bool, isEmail, isISODate, str, text } from "@/lib/form";
import { ROLE_LABELS, isStatus, type Role } from "@/lib/options";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const DENIED: ActionState = { error: "You don't have permission to manage this chapter." };

function refreshChapter(slug: string) {
  revalidatePath(`/admin/${slug}`, "layout");
  revalidatePath(`/chapters/${slug}`);
}

async function chapterAdmin(fd: FormData): Promise<{ user: User; slug: string } | null> {
  const slug = str(fd, "chapter");
  const ctx = slug ? await adminForChapter(slug) : null;
  return ctx ? { user: ctx.user, slug } : null;
}

type RegTarget = {
  id: string;
  user_id: string;
  role: Role;
  status: string;
  project_id: string | null;
  school_id: string | null;
  email: string;
  first_name: string;
};

async function loadReg(slug: string, id: string): Promise<RegTarget | null> {
  return first<RegTarget>(
    `SELECT r.id, r.user_id, r.role, r.status, r.project_id, r.school_id, u.email, u.first_name
     FROM registrations r JOIN users u ON u.id = r.user_id WHERE r.id = ? AND r.chapter_slug = ?`,
    id,
    slug
  );
}

/**
 * Creates an invited (passwordless) user, or returns the existing one. With
 * `requireVerified`, an existing account must have proven it owns the email,
 * so admin access can't land on an account someone else squatted.
 */
async function findOrInviteUser(
  email: string,
  firstName: string,
  lastName: string,
  requireVerified = false
): Promise<{ id: string; created: boolean } | { error: string }> {
  const existing = await findUserByEmail(email);
  if (existing) {
    if (requireVerified && (!existing.email_verified_at || !existing.password_hash)) {
      return {
        error: `${email} has an account that hasn't been verified yet. Ask them to log in and verify their email (or use "Email password link" on their user page), then try again.`,
      };
    }
    if (existing.disabled) return { error: `${email}'s account is disabled.` };
    return { id: existing.id, created: false };
  }
  if (!firstName || !lastName) return { error: "First and last name are required for a new account." };
  const id = newId();
  await run(
    "INSERT INTO users (id, email, first_name, last_name) VALUES (?, ?, ?, ?)",
    id,
    email,
    firstName,
    lastName
  );
  return { id, created: true };
}

// ================================================================ registrations

export async function setRegistrationStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const status = str(fd, "status");
  if (!isStatus(status)) return { error: "Invalid status." };
  const reg = await loadReg(ctx.slug, str(fd, "id"));
  if (!reg) return { error: "Registration not found." };
  if (reg.status === status) return {};

  await run(
    `UPDATE registrations SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    status,
    ctx.user.id,
    reg.id
  );
  await audit(ctx.user.id, ctx.slug, `${reg.role}.${status}`, reg.id, `${reg.first_name} (${reg.email})`);

  // Quick-action buttons omit the checkbox and always notify.
  const notify = fd.has("notifyField") ? bool(fd, "notify") : true;
  if (notify && (status === "approved" || status === "rejected")) {
    const chapter = await getChapter(ctx.slug);
    await sendEmail(
      statusEmail(
        reg.email,
        reg.first_name,
        ROLE_LABELS[reg.role],
        chapter?.shortName ?? "ASERS",
        status,
        `${await appUrl()}/dashboard/${ctx.slug}`
      )
    );
  }
  refreshChapter(ctx.slug);
  return { message: `Marked ${status}.` };
}

export async function setPaymentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const paid = str(fd, "paid") === "1" ? 1 : 0;
  const res = await run(
    `UPDATE registrations SET payment_received = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND chapter_slug = ? AND role = 'student'`,
    paid,
    str(fd, "id"),
    ctx.slug
  );
  if (!res.meta.changes) return { error: "Student not found." };
  await audit(ctx.user.id, ctx.slug, paid ? "payment.received" : "payment.unmarked", str(fd, "id"));
  refreshChapter(ctx.slug);
  return {};
}

export async function updateAdminNotesAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const res = await run(
    "UPDATE registrations SET admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND chapter_slug = ?",
    text(fd, "notes", 5000),
    str(fd, "id"),
    ctx.slug
  );
  if (!res.meta.changes) return { error: "Registration not found." };
  refreshChapter(ctx.slug);
  return { message: "Notes saved." };
}

export async function setProjectCodeAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const reg = await loadReg(ctx.slug, str(fd, "id"));
  if (!reg?.project_id) return { error: "Project not found." };
  const code = str(fd, "code", 30).toUpperCase();
  if (code) {
    const clash = await first<{ id: string }>(
      "SELECT id FROM projects WHERE chapter_slug = ? AND project_code = ? AND id != ?",
      ctx.slug,
      code,
      reg.project_id
    );
    if (clash) return { error: `${code} is already used by another project.` };
  }
  await run(
    "UPDATE projects SET project_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    code || null,
    reg.project_id
  );
  await audit(ctx.user.id, ctx.slug, "project.code", reg.project_id, code || "(cleared)");
  refreshChapter(ctx.slug);
  return { message: code ? `Project ID set to ${code}.` : "Project ID cleared." };
}

/** Numbers every project with an approved student that doesn't have an ID yet. */
export async function assignProjectCodesAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const prefix = str(fd, "prefix", 10).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!prefix) return { error: "Enter a prefix, e.g. NJ." };

  const existing = await all<{ project_code: string }>(
    "SELECT project_code FROM projects WHERE chapter_slug = ? AND project_code LIKE ?",
    ctx.slug,
    `${prefix}-%`
  );
  let n = existing.reduce((max, p) => {
    const m = p.project_code.match(/-(\d+)$/);
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);

  const projects = await all<{ id: string }>(
    `SELECT p.id FROM projects p WHERE p.chapter_slug = ? AND p.project_code IS NULL AND EXISTS (
       SELECT 1 FROM registrations r WHERE r.project_id = p.id AND r.status = 'approved')
     ORDER BY p.created_at`,
    ctx.slug
  );
  if (!projects.length) return { message: "Every approved project already has an ID." };
  await batch(
    projects.map((p) =>
      stmt(
        "UPDATE projects SET project_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        `${prefix}-${String(++n).padStart(3, "0")}`,
        p.id
      )
    )
  );
  await audit(ctx.user.id, ctx.slug, "project.assign_codes", null, `${projects.length} projects, prefix ${prefix}`);
  refreshChapter(ctx.slug);
  return { message: `Assigned IDs to ${projects.length} project${projects.length === 1 ? "" : "s"}.` };
}

export async function changeSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const reg = await loadReg(ctx.slug, str(fd, "id"));
  if (!reg || reg.role === "judge") return { error: "Registration not found." };
  const school = await first<{ id: string; name: string }>(
    "SELECT id, name FROM schools WHERE id = ? AND chapter_slug = ?",
    str(fd, "schoolId"),
    ctx.slug
  );
  if (!school) return { error: "Select a school." };
  // Teammates must share a school, so move the whole project.
  if (reg.role === "student" && reg.project_id) {
    await run(
      "UPDATE registrations SET school_id = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ? AND chapter_slug = ?",
      school.id,
      reg.project_id,
      ctx.slug
    );
  } else {
    await run("UPDATE registrations SET school_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", school.id, reg.id);
  }
  await audit(ctx.user.id, ctx.slug, "registration.school", reg.id, school.name);
  refreshChapter(ctx.slug);
  return { message: `Moved to ${school.name}.` };
}

export async function deleteRegistrationAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const reg = await loadReg(ctx.slug, str(fd, "id"));
  if (!reg) return { error: "Registration not found." };
  const statements = [stmt("DELETE FROM registrations WHERE id = ?", reg.id)];
  if (reg.project_id) {
    const others = await first<{ n: number }>(
      "SELECT COUNT(*) AS n FROM registrations WHERE project_id = ? AND id != ?",
      reg.project_id,
      reg.id
    );
    if (!others?.n) statements.push(stmt("DELETE FROM projects WHERE id = ?", reg.project_id));
    else statements.push(stmt("UPDATE projects SET is_team = 0 WHERE id = ?", reg.project_id));
  }
  await batch(statements);
  await audit(ctx.user.id, ctx.slug, `${reg.role}.delete`, reg.id, `${reg.first_name} (${reg.email})`);
  refreshChapter(ctx.slug);
  redirect(`/admin/${ctx.slug}/${reg.role === "sra" ? "sras" : `${reg.role}s`}`);
}

/** Email a set-password (new user) or reset-password (existing) link to someone in this chapter. */
export async function sendPasswordLinkAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const userId = str(fd, "userId");
  const target = await first<{ email: string; password_hash: string | null }>(
    `SELECT u.email, u.password_hash FROM users u WHERE u.id = ? AND (
       EXISTS (SELECT 1 FROM registrations r WHERE r.user_id = u.id AND r.chapter_slug = ?)
       OR EXISTS (SELECT 1 FROM chapter_admins a WHERE a.user_id = u.id AND a.chapter_slug = ?))`,
    userId,
    ctx.slug,
    ctx.slug
  );
  if (!target) return { error: "User not found in this chapter." };
  const chapter = await getChapter(ctx.slug);
  if (target.password_hash) {
    await sendEmail(resetEmail(target.email, await issueResetLink(userId, 60 * 60 * 1000)));
  } else {
    await sendEmail(
      accountInviteEmail(
        target.email,
        `${ctx.user.firstName} ${ctx.user.lastName}`,
        chapter?.shortName ?? "ASERS",
        await issueResetLink(userId, SEVEN_DAYS)
      )
    );
  }
  await audit(ctx.user.id, ctx.slug, "user.password_link", userId, target.email);
  return { message: `Sent a ${target.password_hash ? "password reset" : "set-password"} link to ${target.email}.` };
}

export async function markVerifiedAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const userId = str(fd, "userId");
  const res = await run(
    `UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP)
     WHERE id = ? AND EXISTS (SELECT 1 FROM registrations r WHERE r.user_id = users.id AND r.chapter_slug = ?)`,
    userId,
    ctx.slug
  );
  if (!res.meta.changes) return { error: "User not found in this chapter." };
  await audit(ctx.user.id, ctx.slug, "user.mark_verified", userId);
  refreshChapter(ctx.slug);
  return { message: "Email marked as verified." };
}

/** Admin-created judge (e.g. a scientist who emailed instead of registering). */
export async function addJudgeAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const email = normalizeEmail(str(fd, "email", 254));
  const firstName = str(fd, "firstName", 80);
  const lastName = str(fd, "lastName", 80);
  if (!isEmail(email)) return { error: "Enter a valid email." };
  const existing = await findUserByEmail(email);
  if (existing && (await first("SELECT 1 FROM registrations WHERE user_id = ? AND chapter_slug = ?", existing.id, ctx.slug))) {
    return { error: "That person is already registered with this chapter." };
  }
  const u = await findOrInviteUser(email, firstName, lastName);
  if ("error" in u) return { error: u.error };
  const data: Partial<JudgeData> = {
    institution: str(fd, "institution", 200),
    expertise: text(fd, "expertise", 2000),
    notes: "Added by admin",
  };
  const id = newId();
  try {
    await run(
      "INSERT INTO registrations (id, user_id, chapter_slug, role, status, data, reviewed_by, reviewed_at) VALUES (?, ?, ?, 'judge', 'approved', ?, ?, CURRENT_TIMESTAMP)",
      id,
      u.id,
      ctx.slug,
      JSON.stringify(data),
      ctx.user.id
    );
  } catch {
    return { error: "That person is already registered with this chapter." };
  }
  if (u.created) {
    const chapter = await getChapter(ctx.slug);
    await sendEmail(
      accountInviteEmail(
        email,
        `${ctx.user.firstName} ${ctx.user.lastName}`,
        `judge for ${chapter?.shortName ?? "ASERS"}`,
        await issueResetLink(u.id, SEVEN_DAYS)
      )
    );
  }
  await audit(ctx.user.id, ctx.slug, "judge.add", id, email);
  refreshChapter(ctx.slug);
  return { message: `Added ${email} as an approved judge${u.created ? " and emailed them a set-password link" : ""}.`, ok: Date.now() };
}

// ================================================================ schools

export async function addSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const name = str(fd, "name", 150).replace(/\s+/g, " ");
  const town = str(fd, "town", 80);
  if (!name) return { error: "School name is required." };
  try {
    await run("INSERT INTO schools (id, chapter_slug, name, town) VALUES (?, ?, ?, ?)", newId(), ctx.slug, name, town);
  } catch {
    return { error: "A school with that name already exists." };
  }
  await audit(ctx.user.id, ctx.slug, "school.add", null, name);
  refreshChapter(ctx.slug);
  return { message: `Added ${name}.`, ok: Date.now() };
}

export async function updateSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const name = str(fd, "name", 150).replace(/\s+/g, " ");
  if (!name) return { error: "School name is required." };
  try {
    const res = await run(
      "UPDATE schools SET name = ?, town = ? WHERE id = ? AND chapter_slug = ?",
      name,
      str(fd, "town", 80),
      str(fd, "id"),
      ctx.slug
    );
    if (!res.meta.changes) return { error: "School not found." };
  } catch {
    return { error: "Another school already has that name. Merge them instead." };
  }
  await audit(ctx.user.id, ctx.slug, "school.update", str(fd, "id"), name);
  refreshChapter(ctx.slug);
  return { message: "Saved." };
}

/** Moves everyone from one school record to another (fixes duplicates like "MHS" vs "Millburn High School"). */
export async function mergeSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const fromId = str(fd, "id");
  const intoId = str(fd, "into");
  if (!intoId || fromId === intoId) return { error: "Pick a different school to merge into." };
  const schools = await all<{ id: string; name: string }>(
    "SELECT id, name FROM schools WHERE id IN (?, ?) AND chapter_slug = ?",
    fromId,
    intoId,
    ctx.slug
  );
  if (schools.length !== 2) return { error: "School not found." };
  await batch([
    stmt("UPDATE registrations SET school_id = ? WHERE school_id = ?", intoId, fromId),
    stmt("DELETE FROM schools WHERE id = ?", fromId),
  ]);
  const from = schools.find((s) => s.id === fromId)!.name;
  const into = schools.find((s) => s.id === intoId)!.name;
  await audit(ctx.user.id, ctx.slug, "school.merge", fromId, `${from} -> ${into}`);
  refreshChapter(ctx.slug);
  return { message: `Merged ${from} into ${into}.` };
}

export async function deleteSchoolAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const id = str(fd, "id");
  const used = await first<{ n: number }>("SELECT COUNT(*) AS n FROM registrations WHERE school_id = ?", id);
  if (used?.n) return { error: "This school still has registrations. Merge it into another school instead." };
  const res = await run("DELETE FROM schools WHERE id = ? AND chapter_slug = ?", id, ctx.slug);
  if (!res.meta.changes) return { error: "School not found." };
  await audit(ctx.user.id, ctx.slug, "school.delete", id);
  refreshChapter(ctx.slug);
  return {};
}

// ================================================================ chapter page & settings

function optionalDate(fd: FormData, key: string, errors: string[], label: string): string | null {
  const v = str(fd, key, 20);
  if (!v) return null;
  if (!isISODate(v)) errors.push(`${label} must be a valid date.`);
  return v;
}

function optionalUrl(fd: FormData, key: string, errors: string[]): string | null {
  const v = str(fd, key, 300);
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return u.toString().replace(/\/$/, "");
  } catch {
    errors.push("Website must be a full URL starting with https://");
    return null;
  }
}

export async function updateChapterPageAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const errors: string[] = [];
  const description = text(fd, "description", 1000);
  const contactEmail = normalizeEmail(str(fd, "email", 254));
  if (!description) errors.push("A short description is required.");
  if (contactEmail && !isEmail(contactEmail)) errors.push("Contact email isn't valid.");
  const site = optionalUrl(fd, "site", errors);
  const eventDate = optionalDate(fd, "eventDate", errors, "Event date");
  const deadline = optionalDate(fd, "registrationDeadline", errors, "Registration deadline");
  if (errors.length) return { error: errors.join(" ") };

  await run(
    `UPDATE chapters SET description = ?, about = ?, announcement = ?, contact_email = ?, site = ?, venue = ?,
       founded = ?, event_date = ?, event_details = ?, registration_deadline = ?, student_fee = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE slug = ?`,
    description,
    text(fd, "about", 20000),
    text(fd, "announcement", 2000),
    contactEmail || null,
    site,
    str(fd, "venue", 300) || null,
    str(fd, "founded", 20) || null,
    eventDate,
    str(fd, "eventDetails", 200),
    deadline,
    str(fd, "studentFee", 100),
    ctx.slug
  );
  await audit(ctx.user.id, ctx.slug, "chapter.page");
  refreshChapter(ctx.slug);
  revalidatePath("/", "layout");
  return { message: "Chapter page saved." };
}

export async function updateRegistrationSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await chapterAdmin(fd);
  if (!ctx) return DENIED;
  const availability = text(fd, "judgeAvailability", 3000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
  await run(
    `UPDATE chapters SET student_reg_open = ?, sra_reg_open = ?, judge_reg_open = ?, judge_availability = ?,
     updated_at = CURRENT_TIMESTAMP WHERE slug = ?`,
    bool(fd, "studentOpen") ? 1 : 0,
    bool(fd, "sraOpen") ? 1 : 0,
    bool(fd, "judgeOpen") ? 1 : 0,
    JSON.stringify(availability),
    ctx.slug
  );
  await audit(
    ctx.user.id,
    ctx.slug,
    "chapter.settings",
    null,
    `student=${bool(fd, "studentOpen")} sra=${bool(fd, "sraOpen")} judge=${bool(fd, "judgeOpen")}`
  );
  refreshChapter(ctx.slug);
  revalidatePath("/", "layout");
  return { message: "Registration settings saved." };
}

// ================================================================ national: chapters

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createChapterAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can create chapters." };
  const slug = str(fd, "slug", 60).toLowerCase();
  const subdomain = str(fd, "subdomain", 30).toLowerCase();
  const name = str(fd, "name", 80);
  const shortName = str(fd, "shortName", 20);
  const fullName = str(fd, "fullName", 150);
  const errors: string[] = [];
  if (!SLUG_RE.test(slug)) errors.push("Slug must be lowercase letters, numbers and dashes (e.g. new-york).");
  if (["student", "sra", "judge", "users", "chapters", "activity", "new"].includes(slug)) errors.push("That slug is reserved.");
  if (subdomain && !SLUG_RE.test(subdomain)) errors.push("Subdomain must be lowercase letters, numbers and dashes.");
  if (!name || !shortName || !fullName) errors.push("Name, short name and full name are required.");
  if (errors.length) return { error: errors.join(" ") };
  try {
    await run(
      `INSERT INTO chapters (slug, subdomain, name, short_name, full_name, description, judge_availability, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      slug,
      subdomain || null,
      name,
      shortName,
      fullName,
      `${fullName} is the ${name} chapter of ASERS.`,
      JSON.stringify(["In Person (Full Day)", "In Person (Morning Only)", "Remote (Morning Only)"])
    );
  } catch {
    return { error: "A chapter with that slug or subdomain already exists." };
  }
  await audit(user.id, slug, "chapter.create", slug, fullName);
  revalidatePath("/admin", "layout");
  redirect(`/admin/${slug}/settings`);
}

export async function updateChapterIdentityAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can change chapter names, subdomains or visibility." };
  const slug = str(fd, "chapter");
  const subdomain = str(fd, "subdomain", 30).toLowerCase();
  const name = str(fd, "name", 80);
  const shortName = str(fd, "shortName", 20);
  const fullName = str(fd, "fullName", 150);
  const sortOrder = Number.parseInt(str(fd, "sortOrder", 6) || "0", 10);
  if (!name || !shortName || !fullName) return { error: "Name, short name and full name are required." };
  if (subdomain && !SLUG_RE.test(subdomain)) return { error: "Subdomain must be lowercase letters, numbers and dashes." };
  try {
    const res = await run(
      `UPDATE chapters SET name = ?, short_name = ?, full_name = ?, subdomain = ?, published = ?, sort_order = ?,
       updated_at = CURRENT_TIMESTAMP WHERE slug = ?`,
      name,
      shortName,
      fullName,
      subdomain || null,
      bool(fd, "published") ? 1 : 0,
      Number.isFinite(sortOrder) ? sortOrder : 0,
      slug
    );
    if (!res.meta.changes) return { error: "Chapter not found." };
  } catch {
    return { error: "Another chapter already uses that subdomain." };
  }
  await audit(user.id, slug, "chapter.identity", null, `published=${bool(fd, "published")}`);
  refreshChapter(slug);
  revalidatePath("/", "layout");
  return { message: "Saved." };
}

export async function deleteChapterAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can delete chapters." };
  const slug = str(fd, "chapter");
  if (str(fd, "confirm") !== slug) return { error: `Type "${slug}" to confirm.` };
  const used = await first<{ n: number }>("SELECT COUNT(*) AS n FROM registrations WHERE chapter_slug = ?", slug);
  if (used?.n) return { error: "This chapter has registrations. Unpublish it instead, or delete the registrations first." };
  await run("DELETE FROM chapters WHERE slug = ?", slug);
  await audit(user.id, null, "chapter.delete", slug);
  revalidatePath("/", "layout");
  redirect("/admin");
}

// ================================================================ national: admins & users

export async function addChapterAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can add chapter admins." };
  const slug = str(fd, "chapter");
  if (!(await getChapter(slug))) return { error: "Chapter not found." };
  const email = normalizeEmail(str(fd, "email", 254));
  if (!isEmail(email)) return { error: "Enter a valid email." };
  const u = await findOrInviteUser(email, str(fd, "firstName", 80), str(fd, "lastName", 80), true);
  if ("error" in u) return { error: u.error };
  await run("INSERT OR IGNORE INTO chapter_admins (user_id, chapter_slug) VALUES (?, ?)", u.id, slug);
  if (!u.created) {
    const chapter = await getChapter(slug);
    await sendEmail({
      to: email,
      subject: `You're now an admin for ${chapter?.shortName ?? slug}`,
      text: `${user.firstName} ${user.lastName} made you an admin for ${chapter?.fullName ?? slug} on ASERS.\n\nOpen the admin panel: ${await appUrl()}/admin/${slug}\n\nIf this is unexpected, contact contact@asers.org.`,
    });
  }
  if (u.created) {
    // Invited admins prove email ownership by setting their password from the link.
    const chapter = await getChapter(slug);
    await sendEmail(
      accountInviteEmail(
        email,
        `${user.firstName} ${user.lastName}`,
        `admin for ${chapter?.shortName ?? slug}`,
        await issueResetLink(u.id, SEVEN_DAYS)
      )
    );
  }
  await audit(user.id, slug, "admin.add", u.id, email);
  refreshChapter(slug);
  return {
    message: u.created
      ? `Created an account for ${email} and emailed a set-password link.`
      : `${email} is now an admin of this chapter.`,
    ok: Date.now(),
  };
}

export async function removeChapterAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can remove chapter admins." };
  const slug = str(fd, "chapter");
  const userId = str(fd, "userId");
  await run("DELETE FROM chapter_admins WHERE user_id = ? AND chapter_slug = ?", userId, slug);
  await audit(user.id, slug, "admin.remove", userId);
  refreshChapter(slug);
  return {};
}

export async function setNationalAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can do this." };
  const userId = str(fd, "userId");
  const on = str(fd, "on") === "1";
  if (userId === user.id && !on) return { error: "You can't remove your own national admin access." };
  await run("UPDATE users SET is_national_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", on ? 1 : 0, userId);
  await audit(user.id, null, on ? "national_admin.grant" : "national_admin.revoke", userId);
  revalidatePath("/admin", "layout");
  return { message: on ? "Granted national admin." : "Revoked national admin." };
}

export async function addNationalAdminAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can do this." };
  const email = normalizeEmail(str(fd, "email", 254));
  if (!isEmail(email)) return { error: "Enter a valid email." };
  const u = await findOrInviteUser(email, str(fd, "firstName", 80), str(fd, "lastName", 80), true);
  if ("error" in u) return { error: u.error };
  await run("UPDATE users SET is_national_admin = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", u.id);
  if (!u.created) {
    await sendEmail({
      to: email,
      subject: "You're now an ASERS national admin",
      text: `${user.firstName} ${user.lastName} made you a national admin on ASERS.\n\nOpen the admin panel: ${await appUrl()}/admin\n\nIf this is unexpected, contact contact@asers.org.`,
    });
  }
  if (u.created) {
    await sendEmail(
      accountInviteEmail(email, `${user.firstName} ${user.lastName}`, "ASERS national admin", await issueResetLink(u.id, SEVEN_DAYS))
    );
  }
  await audit(user.id, null, "national_admin.grant", u.id, email);
  revalidatePath("/admin", "layout");
  return { message: `${email} is now a national admin.`, ok: Date.now() };
}

export async function setUserDisabledAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can do this." };
  const userId = str(fd, "userId");
  const disabled = str(fd, "disabled") === "1";
  if (userId === user.id) return { error: "You can't disable your own account." };
  await run("UPDATE users SET disabled = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", disabled ? 1 : 0, userId);
  if (disabled) await destroyAllSessions(userId);
  await audit(user.id, null, disabled ? "user.disable" : "user.enable", userId);
  revalidatePath(`/admin/users/${userId}`);
  return { message: disabled ? "Account disabled and signed out everywhere." : "Account re-enabled." };
}

export async function nationalUserActionsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await nationalAdmin();
  if (!user) return { error: "Only national admins can do this." };
  const userId = str(fd, "userId");
  const target = await first<{ email: string; password_hash: string | null }>(
    "SELECT email, password_hash FROM users WHERE id = ?",
    userId
  );
  if (!target) return { error: "User not found." };
  const op = str(fd, "op");
  if (op === "verify") {
    await run("UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = ?", userId);
    await audit(user.id, null, "user.mark_verified", userId);
    revalidatePath(`/admin/users/${userId}`);
    return { message: "Email marked verified." };
  }
  if (op === "link") {
    const link = await issueResetLink(userId, target.password_hash ? 60 * 60 * 1000 : SEVEN_DAYS);
    await sendEmail(
      target.password_hash
        ? resetEmail(target.email, link)
        : accountInviteEmail(target.email, `${user.firstName} ${user.lastName}`, "ASERS", link)
    );
    await audit(user.id, null, "user.password_link", userId, target.email);
    return { message: `Sent a password link to ${target.email}.` };
  }
  if (op === "email") {
    const email = normalizeEmail(str(fd, "email", 254));
    if (!isEmail(email)) return { error: "Enter a valid email." };
    if (await findUserByEmail(email)) return { error: "Another account already uses that email." };
    try {
      await run("UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", email, userId);
    } catch {
      return { error: "Another account already uses that email." };
    }
    // Outstanding codes/links were sent to the old address.
    await run("DELETE FROM auth_codes WHERE user_id = ?", userId);
    await audit(user.id, null, "user.email", userId, `${target.email} -> ${email}`);
    revalidatePath(`/admin/users/${userId}`);
    return { message: `Email changed to ${email}.` };
  }
  return { error: "Unknown action." };
}
