import { requireChapterAdmin } from "@/lib/admin";
import { assignProjectCodesAction } from "@/app/actions/admin";
import RegistrationTable from "@/components/admin/RegistrationTable";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Input, smallButtonClass } from "@/components/ui";

type Props = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ q?: string; status?: string; school?: string }>;
};

export default async function StudentsAdminPage({ params, searchParams }: Props) {
  const { chapter: slug } = await params;
  const { chapter } = await requireChapterAdmin(slug);
  const filters = await searchParams;
  return (
    <div className="space-y-8">
      <RegistrationTable slug={slug} role="student" filters={filters} />
      <details className="border-2 border-brand-pale p-4 text-sm">
        <summary className="cursor-pointer font-medium text-brand">Assign project IDs</summary>
        <p className="mt-3 font-light">
          Gives every project with an approved student a sequential ID (for example {chapter.shortName.slice(0, 2).toUpperCase()}-001).
          Projects that already have an ID keep it. You can also set IDs one at a time on each student&apos;s page.
        </p>
        <ActionForm action={assignProjectCodesAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="chapter" value={slug} />
          <label className="text-xs font-medium">
            Prefix
            <Input name="prefix" defaultValue={chapter.shortName.slice(0, 2).toUpperCase()} maxLength={10} className="mt-1 w-28" />
          </label>
          <SubmitButton className={smallButtonClass} pendingText="Assigning...">
            Assign IDs
          </SubmitButton>
        </ActionForm>
      </details>
    </div>
  );
}
