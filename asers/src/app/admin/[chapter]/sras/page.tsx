import { requireChapterAdmin } from "@/lib/admin";
import RegistrationTable from "@/components/admin/RegistrationTable";

type Props = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ q?: string; status?: string; school?: string }>;
};

export default async function SrasAdminPage({ params, searchParams }: Props) {
  const { chapter: slug } = await params;
  await requireChapterAdmin(slug);
  return (
    <div className="space-y-4">
      <p className="text-sm font-light">
        Science Research Advisors sponsor students at their school. Approve each SRA after confirming they teach at
        that school; approved SRAs can then approve their own students and record payments.
      </p>
      <RegistrationTable slug={slug} role="sra" filters={await searchParams} />
    </div>
  );
}
