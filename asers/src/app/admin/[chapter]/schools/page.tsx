import Link from "next/link";
import { listSchools, requireChapterAdmin } from "@/lib/admin";
import { addSchoolAction, deleteSchoolAction, mergeSchoolAction, updateSchoolAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import InlineAction from "@/components/InlineAction";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, Select, dangerButtonClass, secondaryButtonClass, smallButtonClass } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function SchoolsAdminPage({ params }: Props) {
  const { chapter: slug } = await params;
  await requireChapterAdmin(slug);
  const schools = await listSchools(slug);

  return (
    <div className="space-y-6">
      <p className="text-sm font-light">
        SRAs add their school when they register. Students can only pick schools that have an active SRA. If two
        entries are the same school, merge them.
      </p>
      <div className="overflow-x-auto border-t-2 border-brand">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b-2 border-brand-pale text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-3 py-2">School</th>
              <th className="px-3 py-2">SRAs</th>
              <th className="px-3 py-2">Students</th>
              <th className="px-3 py-2">Manage</th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center font-light">
                  No schools yet.
                </td>
              </tr>
            )}
            {schools.map((s) => (
              <tr key={s.id} className="border-b border-brand-pale align-top">
                <td className="px-3 py-3">
                  <span className="font-medium">{s.name}</span>
                  {s.town && <span className="block text-xs font-light">{s.town}</span>}
                  {s.sras === 0 && <span className="block text-xs text-amber-700">No active SRA: students can&apos;t select it</span>}
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/${slug}/sras?school=${s.id}`} className="text-brand underline">
                    {s.approved_sras} approved
                  </Link>
                  {s.sras > s.approved_sras && <span className="block text-xs">{s.sras - s.approved_sras} pending</span>}
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/${slug}/students?school=${s.id}`} className="text-brand underline">
                    {s.students} registered
                  </Link>
                  <span className="block text-xs">{s.approved_students} approved</span>
                </td>
                <td className="px-3 py-3">
                  <details>
                    <summary className="cursor-pointer text-brand">Edit / merge</summary>
                    <div className="mt-3 space-y-4">
                      <ActionForm action={updateSchoolAction} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="chapter" value={slug} />
                        <input type="hidden" name="id" value={s.id} />
                        <Input name="name" defaultValue={s.name} required maxLength={150} className="mt-0 w-56" />
                        <Input name="town" defaultValue={s.town} maxLength={80} className="mt-0 w-32" placeholder="Town" />
                        <SubmitButton className={smallButtonClass}>Save</SubmitButton>
                      </ActionForm>
                      {schools.length > 1 && (
                        <ActionForm action={mergeSchoolAction} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="chapter" value={slug} />
                          <input type="hidden" name="id" value={s.id} />
                          <Select name="into" defaultValue="" className="mt-0 w-56" required>
                            <option value="">Merge into...</option>
                            {schools
                              .filter((o) => o.id !== s.id)
                              .map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))}
                          </Select>
                          <SubmitButton className={smallButtonClass} confirm={`Move everyone from ${s.name} and delete it?`}>
                            Merge
                          </SubmitButton>
                        </ActionForm>
                      )}
                      {s.sras === 0 && s.students === 0 && (
                        <InlineAction
                          action={deleteSchoolAction}
                          fields={{ chapter: slug, id: s.id }}
                          label="Delete"
                          className={dangerButtonClass}
                          confirm={`Delete ${s.name}?`}
                        />
                      )}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card title="Add a school">
        <ActionForm action={addSchoolAction} className="flex flex-wrap items-end gap-3" resetOnSuccess>
          <input type="hidden" name="chapter" value={slug} />
          <Field label="Name" required className="min-w-[240px] flex-1">
            <Input name="name" required maxLength={150} />
          </Field>
          <Field label="Town">
            <Input name="town" maxLength={80} />
          </Field>
          <SubmitButton className={secondaryButtonClass}>Add</SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
