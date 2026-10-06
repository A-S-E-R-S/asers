"use server";

import { redirect } from "next/navigation";
import { batch, first, newId, stmt } from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import { appUrl, newStudentForSraEmail, partnerInviteEmail, sendEmail } from "@/lib/email";
import {
  clientIp,
  createSession,
  findUserByEmail,
  getCurrentUser,
  issueResetLink,
  issueVerificationCode,
  normalizeEmail,
  rateLimit,
  type User,
} from "@/lib/auth";
import { getChapter, type Chapter } from "@/lib/chapters";
import {
  getSchoolSras,
  getUserRegistrationInChapter,
  type JudgeData,
  type SraData,
  type StudentData,
} from "@/lib/registrations";
import { type ActionState, bool, isEmail, isISODate, isPhone, list, str, text } from "@/lib/form";
import {
  DEGREES,
  DESCRIPTION_MAX_WORDS,
  DOMAINS,
  EMPLOYMENT_STATUSES,
  FOCUSES,
  GRADES,
  MAX_DOMAINS,
  METHODS,
  PASSWORD_MIN,
  type Role,
  SHIRT_SIZES,
  wordCount,
} from "@/lib/options";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

type Errors = Record<string, string>;

function fail(fieldErrors: Errors, error = "Please fix the highlighted fields."): ActionState {
  return { error, fieldErrors };
}

type AccountPlan =
  | { kind: "existing"; user: User; phone: string | null }
  | {
      kind: "new";
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      passwordHash: string;
      phone: string | null;
    };

/**
 * Validates the account half of a registration form. Logged-in users register
 * with their existing account; everyone else creates one.
 */
async function planAccount(fd: FormData, errors: Errors, phoneRequired: boolean): Promise<AccountPlan | null> {
  const phone = str(fd, "phone", 40);
  if (phoneRequired && !phone) errors.phone = "Phone number is required.";
  else if (phone && !isPhone(phone)) errors.phone = "Enter a valid phone number (at least 10 digits).";

  const current = await getCurrentUser();
  if (current) return { kind: "existing", user: current, phone: phone || null };

  const firstName = str(fd, "firstName", 80);
  const lastName = str(fd, "lastName", 80);
  const email = normalizeEmail(str(fd, "email", 254));
  const password = str(fd, "password", 200);
  const confirm = str(fd, "confirmPassword", 200);
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < PASSWORD_MIN) errors.password = `Password must be at least ${PASSWORD_MIN} characters.`;
  else if (password !== confirm) errors.confirmPassword = "Passwords don't match.";
  if (Object.keys(errors).length) return null;

  if (await findUserByEmail(email)) {
    errors.email = "An account with this email already exists. Log in first, then register for this chapter.";
    return null;
  }
  return {
    kind: "new",
    id: newId(),
    email,
    firstName,
    lastName,
    passwordHash: await hashPassword(password),
    phone: phone || null,
  };
}

function accountStatements(plan: AccountPlan): D1PreparedStatement[] {
  if (plan.kind === "new") {
    return [
      stmt(
        "INSERT INTO users (id, email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)",
        plan.id,
        plan.email,
        plan.passwordHash,
        plan.firstName,
        plan.lastName,
        plan.phone
      ),
    ];
  }
  if (plan.phone) {
    return [stmt("UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", plan.phone, plan.user.id)];
  }
  return [];
}

function planUserId(plan: AccountPlan): string {
  return plan.kind === "new" ? plan.id : plan.user.id;
}

async function loadOpenChapter(slug: string, role: Role): Promise<{ chapter: Chapter } | { error: ActionState }> {
  const chapter = await getChapter(slug);
  if (!chapter || !chapter.published) return { error: { error: "That chapter doesn't exist." } };
  if (!chapter.regOpen[role]) {
    return { error: { error: `${chapter.shortName} isn't accepting this type of registration right now.` } };
  }
  return { chapter };
}

/**
 * A user holds one registration per chapter. A withdrawn one can be replaced:
 * returns statements that delete it (and its project if nobody else is on it),
 * to run at the start of the registration batch. Returns null if the slot is taken.
 */
async function freeSlot(userId: string, chapterSlug: string): Promise<D1PreparedStatement[] | null> {
  const reg = await getUserRegistrationInChapter(userId, chapterSlug);
  if (!reg) return [];
  if (reg.status !== "withdrawn") return null;
  const statements = [stmt("DELETE FROM registrations WHERE id = ?", reg.id)];
  if (reg.project_id) {
    const others = await first<{ n: number }>(
      "SELECT COUNT(*) AS n FROM registrations WHERE project_id = ? AND id != ?",
      reg.project_id,
      reg.id
    );
    statements.push(
      others?.n
        ? stmt("UPDATE projects SET is_team = 0 WHERE id = ?", reg.project_id)
        : stmt("DELETE FROM projects WHERE id = ?", reg.project_id)
    );
  }
  return statements;
}

async function claimSlot(
  plan: AccountPlan,
  chapter: Chapter
): Promise<{ error: string } | { cleanup: D1PreparedStatement[] }> {
  if (plan.kind !== "existing") return { cleanup: [] };
  const cleanup = await freeSlot(plan.user.id, chapter.slug);
  if (!cleanup) return { error: `You're already registered with ${chapter.shortName}. Check your dashboard.` };
  return { cleanup };
}

async function throttle(): Promise<ActionState | null> {
  if (!(await rateLimit(`register:${await clientIp()}`, 20, 60 * 60 * 1000))) {
    return { error: "Too many registrations from this network. Please try again in an hour." };
  }
  return null;
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message);
}

/** Commit the batch, then sign the new user in and send their verification code. */
async function finish(
  plan: AccountPlan,
  statements: D1PreparedStatement[],
  chapter: Chapter,
  afterCommit?: () => Promise<void>
): Promise<ActionState> {
  try {
    await batch(statements);
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "This email (or your partner's) is already registered. Log in to check your dashboard." };
    }
    console.error("registration failed", err);
    return { error: "Something went wrong saving your registration. Please try again." };
  }
  if (afterCommit) await afterCommit();
  const dashboard = `/dashboard/${chapter.slug}`;
  if (plan.kind === "new") {
    await createSession(plan.id);
    await issueVerificationCode({ id: plan.id, email: plan.email });
    redirect(`/verify?next=${encodeURIComponent(dashboard)}`);
  }
  redirect(dashboard);
}

// ---------------------------------------------------------------- student

export async function registerStudentAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const loaded = await loadOpenChapter(str(fd, "chapter"), "student");
  if ("error" in loaded) return loaded.error;
  const { chapter } = loaded;
  const limited = await throttle();
  if (limited) return limited;

  const errors: Errors = {};
  const plan = await planAccount(fd, errors, false);

  const grade = str(fd, "grade");
  const shirtSize = str(fd, "shirtSize");
  const schoolId = str(fd, "schoolId");
  const title = str(fd, "title", 200);
  const description = text(fd, "description", 2000);
  const domains = list(fd, "domains");
  const methods = list(fd, "methods");
  const focus = str(fd, "focus");
  const focusOther = str(fd, "focusOther", 200);
  const isTeam = bool(fd, "isTeam");

  if (!GRADES.includes(grade as (typeof GRADES)[number])) errors.grade = "Select your grade.";
  if (!SHIRT_SIZES.includes(shirtSize as (typeof SHIRT_SIZES)[number])) errors.shirtSize = "Select your shirt size.";
  const school = schoolId
    ? await first<{ id: string }>(
        `SELECT s.id FROM schools s WHERE s.id = ? AND s.chapter_slug = ? AND EXISTS (
           SELECT 1 FROM registrations r WHERE r.school_id = s.id AND r.role = 'sra' AND r.status IN ('pending','approved'))`,
        schoolId,
        chapter.slug
      )
    : null;
  if (!school) errors.schoolId = "Select your school.";
  if (!title) errors.title = "Project title is required.";
  if (!description) errors.description = "Project description is required.";
  else if (wordCount(description) > DESCRIPTION_MAX_WORDS) {
    errors.description = `Keep the description to ${DESCRIPTION_MAX_WORDS} words or fewer.`;
  }
  if (domains.length === 0 || !domains.every((d) => (DOMAINS as readonly string[]).includes(d))) {
    errors.domains = "Select at least one primary scientific domain.";
  } else if (domains.length > MAX_DOMAINS) {
    errors.domains = `Select no more than ${MAX_DOMAINS} domains.`;
  }
  if (methods.length === 0 || !methods.every((m) => METHODS.includes(m))) {
    errors.methods = "Select at least one experimental methodology.";
  }
  if (!(FOCUSES as readonly string[]).includes(focus)) errors.focus = "Select a primary real-world focus.";
  else if (focus === "Other" && !focusOther) errors.focusOther = "Describe the real-world focus.";

  // Team partner
  let partner:
    | { kind: "existing"; id: string }
    | { kind: "new"; id: string; email: string; firstName: string; lastName: string }
    | null = null;
  let partnerData: StudentData | null = null;
  let partnerCleanup: D1PreparedStatement[] = [];
  if (isTeam) {
    const pFirst = str(fd, "partnerFirstName", 80);
    const pLast = str(fd, "partnerLastName", 80);
    const pEmail = normalizeEmail(str(fd, "partnerEmail", 254));
    const pGrade = str(fd, "partnerGrade");
    const pShirt = str(fd, "partnerShirtSize");
    if (!pFirst) errors.partnerFirstName = "Partner's first name is required.";
    if (!pLast) errors.partnerLastName = "Partner's last name is required.";
    if (!isEmail(pEmail)) errors.partnerEmail = "Enter your partner's email address.";
    if (!GRADES.includes(pGrade as (typeof GRADES)[number])) errors.partnerGrade = "Select your partner's grade.";
    if (!SHIRT_SIZES.includes(pShirt as (typeof SHIRT_SIZES)[number])) {
      errors.partnerShirtSize = "Select your partner's shirt size.";
    }
    const ownEmail = plan?.kind === "existing" ? plan.user.email : plan?.email;
    if (pEmail && ownEmail && pEmail === ownEmail) errors.partnerEmail = "Your partner needs their own email address.";

    if (!errors.partnerEmail) {
      const existing = await findUserByEmail(pEmail);
      if (existing) {
        const cleanup = existing.disabled ? null : await freeSlot(existing.id, chapter.slug);
        if (!cleanup) {
          // Deliberately vague: don't reveal whether this email has an account.
          errors.partnerEmail =
            "We can't add this partner. They may already be registered with this chapter; ask them to check, or contact the chapter.";
        } else {
          partner = { kind: "existing", id: existing.id };
          partnerCleanup = cleanup;
        }
      } else {
        partner = { kind: "new", id: newId(), email: pEmail, firstName: pFirst, lastName: pLast };
      }
    }
    partnerData = { grade: pGrade, shirtSize: pShirt };
  }

  if (!plan || Object.keys(errors).length) return fail(errors);
  const slot = await claimSlot(plan, chapter);
  if ("error" in slot) return { error: slot.error };

  const userId = planUserId(plan);
  const projectId = newId();
  const statements = [
    ...slot.cleanup,
    ...partnerCleanup,
    ...accountStatements(plan),
    stmt(
      `INSERT INTO projects (id, chapter_slug, title, description, domains, methods, focus, focus_other, is_team)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      projectId,
      chapter.slug,
      title,
      description,
      JSON.stringify(domains),
      JSON.stringify(methods),
      focus,
      focus === "Other" ? focusOther : "",
      isTeam ? 1 : 0
    ),
    stmt(
      `INSERT INTO registrations (id, user_id, chapter_slug, role, school_id, project_id, data)
       VALUES (?, ?, ?, 'student', ?, ?, ?)`,
      newId(),
      userId,
      chapter.slug,
      schoolId,
      projectId,
      JSON.stringify({ grade, shirtSize } satisfies StudentData)
    ),
  ];
  if (partner) {
    if (partner.kind === "new") {
      statements.push(
        stmt(
          "INSERT INTO users (id, email, first_name, last_name) VALUES (?, ?, ?, ?)",
          partner.id,
          partner.email,
          partner.firstName,
          partner.lastName
        )
      );
    }
    statements.push(
      stmt(
        `INSERT INTO registrations (id, user_id, chapter_slug, role, school_id, project_id, data)
         VALUES (?, ?, ?, 'student', ?, ?, ?)`,
        newId(),
        partner.id,
        chapter.slug,
        schoolId,
        projectId,
        JSON.stringify(partnerData)
      )
    );
  }

  const inviter =
    plan.kind === "new" ? `${plan.firstName} ${plan.lastName}` : `${plan.user.firstName} ${plan.user.lastName}`;
  const partnerName = isTeam ? `${str(fd, "partnerFirstName", 80)} ${str(fd, "partnerLastName", 80)}` : "";
  return finish(plan, statements, chapter, async () => {
    if (partner) await invitePartner(partner.id, inviter, chapter, title);
    await notifySras(schoolId, partnerName ? `${inviter} and ${partnerName}` : inviter, chapter);
  });
}

/** Lets the school's approved SRAs know a student is waiting for them. */
async function notifySras(schoolId: string, studentNames: string, chapter: Chapter): Promise<void> {
  const sras = await getSchoolSras(schoolId, true);
  const url = `${await appUrl()}/dashboard/${chapter.slug}`;
  for (const s of sras) {
    await sendEmail(newStudentForSraEmail(s.email, s.first_name, studentNames, chapter.shortName, url));
  }
}

async function invitePartner(partnerId: string, inviter: string, chapter: Chapter, projectTitle: string): Promise<void> {
  const p = await first<{ email: string; password_hash: string | null }>(
    "SELECT email, password_hash FROM users WHERE id = ?",
    partnerId
  );
  if (!p) return;
  // Partners who already have a password just log in; new partners get a set-password link.
  const link = p.password_hash
    ? `${await appUrl()}/dashboard/${chapter.slug}`
    : await issueResetLink(partnerId, SEVEN_DAYS);
  await sendEmail(partnerInviteEmail(p.email, inviter, chapter.fullName, projectTitle, link));
}

// ---------------------------------------------------------------- SRA

export async function registerSraAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const loaded = await loadOpenChapter(str(fd, "chapter"), "sra");
  if ("error" in loaded) return loaded.error;
  const { chapter } = loaded;
  const limited = await throttle();
  if (limited) return limited;

  const errors: Errors = {};
  const plan = await planAccount(fd, errors, true);
  const title = str(fd, "title", 120);
  const schoolId = str(fd, "schoolId");
  const newSchool = str(fd, "newSchool", 150).replace(/\s+/g, " ");
  const town = str(fd, "town", 80);
  if (!title) errors.title = "Title is required (e.g. Science Research Teacher).";

  let resolvedSchoolId: string | null = null;
  let createSchool = false;
  if (schoolId) {
    const s = await first<{ id: string }>("SELECT id FROM schools WHERE id = ? AND chapter_slug = ?", schoolId, chapter.slug);
    if (s) resolvedSchoolId = s.id;
    else errors.schoolId = "Select your school again.";
  } else if (newSchool) {
    const s = await first<{ id: string }>(
      "SELECT id FROM schools WHERE chapter_slug = ? AND name = ?",
      chapter.slug,
      newSchool
    );
    if (s) resolvedSchoolId = s.id;
    else {
      if (!town) errors.town = "Town is required when adding a new school.";
      resolvedSchoolId = newId();
      createSchool = true;
    }
  } else {
    errors.schoolId = "Select your school or add it.";
  }

  if (!plan || Object.keys(errors).length) return fail(errors);
  const slot = await claimSlot(plan, chapter);
  if ("error" in slot) return { error: slot.error };

  const statements = [...slot.cleanup, ...accountStatements(plan)];
  if (createSchool) {
    statements.push(
      stmt(
        "INSERT INTO schools (id, chapter_slug, name, town) VALUES (?, ?, ?, ?)",
        resolvedSchoolId,
        chapter.slug,
        newSchool,
        town
      )
    );
  }
  statements.push(
    stmt(
      "INSERT INTO registrations (id, user_id, chapter_slug, role, school_id, data) VALUES (?, ?, ?, 'sra', ?, ?)",
      newId(),
      planUserId(plan),
      chapter.slug,
      resolvedSchoolId,
      JSON.stringify({ title } satisfies SraData)
    )
  );
  return finish(plan, statements, chapter);
}

// ---------------------------------------------------------------- judge

export async function registerJudgeAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const loaded = await loadOpenChapter(str(fd, "chapter"), "judge");
  if ("error" in loaded) return loaded.error;
  const { chapter } = loaded;
  const limited = await throttle();
  if (limited) return limited;

  const errors: Errors = {};
  const plan = await planAccount(fd, errors, true);

  const data: JudgeData = {
    address: str(fd, "address", 300),
    institution: str(fd, "institution", 200),
    yearsAtInstitution: str(fd, "yearsAtInstitution", 20),
    department: str(fd, "department", 200),
    position: str(fd, "position", 200),
    employmentStatus: str(fd, "employmentStatus"),
    degree: str(fd, "degree"),
    degreeDate: str(fd, "degreeDate", 20),
    discipline: str(fd, "discipline", 200),
    expertise: text(fd, "expertise", 2000),
    publications: text(fd, "publications", 5000),
    patents: text(fd, "patents", 3000),
    hasJudged: str(fd, "hasJudged") === "yes",
    judgingExperience: text(fd, "judgingExperience", 2000),
    commitAll: str(fd, "commitAll") === "yes",
    knowsStudents: str(fd, "knowsStudents") === "yes",
    knownStudents: text(fd, "knownStudents", 2000),
    mentoring: str(fd, "mentoring") === "yes",
    mentoringDetails: text(fd, "mentoringDetails", 2000),
    availability: str(fd, "availability", 200),
    notes: text(fd, "notes", 2000),
  };

  if (!data.address) errors.address = "Address is required.";
  if (!data.institution) errors.institution = "Institution is required.";
  if (!data.department) errors.department = "Department is required.";
  if (!data.position) errors.position = "Current position is required.";
  if (!(EMPLOYMENT_STATUSES as readonly string[]).includes(data.employmentStatus)) {
    errors.employmentStatus = "Select your employment status.";
  }
  if (!(DEGREES as readonly string[]).includes(data.degree)) errors.degree = "Select your highest degree.";
  if (!data.degreeDate) errors.degreeDate = "Degree date is required.";
  else if (!/^\d{4}(-\d{2})?$/.test(data.degreeDate) && !isISODate(data.degreeDate)) {
    errors.degreeDate = "Enter the year (or month) you received the degree.";
  }
  if (!data.discipline) errors.discipline = "Discipline is required.";
  if (!data.expertise) errors.expertise = "Area of expertise is required.";
  if (!["yes", "no"].includes(str(fd, "hasJudged"))) errors.hasJudged = "Please answer this question.";
  if (!data.commitAll) errors.commitAll = "Judges need to commit to reviewing every assigned project.";
  if (!["yes", "no"].includes(str(fd, "knowsStudents"))) errors.knowsStudents = "Please answer this question.";
  else if (data.knowsStudents && !data.knownStudents) errors.knownStudents = "List the students you know.";
  if (!["yes", "no"].includes(str(fd, "mentoring"))) errors.mentoring = "Please answer this question.";
  else if (data.mentoring && !data.mentoringDetails) errors.mentoringDetails = "Please provide details.";
  if (chapter.judgeAvailability.length > 0 && !chapter.judgeAvailability.includes(data.availability)) {
    errors.availability = "Select your availability.";
  }
  if (!data.knowsStudents) data.knownStudents = "";
  if (!data.mentoring) data.mentoringDetails = "";
  if (!data.hasJudged) data.judgingExperience = "";

  if (!plan || Object.keys(errors).length) return fail(errors);
  const slot = await claimSlot(plan, chapter);
  if ("error" in slot) return { error: slot.error };

  return finish(
    plan,
    [
      ...slot.cleanup,
      ...accountStatements(plan),
      stmt(
        "INSERT INTO registrations (id, user_id, chapter_slug, role, data) VALUES (?, ?, ?, 'judge', ?)",
        newId(),
        planUserId(plan),
        chapter.slug,
        JSON.stringify(data)
      ),
    ],
    chapter
  );
}
