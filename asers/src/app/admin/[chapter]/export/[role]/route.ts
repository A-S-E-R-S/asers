import { adminForChapter, listRegistrations, type AdminListRow } from "@/lib/admin";
import { parseJSON } from "@/lib/db";
import { isRole } from "@/lib/options";
import type { JudgeData, SraData, StudentData } from "@/lib/registrations";

type Ctx = { params: Promise<{ chapter: string; role: string }> };

/** Quotes a CSV cell and neutralizes spreadsheet formulas (=, +, -, @). */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

const yn = (b: boolean | undefined) => (b ? "Yes" : "No");
const list = (json: string | null) => parseJSON<string[]>(json, []).join("; ");

function base(r: AdminListRow): unknown[] {
  return [r.status, r.first_name, r.last_name, r.email, r.phone ?? "", r.email_verified_at ? "Yes" : "No", r.created_at];
}
const BASE_HEADERS = ["Status", "First name", "Last name", "Email", "Phone", "Email verified", "Registered (UTC)"];

export async function GET(req: Request, { params }: Ctx) {
  const { chapter: slug, role } = await params;
  if (!isRole(role)) return new Response("Not found", { status: 404 });
  if (!(await adminForChapter(slug))) return new Response("Not found", { status: 404 });

  const url = new URL(req.url);
  const rows = await listRegistrations(slug, role, {
    status: url.searchParams.get("status") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    school: url.searchParams.get("school") ?? undefined,
  });

  let headers: string[];
  let body: unknown[][];
  if (role === "student") {
    headers = [
      ...BASE_HEADERS,
      "School",
      "Grade",
      "Shirt size",
      "Fee received",
      "Project ID",
      "Project title",
      "Team project",
      "Teammate",
      "Description",
      "Domains",
      "Methodology",
      "Real-world focus",
      "Admin notes",
    ];
    body = rows.map((r) => {
      const d = parseJSON<StudentData>(r.data, { grade: "", shirtSize: "" });
      const mate = r.project_id ? rows.find((o) => o.project_id === r.project_id && o.id !== r.id) : undefined;
      return [
        ...base(r),
        r.school_name,
        d.grade,
        d.shirtSize,
        r.payment_received ? "Yes" : "No",
        r.project_code,
        r.project_title,
        r.is_team ? "Yes" : "No",
        mate ? `${mate.first_name} ${mate.last_name}` : "",
        r.project_description,
        list(r.project_domains),
        list(r.project_methods),
        r.project_focus === "Other" ? `Other: ${r.project_focus_other}` : r.project_focus,
        r.admin_notes,
      ];
    });
  } else if (role === "sra") {
    headers = [...BASE_HEADERS, "School", "Town", "Title", "Chaperone", "Chaperone email", "Chaperone phone", "Admin notes"];
    body = rows.map((r) => {
      const d = parseJSON<SraData>(r.data, { title: "" });
      return [
        ...base(r),
        r.school_name,
        r.school_town,
        d.title,
        d.chaperone?.name ?? "",
        d.chaperone?.email ?? "",
        d.chaperone?.phone ?? "",
        r.admin_notes,
      ];
    });
  } else {
    headers = [
      ...BASE_HEADERS,
      "Address",
      "Institution",
      "Department",
      "Position",
      "Years at institution",
      "Employment",
      "Highest degree",
      "Degree date",
      "Discipline",
      "Expertise",
      "Publications",
      "Patents",
      "Judged before",
      "Judging experience",
      "Commits to all projects",
      "Knows students",
      "Known students",
      "Mentoring",
      "Mentoring details",
      "Availability",
      "Notes",
      "Admin notes",
    ];
    body = rows.map((r) => {
      const d = parseJSON<Partial<JudgeData>>(r.data, {});
      return [
        ...base(r),
        d.address,
        d.institution,
        d.department,
        d.position,
        d.yearsAtInstitution,
        d.employmentStatus,
        d.degree,
        d.degreeDate,
        d.discipline,
        d.expertise,
        d.publications,
        d.patents,
        yn(d.hasJudged),
        d.judgingExperience,
        yn(d.commitAll),
        yn(d.knowsStudents),
        d.knownStudents,
        yn(d.mentoring),
        d.mentoringDetails,
        d.availability,
        d.notes,
        r.admin_notes,
      ];
    });
  }

  const csv = [headers, ...body].map((row) => row.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${role}s-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
