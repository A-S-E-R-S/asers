import { requireChapterAdmin } from "@/lib/admin";
import { updateChapterPageAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, Textarea } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function ChapterPageEditor({ params }: Props) {
  const { chapter: slug } = await params;
  const { chapter: c } = await requireChapterAdmin(slug);
  return (
    <Card title="Public chapter page">
      <p className="mb-6 text-sm font-light">
        Everything here appears on{" "}
        <a href={`/chapters/${slug}`} className="text-brand underline">
          asers.org/chapters/{slug}
        </a>
        , on registration pages, and on registrants&apos; dashboards.
      </p>
      <ActionForm action={updateChapterPageAction} className="space-y-5">
        <input type="hidden" name="chapter" value={slug} />
        <Field label="Short description" required hint="One or two sentences, shown on the chapter list and at the top of your page.">
          <Textarea name="description" rows={3} defaultValue={c.description} required maxLength={1000} />
        </Field>
        <Field label="Announcement" hint="Optional banner, e.g. &quot;Registration closes March 1!&quot; Leave blank to hide.">
          <Textarea name="announcement" rows={2} defaultValue={c.announcement} maxLength={2000} />
        </Field>
        <Field label="About the chapter" hint="Longer page text. Leave a blank line between paragraphs.">
          <Textarea name="about" rows={10} defaultValue={c.about} maxLength={20000} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Event date">
            <Input name="eventDate" type="date" defaultValue={c.eventDate ?? ""} />
          </Field>
          <Field label="Event time / format" hint="e.g. 8:30 AM - 3:30 PM, in person">
            <Input name="eventDetails" defaultValue={c.eventDetails} maxLength={200} />
          </Field>
          <Field label="Registration deadline" hint="Shown to registrants. Close registration in Settings.">
            <Input name="registrationDeadline" type="date" defaultValue={c.registrationDeadline ?? ""} />
          </Field>
          <Field label="Student entry fee" hint="e.g. $30 per student. Leave blank if free.">
            <Input name="studentFee" defaultValue={c.studentFee} maxLength={100} />
          </Field>
        </div>
        <Field label="Venue">
          <Input name="venue" defaultValue={c.venue ?? ""} maxLength={300} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Contact email">
            <Input name="email" type="email" defaultValue={c.email ?? ""} maxLength={254} />
          </Field>
          <Field label="Chapter website" hint="Optional, full URL">
            <Input name="site" type="url" defaultValue={c.site ?? ""} maxLength={300} placeholder="https://" />
          </Field>
          <Field label="Founded">
            <Input name="founded" defaultValue={c.founded ?? ""} maxLength={20} />
          </Field>
        </div>
        <SubmitButton>Save page</SubmitButton>
      </ActionForm>
    </Card>
  );
}
