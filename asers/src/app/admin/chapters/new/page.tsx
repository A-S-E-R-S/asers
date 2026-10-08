import { requireNationalAdmin } from "@/lib/admin";
import { createChapterAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input } from "@/components/ui";

export default async function NewChapterPage() {
  await requireNationalAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-[-0.015em]">New chapter</h1>
      <Card>
        <p className="mb-6 text-sm font-light">
          New chapters start as unpublished drafts. Fill in the page, add chapter admins, then publish it from the
          chapter&apos;s Settings tab. For the subdomain to work, also add{" "}
          <code className="bg-strip px-1">{"{ \"pattern\": \"<sub>.asers.org\", \"custom_domain\": true }"}</code> to the
          routes in wrangler.jsonc and redeploy.
        </p>
        <ActionForm action={createChapterAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="State / region name" required hint="e.g. New York">
              <Input name="name" required maxLength={80} />
            </Field>
            <Field label="Short name" required hint="e.g. NYSRS">
              <Input name="shortName" required maxLength={20} />
            </Field>
          </div>
          <Field label="Full name" required hint="e.g. New York Science Research Symposium">
            <Input name="fullName" required maxLength={150} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="URL slug" required hint="asers.org/chapters/<slug>, e.g. new-york. Can't be changed later.">
              <Input name="slug" required maxLength={60} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </Field>
            <Field label="Subdomain" hint="e.g. ny for ny.asers.org">
              <Input name="subdomain" maxLength={30} pattern="[a-z0-9]+(-[a-z0-9]+)*" />
            </Field>
          </div>
          <SubmitButton pendingText="Creating...">Create chapter</SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
