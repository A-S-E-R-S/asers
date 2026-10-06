"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { audit, first, parseJSON, run } from "@/lib/db";
import { appUrl, partnerInviteEmail, sendEmail, statusEmail } from "@/lib/email";
import { getCurrentUser, issueResetLink, normalizeEmail, rateLimit, type User } from "@/lib/auth";
import { getChapter } from "@/lib/chapters";
import {
  getUserRegistrationInChapter,
  type JudgeData,
  type RegistrationRow,
  type Chaperone,
  type SraData,
} from "@/lib/registrations";
import { type ActionState, bool, isEmail, isPhone, list, str, text } from "@/lib/form";
import {
  DESCRIPTION_MAX_WORDS,
  DOMAINS,
  FOCUSES,
  MAX_DOMAINS,
  METHODS,
  ROLE_LABELS,
  wordCount,
} from "@/lib/options";

async function loadOwn(chapterSlug: string): Promise<{ user: User; reg: RegistrationRow }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/verify");
  const reg = await getUserRegistrationInChapter(user.id, chapterSlug);
  if (!reg) redirect("/dashboard");
  return { user, reg };
}

function refresh(chapterSlug: string) {
  revalidatePath(`/dashboard/${chapterSlug}`);
}

// ---------------------------------------------------------------- student

export async function updateProjectAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { user, reg } = await loadOwn(chapterSlug);
  if (reg.role !== "student" || !reg.project_id) return { error: "Only students can edit projects." };
  if (reg.status === "withdrawn" || reg.status === "rejected") {
    return { error: "This registration is no longer active." };
  }
  const chapter = await getChapter(chapterSlug);
  if (!chapter?.regOpen.student) {
    return { error: "Registration is closed, so project details are locked. Contact your chapter for changes." };
  }

  const title = str(fd, "title", 200);
  const description = text(fd, "description", 2000);
  const domains = list(fd, "domains");
  const methods = list(fd, "methods");
  const focus = str(fd, "focus");
  const focusOther = str(fd, "focusOther", 200);
  const errors: Record<string, string> = {};
  if (!title) errors.title = "Project title is required.";
  if (!description) errors.description = "Project description is required.";
  else if (wordCount(description) > DESCRIPTION_MAX_WORDS) {
    errors.description = `Keep the description to ${DESCRIPTION_MAX_WORDS} words or fewer.`;
  }
  if (domains.length === 0 || domains.length > MAX_DOMAINS || !domains.every((d) => (DOMAINS as readonly string[]).includes(d))) {
    errors.domains = `Select 1 to ${MAX_DOMAINS} domains.`;
  }
  if (methods.length === 0 || !methods.every((m) => METHODS.includes(m))) {
    errors.methods = "Select at least one methodology.";
  }
  if (!(FOCUSES as readonly string[]).includes(focus)) errors.focus = "Select a primary real-world focus.";
  else if (focus === "Other" && !focusOther) errors.focusOther = "Describe the real-world focus.";
  if (Object.keys(errors).length) return { error: "Please fix the highlighted fields.", fieldErrors: errors };

  await run(
    `UPDATE projects SET title = ?, description = ?, domains = ?, methods = ?, focus = ?, focus_other = ?,
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    title,
    description,
    JSON.stringify(domains),
    JSON.stringify(methods),
    focus,
    focus === "Other" ? focusOther : "",
    reg.project_id
  );
  await audit(user.id, chapterSlug, "project.update", reg.project_id);
  refresh(chapterSlug);
  return { message: "Project saved." };
}

export async function resendPartnerInviteAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { user, reg } = await loadOwn(chapterSlug);
  const partnerId = str(fd, "partnerId");
  if (reg.role !== "student" || !reg.project_id) return { error: "Not allowed." };
  const partner = await first<{ email: string; password_hash: string | null; title: string }>(
    `SELECT u.email, u.password_hash, p.title FROM registrations r
     JOIN users u ON u.id = r.user_id JOIN projects p ON p.id = r.project_id
     WHERE r.project_id = ? AND r.user_id = ? AND r.user_id != ?`,
    reg.project_id,
    partnerId,
    user.id
  );
  if (!partner) return { error: "Partner not found." };
  if (!(await rateLimit(`partner-invite:${partnerId}`, 3, 60 * 60 * 1000))) {
    return { error: "Invite already sent several times. Please wait an hour." };
  }
  const chapter = await getChapter(chapterSlug);
  const link = partner.password_hash
    ? `${await appUrl()}/dashboard/${chapterSlug}`
    : await issueResetLink(partnerId, 7 * 24 * 60 * 60 * 1000);
  await sendEmail(
    partnerInviteEmail(partner.email, `${user.firstName} ${user.lastName}`, chapter?.fullName ?? "ASERS", partner.title, link)
  );
  return { message: `Invite sent to ${partner.email}.` };
}

export async function withdrawAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { user, reg } = await loadOwn(chapterSlug);
  if (reg.status === "withdrawn") return { error: "Already withdrawn." };
  await run(
    "UPDATE registrations SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    reg.id
  );
  await audit(user.id, chapterSlug, "registration.withdraw", reg.id);
  refresh(chapterSlug);
  return { message: "Your registration has been withdrawn. You can register again while registration is open." };
}

// ---------------------------------------------------------------- SRA

async function loadApprovedSra(chapterSlug: string) {
  const { user, reg } = await loadOwn(chapterSlug);
  if (reg.role !== "sra" || reg.status !== "approved" || !reg.school_id) {
    return { error: "Only approved SRAs can manage students." } as const;
  }
  return { user, reg, schoolId: reg.school_id } as const;
}

export async function sraSetStudentStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const loaded = await loadApprovedSra(chapterSlug);
  if ("error" in loaded) return { error: loaded.error };
  const status = str(fd, "status");
  if (!["approved", "rejected", "pending"].includes(status)) return { error: "Invalid status." };
  const student = await first<{ id: string; status: string; email: string; first_name: string }>(
    `SELECT r.id, r.status, u.email, u.first_name FROM registrations r JOIN users u ON u.id = r.user_id
     WHERE r.id = ? AND r.school_id = ? AND r.role = 'student' AND r.chapter_slug = ?`,
    str(fd, "registrationId"),
    loaded.schoolId,
    chapterSlug
  );
  if (!student) return { error: "Student not found at your school." };
  if (student.status === "withdrawn") return { error: "That student has withdrawn." };
  if (student.status === status) return {};

  await run(
    `UPDATE registrations SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP,
     updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    status,
    loaded.user.id,
    student.id
  );
  await audit(loaded.user.id, chapterSlug, `student.${status}`, student.id, "by SRA");
  if (status === "approved" || status === "rejected") {
    const chapter = await getChapter(chapterSlug);
    await sendEmail(
      statusEmail(
        student.email,
        student.first_name,
        ROLE_LABELS.student,
        chapter?.shortName ?? "ASERS",
        status,
        `${await appUrl()}/dashboard/${chapterSlug}`
      )
    );
  }
  refresh(chapterSlug);
  return {};
}

export async function sraSetPaymentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const loaded = await loadApprovedSra(chapterSlug);
  if ("error" in loaded) return { error: loaded.error };
  const paid = str(fd, "paid") === "1" ? 1 : 0;
  const result = await run(
    `UPDATE registrations SET payment_received = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND school_id = ? AND role = 'student' AND chapter_slug = ?`,
    paid,
    str(fd, "registrationId"),
    loaded.schoolId,
    chapterSlug
  );
  if (!result.meta.changes) return { error: "Student not found at your school." };
  await audit(loaded.user.id, chapterSlug, paid ? "payment.received" : "payment.unmarked", str(fd, "registrationId"), "by SRA");
  refresh(chapterSlug);
  return {};
}

export async function updateSraTitleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { reg } = await loadOwn(chapterSlug);
  if (reg.role !== "sra") return { error: "Not allowed." };
  const title = str(fd, "title", 120);
  if (!title) return { error: "Title is required." };
  const data = parseJSON<SraData>(reg.data, { title: "" });
  await run(
    "UPDATE registrations SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    JSON.stringify({ ...data, title } satisfies SraData),
    reg.id
  );
  refresh(chapterSlug);
  return { message: "Saved." };
}

/** The adult supervising the school's students at the event (often the SRA). */
export async function updateChaperoneAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { user, reg } = await loadOwn(chapterSlug);
  if (reg.role !== "sra" || reg.status === "withdrawn" || reg.status === "rejected") return { error: "Not allowed." };
  const self = bool(fd, "self");
  const chaperone: Chaperone = self
    ? { self, name: `${user.firstName} ${user.lastName}`, phone: str(fd, "phone", 40) || user.phone || "", email: user.email }
    : { self, name: str(fd, "name", 120), phone: str(fd, "phone", 40), email: normalizeEmail(str(fd, "email", 254)) };
  if (!chaperone.name) return { error: "Chaperone name is required." };
  if (!isPhone(chaperone.phone)) return { error: "Enter a phone number we can reach the chaperone at on the event day." };
  if (!isEmail(chaperone.email)) return { error: "Enter a valid chaperone email." };
  const data = parseJSON<SraData>(reg.data, { title: "" });
  await run(
    "UPDATE registrations SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    JSON.stringify({ ...data, chaperone } satisfies SraData),
    reg.id
  );
  await audit(user.id, chapterSlug, "sra.chaperone", reg.id, chaperone.name);
  refresh(chapterSlug);
  return { message: "Chaperone saved." };
}

// ---------------------------------------------------------------- judge

export async function updateJudgeDetailsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const chapterSlug = str(fd, "chapter");
  const { user, reg } = await loadOwn(chapterSlug);
  if (reg.role !== "judge") return { error: "Not allowed." };
  if (reg.status === "withdrawn") return { error: "This registration was withdrawn." };
  const chapter = await getChapter(chapterSlug);
  const data = parseJSON<Partial<JudgeData>>(reg.data, {});
  const availability = str(fd, "availability", 200);
  if (chapter && chapter.judgeAvailability.length && !chapter.judgeAvailability.includes(availability)) {
    return { error: "Select your availability." };
  }
  const knowsStudents = str(fd, "knowsStudents") === "yes";
  const mentoring = str(fd, "mentoring") === "yes";
  const next: Partial<JudgeData> = {
    ...data,
    availability,
    knowsStudents,
    knownStudents: knowsStudents ? text(fd, "knownStudents", 2000) : "",
    mentoring,
    mentoringDetails: mentoring ? text(fd, "mentoringDetails", 2000) : "",
    notes: text(fd, "notes", 2000),
  };
  if (knowsStudents && !next.knownStudents) return { error: "List the students you know." };
  if (mentoring && !next.mentoringDetails) return { error: "Describe who you're mentoring." };
  await run(
    "UPDATE registrations SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    JSON.stringify(next),
    reg.id
  );
  await audit(user.id, chapterSlug, "judge.update", reg.id);
  refresh(chapterSlug);
  return { message: "Saved." };
}
