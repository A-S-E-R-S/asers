import type { AuditRow } from "@/lib/admin";

export default function AuditTable({ rows, showChapter }: { rows: AuditRow[]; showChapter?: boolean }) {
  if (rows.length === 0) return <p className="text-sm font-light">No activity yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b-2 border-brand-pale text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-3 py-2">When (UTC)</th>
            <th className="px-3 py-2">Who</th>
            {showChapter && <th className="px-3 py-2">Chapter</th>}
            <th className="px-3 py-2">Action</th>
            <th className="px-3 py-2">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-b border-brand-pale align-top">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{a.created_at.slice(0, 16)}</td>
              <td className="px-3 py-2">{a.actor_name ?? "—"}</td>
              {showChapter && <td className="px-3 py-2">{a.chapter_slug ?? "—"}</td>}
              <td className="px-3 py-2 font-mono text-xs">{a.action}</td>
              <td className="px-3 py-2 text-xs font-light">{a.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
