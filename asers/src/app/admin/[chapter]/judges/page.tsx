import { requireChapterAdmin } from "@/lib/admin";
import { addJudgeAction } from "@/app/actions/admin";
import RegistrationTable from "@/components/admin/RegistrationTable";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Field, Input, secondaryButtonClass } from "@/components/ui";

type Props = {
  params: Promise<{ chapter: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
};

export default async function JudgesAdminPage({ params, searchParams }: Props) {
  const { chapter: slug } = await params;
  await requireChapterAdmin(slug);
  return (
    <div className="space-y-8">
      <RegistrationTable slug={slug} role="judge" filters={await searchParams} />
      <details className="border-2 border-brand-pale p-4">
        <summary className="cursor-pointer text-sm font-medium text-brand">Add a judge manually</summary>
        <p className="mt-3 text-sm font-light">
          For judges who signed up by email or in person. They&apos;re added as approved; new accounts get an email to
          set a password. Judges who register through the form give much more detail, so prefer sending them the
          link when you can.
        </p>
        <ActionForm action={addJudgeAction} className="mt-4 space-y-4" resetOnSuccess>
          <input type="hidden" name="chapter" value={slug} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="First name" required>
              <Input name="firstName" required maxLength={80} />
            </Field>
            <Field label="Last name" required>
              <Input name="lastName" required maxLength={80} />
            </Field>
            <Field label="Email" required>
              <Input name="email" type="email" required maxLength={254} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Institution">
              <Input name="institution" maxLength={200} />
            </Field>
            <Field label="Expertise">
              <Input name="expertise" maxLength={500} />
            </Field>
          </div>
          <SubmitButton className={secondaryButtonClass} pendingText="Adding...">
            Add judge
          </SubmitButton>
        </ActionForm>
      </details>
    </div>
  );
}
