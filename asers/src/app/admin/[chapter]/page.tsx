import Link from "next/link";
import { getChapterCounts, listRegistrations, requireChapterAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/chapters";
import { ROLE_PLURAL, type Role } from "@/lib/options";
import { Card, StatusBadge } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterOverview({ params }: Props) {
  const { chapter: slug } = await params;
  const { chapter } = await requireChapterAdmin(slug);
  const [counts, pendingSras, pendingJudges, pendingStudents] = await Promise.all([
    getChapterCounts(slug),
    listRegistrations(slug, "sra", { status: "pending" }),
    listRegistrations(slug, "judge", { status: "pending" }),
    listRegistrations(slug, "student", { status: "pending" }),
  ]);

  const roles: Role[] = ["student", "sra", "judge"];
  const listPath = (r: Role) => `/admin/${slug}/${r === "sra" ? "sras" : `${r}s`}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((r) => (
          <Link key={r} href={listPath(r)} className="border-2 border-brand-pale p-4 transition hover:border-brand">
            <p className="font-condensed text-lg uppercase tracking-tight text-brand">{ROLE_PLURAL[r]}</p>
            <p className="mt-1 text-3xl font-bold">{counts[r].approved}</p>
            <p className="text-xs font-light">
              approved · {counts[r].pending} pending · {counts[r].rejected} rejected · {counts[r].withdrawn} withdrawn
            </p>
            <p className="mt-2 text-xs font-medium">Registration {chapter.regOpen[r] ? "open" : "closed"}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <p className="border-l-4 border-brand-pale pl-3">
          <span className="font-medium">{counts.paid}</span> student fees received
        </p>
        <p className="border-l-4 border-brand-pale pl-3">
          <span className="font-medium">{counts.schools}</span> schools
        </p>
        <p className="border-l-4 border-brand-pale pl-3">
          Event: <span className="font-medium">{formatDate(chapter.eventDate) ?? "date not set"}</span>
        </p>
      </div>

      {[
        { title: "SRAs awaiting your approval", rows: pendingSras, role: "sra" as Role },
        { title: "Judges awaiting your approval", rows: pendingJudges, role: "judge" as Role },
      ].map(({ title, rows, role }) => (
        <Card key={role} title={`${title} (${rows.length})`}>
          {rows.length === 0 ? (
            <p className="text-sm font-light">Nothing waiting.</p>
          ) : (
            <ul className="divide-y divide-brand-pale text-sm">
              {rows.slice(0, 15).map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    <Link href={`/admin/${slug}/registrations/${r.id}`} className="font-medium text-brand underline">
                      {r.first_name} {r.last_name}
                    </Link>{" "}
                    <span className="font-light">
                      · {r.school_name ?? r.email} · registered {r.created_at.slice(0, 10)}
                    </span>
                  </span>
                  <StatusBadge status={r.status} />
                </li>
              ))}
              {rows.length > 15 && (
                <li className="py-2">
                  <Link href={`${listPath(role)}?status=pending`} className="text-brand underline">
                    See all {rows.length}
                  </Link>
                </li>
              )}
            </ul>
          )}
        </Card>
      ))}

      <Card title={`Students awaiting SRA approval (${pendingStudents.length})`}>
        <p className="text-sm font-light">
          Students are approved by the SRA at their school. You can also approve them yourself from the{" "}
          <Link href={`/admin/${slug}/students?status=pending`} className="text-brand underline">
            students list
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
