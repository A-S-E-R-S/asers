import { listChapterAdmins, requireChapterAdmin } from "@/lib/admin";
import { addChapterAdminAction, removeChapterAdminAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import InlineAction from "@/components/InlineAction";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, dangerButtonClass, secondaryButtonClass } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterAdminsPage({ params }: Props) {
  const { chapter: slug } = await params;
  const { chapter, scope } = await requireChapterAdmin(slug);
  const admins = await listChapterAdmins(slug);

  return (
    <div className="space-y-6">
      <Card title={`${chapter.shortName} admins`}>
        <p className="mb-4 text-sm font-light">
          Chapter admins can review registrations, edit the chapter page and change registration settings for{" "}
          {chapter.shortName} only. National admins can manage every chapter.
        </p>
        {admins.length === 0 ? (
          <p className="text-sm font-light">No chapter admins yet.</p>
        ) : (
          <ul className="divide-y divide-brand-pale text-sm">
            {admins.map((a) => (
              <li key={a.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="font-medium">
                    {a.first_name} {a.last_name}
                  </span>{" "}
                  · {a.email}
                  {!a.has_password && <span className="block text-xs text-amber-700">Invited; hasn&apos;t set a password yet</span>}
                </span>
                {scope.national && (
                  <InlineAction
                    action={removeChapterAdminAction}
                    fields={{ chapter: slug, userId: a.user_id }}
                    label="Remove"
                    className={dangerButtonClass}
                    confirm={`Remove ${a.first_name} ${a.last_name} as a ${chapter.shortName} admin?`}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {scope.national ? (
        <Card title="Add an admin">
          <ActionForm action={addChapterAdminAction} className="space-y-4" resetOnSuccess>
            <input type="hidden" name="chapter" value={slug} />
            <Field label="Email" required hint="If they don't have an account yet, fill in their name and we'll email them a link to set a password.">
              <Input name="email" type="email" required maxLength={254} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name">
                <Input name="firstName" maxLength={80} />
              </Field>
              <Field label="Last name">
                <Input name="lastName" maxLength={80} />
              </Field>
            </div>
            <SubmitButton className={secondaryButtonClass} pendingText="Adding...">
              Add admin
            </SubmitButton>
          </ActionForm>
        </Card>
      ) : (
        <p className="text-sm font-light">To add or remove admins, contact a national admin at contact@asers.org.</p>
      )}
    </div>
  );
}
