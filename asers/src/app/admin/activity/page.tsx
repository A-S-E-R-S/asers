import { listAudit, requireNationalAdmin } from "@/lib/admin";
import AuditTable from "@/components/admin/AuditTable";

export default async function ActivityPage() {
  await requireNationalAdmin();
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-[-0.015em]">Activity log</h1>
      <p className="mb-6 mt-2 text-sm font-light">The latest 500 actions across all chapters.</p>
      <AuditTable rows={await listAudit(null, 500)} showChapter />
    </div>
  );
}
