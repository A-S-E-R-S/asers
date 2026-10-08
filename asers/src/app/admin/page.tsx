import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin, getChapterCounts } from "@/lib/admin";
import { getAllChapters } from "@/lib/chapters";

export default async function AdminHome() {
  const { scope } = await requireAdmin();
  const chapters = (await getAllChapters()).filter((c) => scope.national || scope.chapters.includes(c.slug));
  if (!scope.national && chapters.length === 1) redirect(`/admin/${chapters[0].slug}`);
  const counts = await Promise.all(chapters.map((c) => getChapterCounts(c.slug)));

  const total = (k: "student" | "sra" | "judge", s: "pending" | "approved") => counts.reduce((n, c) => n + c[k][s], 0);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.015em]">Admin overview</h1>
      <p className="mt-2 font-light">
        {scope.national ? "All chapters." : "Chapters you manage."} Click a chapter to review registrations and edit
        its page.
      </p>

      {scope.national && chapters.length > 1 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {(["student", "sra", "judge"] as const).map((k) => (
            <div key={k} className="border-2 border-brand-pale p-4">
              <p className="font-condensed text-lg uppercase tracking-tight text-brand">
                {k === "sra" ? "SRAs" : `${k}s`} (all chapters)
              </p>
              <p className="mt-1 text-2xl font-bold">{total(k, "approved")}</p>
              <p className="text-xs font-light">approved · {total(k, "pending")} pending</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b-2 border-brand text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="py-2 pr-3">Chapter</th>
              <th className="px-3 py-2">Registration</th>
              <th className="px-3 py-2">Students</th>
              <th className="px-3 py-2">SRAs</th>
              <th className="px-3 py-2">Judges</th>
              <th className="px-3 py-2">Schools</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((c, i) => {
              const n = counts[i];
              const cell = (k: "student" | "sra" | "judge") => (
                <>
                  <span className="font-medium">{n[k].approved}</span> approved
                  {n[k].pending > 0 && (
                    <span className="ml-1 bg-amber-100 px-1.5 text-xs font-medium text-amber-900">{n[k].pending} pending</span>
                  )}
                </>
              );
              return (
                <tr key={c.slug} className="border-b border-brand-pale">
                  <td className="py-3 pr-3">
                    <Link href={`/admin/${c.slug}`} className="font-medium text-brand underline">
                      {c.shortName}
                    </Link>
                    <span className="block text-xs font-light">
                      {c.name}
                      {!c.published && " · draft"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {(["student", "sra", "judge"] as const)
                      .filter((r) => c.regOpen[r])
                      .map((r) => (r === "sra" ? "SRA" : r))
                      .join(", ") || "closed"}
                  </td>
                  <td className="px-3 py-3">{cell("student")}</td>
                  <td className="px-3 py-3">{cell("sra")}</td>
                  <td className="px-3 py-3">{cell("judge")}</td>
                  <td className="px-3 py-3">{n.schools}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {scope.national && (
        <Link href="/admin/chapters/new" className="mt-6 inline-block font-medium text-brand underline">
          + Create a chapter
        </Link>
      )}
    </div>
  );
}
