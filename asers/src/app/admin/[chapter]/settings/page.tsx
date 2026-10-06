import { requireChapterAdmin } from "@/lib/admin";
import { deleteChapterAction, updateChapterIdentityAction, updateRegistrationSettingsAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, DefinitionList, Field, Input, Textarea, dangerButtonClass } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

function Toggle({ name, label, hint, checked }: { name: string; label: string; hint: string; checked: boolean }) {
  return (
    <label className="flex items-start gap-3 border-2 border-brand-pale p-4">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 h-5 w-5 accent-brand" />
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-xs font-light text-ink-soft">{hint}</span>
      </span>
    </label>
  );
}

export default async function ChapterSettingsPage({ params }: Props) {
  const { chapter: slug } = await params;
  const { chapter: c, scope } = await requireChapterAdmin(slug);
  return (
    <div className="space-y-6">
      <Card title="Registration">
        <ActionForm action={updateRegistrationSettingsAction} className="space-y-5">
          <input type="hidden" name="chapter" value={slug} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle name="sraOpen" label="SRA registration open" hint="Open this first: students need an SRA at their school." checked={c.regOpen.sra} />
            <Toggle name="studentOpen" label="Student registration open" hint="While open, students can also edit their project details." checked={c.regOpen.student} />
            <Toggle name="judgeOpen" label="Judge registration open" hint="Judges sign up and you approve them." checked={c.regOpen.judge} />
          </div>
          {!c.published && (
            <p className="text-sm text-amber-800">
              This chapter is a draft, so nobody can register until a national admin publishes it.
            </p>
          )}
          <Field label="Judge availability options" hint="One per line. Judges pick one when they register. Leave empty to skip the question.">
            <Textarea name="judgeAvailability" rows={4} defaultValue={c.judgeAvailability.join("\n")} maxLength={3000} />
          </Field>
          <SubmitButton>Save registration settings</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="Chapter identity">
        {scope.national ? (
          <ActionForm action={updateChapterIdentityAction} className="space-y-5">
            <input type="hidden" name="chapter" value={slug} />
            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="State / region name" required>
                <Input name="name" defaultValue={c.name} required maxLength={80} />
              </Field>
              <Field label="Short name" required hint="e.g. NJSRS">
                <Input name="shortName" defaultValue={c.shortName} required maxLength={20} />
              </Field>
              <Field label="Subdomain" hint={`<sub>.asers.org (also add it to wrangler.jsonc routes)`}>
                <Input name="subdomain" defaultValue={c.subdomain ?? ""} maxLength={30} />
              </Field>
            </div>
            <Field label="Full name" required>
              <Input name="fullName" defaultValue={c.fullName} required maxLength={150} />
            </Field>
            <div className="flex flex-wrap items-end gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="published" defaultChecked={c.published} className="h-5 w-5 accent-brand" />
                Published (listed publicly and open for registration)
              </label>
              <Field label="Sort order" className="w-28">
                <Input name="sortOrder" type="number" defaultValue={c.sortOrder} />
              </Field>
            </div>
            <p className="text-xs font-light text-ink-soft">URL slug: /chapters/{slug} (fixed once created)</p>
            <SubmitButton>Save identity</SubmitButton>
          </ActionForm>
        ) : (
          <>
            <DefinitionList
              items={[
                ["Name", c.name],
                ["Short name", c.shortName],
                ["Full name", c.fullName],
                ["Subdomain", c.subdomain ? `${c.subdomain}.asers.org` : null],
                ["Published", c.published ? "Yes" : "No (draft)"],
              ]}
            />
            <p className="mt-4 text-xs font-light text-ink-soft">
              Ask a national admin (contact@asers.org) to change these.
            </p>
          </>
        )}
      </Card>

      {scope.national && (
        <Card title="Delete chapter">
          <p className="mb-4 text-sm font-light">
            Only possible when the chapter has no registrations. Otherwise unpublish it.
          </p>
          <ActionForm action={deleteChapterAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="chapter" value={slug} />
            <Field label={`Type "${slug}" to confirm`}>
              <Input name="confirm" autoComplete="off" />
            </Field>
            <SubmitButton className={dangerButtonClass} pendingText="Deleting...">
              Delete chapter
            </SubmitButton>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
