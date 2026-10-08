import "server-only";
import { all, first, parseJSON } from "@/lib/db";
import type { Role, Status } from "@/lib/options";

export type StudentData = { grade: string; shirtSize: string };
export type Chaperone = { self: boolean; name: string; phone: string; email: string };
export type SraData = { title: string; chaperone?: Chaperone };
export type JudgeData = {
  address: string;
  institution: string;
  yearsAtInstitution: string;
  department: string;
  position: string;
  employmentStatus: string;
  degree: string;
  degreeDate: string;
  discipline: string;
  expertise: string;
  publications: string;
  patents: string;
  hasJudged: boolean;
  judgingExperience: string;
  commitAll: boolean;
  knowsStudents: boolean;
  knownStudents: string;
  mentoring: boolean;
  mentoringDetails: string;
  availability: string;
  notes: string;
};

export type RegistrationRow = {
  id: string;
  user_id: string;
  chapter_slug: string;
  role: Role;
  status: Status;
  school_id: string | null;
  project_id: string | null;
  data: string;
  payment_received: number;
  admin_notes: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  chapter_slug: string;
  title: string;
  description: string;
  domains: string;
  methods: string;
  focus: string;
  focus_other: string;
  is_team: number;
  project_code: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  domains: string[];
  methods: string[];
  focus: string;
  focusOther: string;
  isTeam: boolean;
  projectCode: string | null;
};

export function toProject(p: ProjectRow): Project {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    domains: parseJSON<string[]>(p.domains, []),
    methods: parseJSON<string[]>(p.methods, []),
    focus: p.focus,
    focusOther: p.focus_other,
    isTeam: !!p.is_team,
    projectCode: p.project_code,
  };
}

export function focusLabel(p: Pick<Project, "focus" | "focusOther">): string {
  return p.focus === "Other" && p.focusOther ? `Other: ${p.focusOther}` : p.focus;
}

export type School = { id: string; chapter_slug: string; name: string; town: string };

export type UserRegistration = RegistrationRow & {
  chapter_name: string;
  chapter_short_name: string;
  school_name: string | null;
};

export async function getUserRegistrations(userId: string): Promise<UserRegistration[]> {
  return all<UserRegistration>(
    `SELECT r.*, c.name AS chapter_name, c.short_name AS chapter_short_name, s.name AS school_name
     FROM registrations r
     JOIN chapters c ON c.slug = r.chapter_slug
     LEFT JOIN schools s ON s.id = r.school_id
     WHERE r.user_id = ? ORDER BY r.created_at`,
    userId
  );
}

export async function getUserRegistrationInChapter(
  userId: string,
  chapterSlug: string
): Promise<RegistrationRow | null> {
  return first<RegistrationRow>(
    "SELECT * FROM registrations WHERE user_id = ? AND chapter_slug = ?",
    userId,
    chapterSlug
  );
}

export async function getSchools(chapterSlug: string): Promise<School[]> {
  return all<School>("SELECT * FROM schools WHERE chapter_slug = ? ORDER BY name", chapterSlug);
}

/** Schools students may pick: those with at least one non-rejected SRA. */
export async function getSchoolsWithSras(chapterSlug: string): Promise<School[]> {
  return all<School>(
    `SELECT s.* FROM schools s WHERE s.chapter_slug = ? AND EXISTS (
       SELECT 1 FROM registrations r WHERE r.school_id = s.id AND r.role = 'sra'
       AND r.status IN ('pending', 'approved'))
     ORDER BY s.name`,
    chapterSlug
  );
}

export async function getProject(id: string | null): Promise<Project | null> {
  if (!id) return null;
  const row = await first<ProjectRow>("SELECT * FROM projects WHERE id = ?", id);
  return row ? toProject(row) : null;
}

export type Person = {
  registration_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: Status;
  email_verified_at: string | null;
  has_password: number;
};

/** The other student(s) on a project. */
export async function getTeammates(projectId: string, excludeUserId: string): Promise<Person[]> {
  return all<Person>(
    `SELECT r.id AS registration_id, u.id AS user_id, u.first_name, u.last_name, u.email, u.phone,
            r.status, u.email_verified_at, (u.password_hash IS NOT NULL) AS has_password
     FROM registrations r JOIN users u ON u.id = r.user_id
     WHERE r.project_id = ? AND r.user_id != ?`,
    projectId,
    excludeUserId
  );
}

/** SRAs at a school (optionally only approved ones). */
export async function getSchoolSras(schoolId: string, approvedOnly = false): Promise<(Person & { title: string })[]> {
  const rows = await all<Person & { data: string }>(
    `SELECT r.id AS registration_id, u.id AS user_id, u.first_name, u.last_name, u.email, u.phone,
            r.status, u.email_verified_at, (u.password_hash IS NOT NULL) AS has_password, r.data
     FROM registrations r JOIN users u ON u.id = r.user_id
     WHERE r.school_id = ? AND r.role = 'sra' ${approvedOnly ? "AND r.status = 'approved'" : "AND r.status IN ('pending','approved')"}
     ORDER BY u.last_name`,
    schoolId
  );
  return rows.map(({ data, ...r }) => ({ ...r, title: parseJSON<SraData>(data, { title: "" }).title }));
}

export type StudentListItem = {
  registration_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: Status;
  payment_received: number;
  data: string;
  created_at: string;
  email_verified_at: string | null;
  project_id: string | null;
  project_title: string | null;
  project_code: string | null;
  is_team: number | null;
  school_name: string | null;
};

const STUDENT_LIST_SQL = `
  SELECT r.id AS registration_id, u.id AS user_id, u.first_name, u.last_name, u.email, r.status,
         r.payment_received, r.data, r.created_at, u.email_verified_at, r.project_id,
         p.title AS project_title, p.project_code, p.is_team, s.name AS school_name
  FROM registrations r
  JOIN users u ON u.id = r.user_id
  LEFT JOIN projects p ON p.id = r.project_id
  LEFT JOIN schools s ON s.id = r.school_id`;

export async function getStudentsAtSchool(schoolId: string): Promise<StudentListItem[]> {
  return all<StudentListItem>(
    `${STUDENT_LIST_SQL} WHERE r.school_id = ? AND r.role = 'student' ORDER BY u.last_name, u.first_name`,
    schoolId
  );
}
