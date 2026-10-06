import { listAudit, requireChapterAdmin } from "@/lib/admin";
import AuditTable from "@/components/admin/AuditTable";

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterActivityPage({ params }: Props) {
  const { chapter: slug } = await params;
  await requireChapterAdmin(slug);
  return (
    <div>
      <p className="mb-4 text-sm font-light">The latest 200 admin and SRA actions in this chapter.</p>
      <AuditTable rows={await listAudit(slug)} />
    </div>
  );
}
