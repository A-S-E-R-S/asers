import "server-only";
import { notFound, redirect } from "next/navigation";
import { all, first } from "@/lib/db";
import { canManageChapter, getAdminScope, getCurrentUser, isAnyAdmin, type AdminScope, type User } from "@/lib/auth";
import { getChapter, type Chapter } from "@/lib/chapters";
import type { Role, Status } from "@/lib/options";

/** For pages: any admin. Non-admins get a 404 so the panel isn't advertised. */
export async function requireAdmin(): Promise<{ user: User; scope: AdminScope }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.emailVerified) redirect("/verify?next=/admin");
  const scope = await getAdminScope(user);
  if (!isAnyAdmin(scope)) notFound();
  return { user, scope };
}

export async function requireNationalAdmin(): Promise<{ user: User; scope: AdminScope }> {
  const ctx = await requireAdmin();
  if (!ctx.scope.national) notFound();
  return ctx;
}

/** For pages: an admin of this chapter (or national). */
export async function requireChapterAdmin(slug: string): Promise<{ user: User; scope: AdminScope; chapter: Chapter }> {
  const ctx = await requireAdmin();
  if (!canManageChapter(ctx.scope, slug)) notFound();
  const chapter = await getChapter(slug);
  if (!chapter) notFound();
  return { ...ctx, chapter };
}

/**
 * For server actions: returns null instead of redirecting so the action can
 * return an error message.
 */
export async function adminForChapter(slug: string): Promise<{ user: User; scope: AdminScope } | null> {
  const user = await getCurrentUser();
  if (!user || !user.emailVerified) return null;
  const scope = await getAdminScope(user);
  return canManageChapter(scope, slug) ? { user, scope } : null;
}

export async function nationalAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  return user && user.emailVerified && user.isNationalAdmin ? user : null;
}

// ---------------------------------------------------------------- queries

export type ChapterCounts = Record<Role, Record<Status, number>> & { paid: number; schools: number };

export async function getChapterCounts(slug: string): Promise<ChapterCounts> {
  const rows = await all<{ role: Role; status: Status; n: number }>(
    "SELECT role, status, COUNT(*) AS n FROM registrations WHERE chapter_slug = ? GROUP BY role, status",
    slug
  );
  const empty = () => ({ pending: 0, approved: 0, rejected: 0, withdrawn: 0 });
  const counts = { student: empty(), sra: empty(), judge: empty(), paid: 0, schools: 0 } as ChapterCounts;
  for (const r of rows) counts[r.role][r.status] = r.n;
  const paid = await first<{ n: number }>(
    "SELECT COUNT(*) AS n FROM registrations WHERE chapter_slug = ? AND role = 'student' AND payment_received = 1 AND status != 'withdrawn'",
    slug
  );
  const schools = await first<{ n: number }>("SELECT COUNT(*) AS n FROM schools WHERE chapter_slug = ?", slug);
  counts.paid = paid?.n ?? 0;
  counts.schools = schools?.n ?? 0;
  return counts;
}

export type AdminListRow = {
  id: string;
  user_id: string;
  role: Role;
  status: Status;
  data: string;
  payment_received: number;
  admin_notes: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  has_password: number;
  school_id: string | null;
  school_name: string | null;
  school_town: string | null;
  project_id: string | null;
  project_title: string | null;
  project_description: string | null;
  project_code: string | null;
  project_domains: string | null;
  project_methods: string | null;
  project_focus: string | null;
  project_focus_other: string | null;
  is_team: number | null;
};

export type ListFilters = { status?: string; q?: string; school?: string };

export async function listRegistrations(slug: string, role: Role, f: ListFilters = {}): Promise<AdminListRow[]> {
  const where = ["r.chapter_slug = ?", "r.role = ?"];
  const params: unknown[] = [slug, role];
  if (f.status && f.status !== "all") {
    if (f.status === "active") where.push("r.status != 'withdrawn'");
    else {
      where.push("r.status = ?");
      params.push(f.status);
    }
  }
  if (f.school) {
    where.push("r.school_id = ?");
    params.push(f.school);
  }
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "")}%`;
    where.push(
      "(u.first_name || ' ' || u.last_name LIKE ? OR u.email LIKE ? OR IFNULL(p.title, '') LIKE ? OR IFNULL(s.name, '') LIKE ? OR IFNULL(p.project_code, '') LIKE ?)"
    );
    params.push(like, like, like, like, like);
  }
  return all<AdminListRow>(
    `SELECT r.id, r.user_id, r.role, r.status, r.data, r.payment_received, r.admin_notes, r.created_at,
            u.first_name, u.last_name, u.email, u.phone, u.email_verified_at,
            (u.password_hash IS NOT NULL) AS has_password,
            r.school_id, s.name AS school_name, s.town AS school_town,
            r.project_id, p.title AS project_title, p.description AS project_description,
            p.project_code, p.domains AS project_domains, p.methods AS project_methods,
            p.focus AS project_focus, p.focus_other AS project_focus_other, p.is_team
     FROM registrations r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN schools s ON s.id = r.school_id
     LEFT JOIN projects p ON p.id = r.project_id
     WHERE ${where.join(" AND ")}
     ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END,
              u.last_name COLLATE NOCASE, u.first_name COLLATE NOCASE`,
    ...params
  );
}

export async function getRegistrationForAdmin(slug: string, id: string): Promise<AdminListRow | null> {
  return first<AdminListRow>(
    `SELECT r.id, r.user_id, r.role, r.status, r.data, r.payment_received, r.admin_notes, r.created_at,
            u.first_name, u.last_name, u.email, u.phone, u.email_verified_at,
            (u.password_hash IS NOT NULL) AS has_password,
            r.school_id, s.name AS school_name, s.town AS school_town,
            r.project_id, p.title AS project_title, p.description AS project_description,
            p.project_code, p.domains AS project_domains, p.methods AS project_methods,
            p.focus AS project_focus, p.focus_other AS project_focus_other, p.is_team
     FROM registrations r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN schools s ON s.id = r.school_id
     LEFT JOIN projects p ON p.id = r.project_id
     WHERE r.chapter_slug = ? AND r.id = ?`,
    slug,
    id
  );
}

export type SchoolSummary = {
  id: string;
  name: string;
  town: string;
  created_at: string;
  sras: number;
  approved_sras: number;
  students: number;
  approved_students: number;
};

export async function listSchools(slug: string): Promise<SchoolSummary[]> {
  return all<SchoolSummary>(
    `SELECT s.id, s.name, s.town, s.created_at,
       (SELECT COUNT(*) FROM registrations r WHERE r.school_id = s.id AND r.role = 'sra' AND r.status != 'withdrawn') AS sras,
       (SELECT COUNT(*) FROM registrations r WHERE r.school_id = s.id AND r.role = 'sra' AND r.status = 'approved') AS approved_sras,
       (SELECT COUNT(*) FROM registrations r WHERE r.school_id = s.id AND r.role = 'student' AND r.status != 'withdrawn') AS students,
       (SELECT COUNT(*) FROM registrations r WHERE r.school_id = s.id AND r.role = 'student' AND r.status = 'approved') AS approved_students
     FROM schools s WHERE s.chapter_slug = ? ORDER BY s.name`,
    slug
  );
}

export type ChapterAdminRow = { user_id: string; first_name: string; last_name: string; email: string; created_at: string; email_verified_at: string | null; has_password: number };

export async function listChapterAdmins(slug: string): Promise<ChapterAdminRow[]> {
  return all<ChapterAdminRow>(
    `SELECT ca.user_id, u.first_name, u.last_name, u.email, ca.created_at, u.email_verified_at,
            (u.password_hash IS NOT NULL) AS has_password
     FROM chapter_admins ca JOIN users u ON u.id = ca.user_id
     WHERE ca.chapter_slug = ? ORDER BY u.last_name`,
    slug
  );
}

export type AuditRow = {
  id: number;
  actor_id: string | null;
  actor_name: string | null;
  chapter_slug: string | null;
  action: string;
  target: string | null;
  detail: string | null;
  created_at: string;
};

export async function listAudit(slug: string | null, limit = 200): Promise<AuditRow[]> {
  return all<AuditRow>(
    `SELECT a.*, u.first_name || ' ' || u.last_name AS actor_name
     FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
     ${slug ? "WHERE a.chapter_slug = ?" : ""}
     ORDER BY a.id DESC LIMIT ${Math.min(limit, 1000)}`,
    ...(slug ? [slug] : [])
  );
}
