import Link from "next/link";
import { listRegistrations, type AdminListRow, type ListFilters } from "@/lib/admin";
import { getSchools, type JudgeData, type SraData, type StudentData } from "@/lib/registrations";
import { parseJSON } from "@/lib/db";
import { ROLE_PLURAL, STATUSES, type Role } from "@/lib/options";
import { setPaymentAction, setRegistrationStatusAction } from "@/app/actions/admin";
import InlineAction from "@/components/InlineAction";
import { StatusBadge, dangerButtonClass, inputClass, secondaryButtonClass, smallButtonClass } from "@/components/ui";

function QuickStatus({ slug, row }: { slug: string; row: AdminListRow }) {
  const base = { chapter: slug, id: row.id };
  return (
    <div className="flex flex-wrap gap-1">
      {row.status !== "approved" && row.status !== "withdrawn" && (
        <InlineAction action={setRegistrationStatusAction} fields={{ ...base, status: "approved" }} label="Approve" />
      )}
      {row.status === "pending" && (
        <InlineAction
          action={setRegistrationStatusAction}
          fields={{ ...base, status: "rejected" }}
          label="Reject"
          className={dangerButtonClass}
          confirm={`Reject ${row.first_name} ${row.last_name}? They'll get an email.`}
        />
      )}
    </div>
  );
}

function Name({ slug, row }: { slug: string; row: AdminListRow }) {
  return (
    <>
      <Link href={`/admin/${slug}/registrations/${row.id}`} className="font-medium text-brand underline">
        {row.last_name}, {row.first_name}
      </Link>
      <span className="block break-all text-xs font-light">{row.email}</span>
      {!row.email_verified_at && <span className="block text-xs text-amber-700">Email unverified</span>}
    </>
  );
}

export default async function RegistrationTable({
  slug,
  role,
  filters,
}: {
  slug: string;
  role: Role;
  filters: ListFilters;
}) {
  const [rows, schools] = await Promise.all([
    listRegistrations(slug, role, filters),
    role === "judge" ? Promise.resolve([]) : getSchools(slug),
  ]);
  const sraStudentCounts = new Map<string, number>();
  if (role === "sra") {
    const students = await listRegistrations(slug, "student", { status: "active" });
    for (const s of students) if (s.school_id) sraStudentCounts.set(s.school_id, (sraStudentCounts.get(s.school_id) ?? 0) + 1);
  }
  const qs = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][]
  ).toString();
  const th = "px-3 py-2";
  const td = "px-3 py-3 align-top";

  return (
    <div>
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="text-xs font-medium">
          Search
          <input name="q" defaultValue={filters.q} placeholder="Name, email, school, project..." className={`${inputClass} mt-1 w-64`} />
        </label>
        <label className="text-xs font-medium">
          Status
          <select name="status" defaultValue={filters.status ?? "all"} className={`${inputClass} mt-1`}>
            <option value="all">All</option>
            <option value="active">All except withdrawn</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>
        {role !== "judge" && (
          <label className="text-xs font-medium">
            School
            <select name="school" defaultValue={filters.school ?? ""} className={`${inputClass} mt-1 max-w-[16rem]`}>
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className={secondaryButtonClass}>
          Filter
        </button>
        <a href={`/admin/${slug}/export/${role}${qs ? `?${qs}` : ""}`} className={`${smallButtonClass} ml-auto`}>
          Export CSV
        </a>
      </form>

      <p className="mt-4 text-sm font-light">
        {rows.length} {ROLE_PLURAL[role].toLowerCase()}
      </p>

      <div className="mt-2 overflow-x-auto border-t-2 border-brand">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b-2 border-brand-pale text-xs uppercase tracking-wide text-ink-soft">
            {role === "student" && (
              <tr>
                <th className={th}>Student</th>
                <th className={th}>School</th>
                <th className={th}>Grade</th>
                <th className={th}>Project</th>
                <th className={th}>Status</th>
                <th className={th}>Fee</th>
                <th className={th}>Actions</th>
              </tr>
            )}
            {role === "sra" && (
              <tr>
                <th className={th}>SRA</th>
                <th className={th}>School</th>
                <th className={th}>Title</th>
                <th className={th}>Phone</th>
                <th className={th}>Students</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            )}
            {role === "judge" && (
              <tr>
                <th className={th}>Judge</th>
                <th className={th}>Institution</th>
                <th className={th}>Expertise</th>
                <th className={th}>Availability</th>
                <th className={th}>Conflicts</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            )}
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center font-light">
                  No matches.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              if (role === "student") {
                const d = parseJSON<StudentData>(row.data, { grade: "", shirtSize: "" });
                return (
                  <tr key={row.id} className="border-b border-brand-pale">
                    <td className={td}>
                      <Name slug={slug} row={row} />
                    </td>
                    <td className={td}>{row.school_name}</td>
                    <td className={td}>{d.grade}</td>
                    <td className={`${td} max-w-xs`}>
                      {row.project_code && <span className="mr-1 font-mono text-xs font-medium">{row.project_code}</span>}
                      <span className="font-light">{row.project_title}</span>
                      {row.is_team ? <span className="block text-xs text-ink-soft">Team project</span> : null}
                    </td>
                    <td className={td}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className={td}>
                      <InlineAction
                        action={setPaymentAction}
                        fields={{ chapter: slug, id: row.id, paid: row.payment_received ? "0" : "1" }}
                        label={row.payment_received ? "✓ Paid" : "Unpaid"}
                        className={
                          row.payment_received
                            ? "inline-flex border-2 border-green-700 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800"
                            : "inline-flex border-2 border-brand-pale px-2 py-0.5 text-xs font-medium text-ink-soft hover:border-brand"
                        }
                      />
                    </td>
                    <td className={td}>
                      <QuickStatus slug={slug} row={row} />
                    </td>
                  </tr>
                );
              }
              if (role === "sra") {
                const d = parseJSON<SraData>(row.data, { title: "" });
                return (
                  <tr key={row.id} className="border-b border-brand-pale">
                    <td className={td}>
                      <Name slug={slug} row={row} />
                    </td>
                    <td className={td}>
                      {row.school_name}
                      {row.school_town && <span className="block text-xs font-light">{row.school_town}</span>}
                    </td>
                    <td className={td}>{d.title}</td>
                    <td className={td}>{row.phone}</td>
                    <td className={td}>
                      {row.school_id ? (
                        <Link href={`/admin/${slug}/students?school=${row.school_id}`} className="text-brand underline">
                          {sraStudentCounts.get(row.school_id) ?? 0}
                        </Link>
                      ) : (
                        0
                      )}
                    </td>
                    <td className={td}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className={td}>
                      <QuickStatus slug={slug} row={row} />
                    </td>
                  </tr>
                );
              }
              const d = parseJSON<Partial<JudgeData>>(row.data, {});
              const conflict = d.knowsStudents || d.mentoring;
              return (
                <tr key={row.id} className="border-b border-brand-pale">
                  <td className={td}>
                    <Name slug={slug} row={row} />
                  </td>
                  <td className={td}>
                    {d.institution}
                    <span className="block text-xs font-light">{[d.position, d.degree].filter(Boolean).join(" · ")}</span>
                  </td>
                  <td className={`${td} max-w-xs`}>
                    <span className="line-clamp-3 font-light">{d.expertise}</span>
                  </td>
                  <td className={`${td} text-xs`}>{d.availability}</td>
                  <td className={td}>
                    {conflict ? <span className="bg-amber-100 px-1.5 text-xs font-medium text-amber-900">Yes</span> : "—"}
                  </td>
                  <td className={td}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td className={td}>
                    <QuickStatus slug={slug} row={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
