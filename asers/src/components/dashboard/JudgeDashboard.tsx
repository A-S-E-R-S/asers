import type { Chapter } from "@/lib/chapters";
import { formatDate } from "@/lib/chapters";
import { parseJSON } from "@/lib/db";
import type { JudgeData, RegistrationRow } from "@/lib/registrations";
import { updateJudgeDetailsAction, withdrawAction } from "@/app/actions/dashboard";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Alert, Card, DefinitionList, Field, Select, Textarea, dangerButtonClass } from "@/components/ui";

export default function JudgeDashboard({ reg, chapter }: { reg: RegistrationRow; chapter: Chapter }) {
  const d = parseJSON<Partial<JudgeData>>(reg.data, {});
  const active = reg.status !== "withdrawn" && reg.status !== "rejected";
  const options = chapter.judgeAvailability.includes(d.availability ?? "")
    ? chapter.judgeAvailability
    : [...chapter.judgeAvailability, ...(d.availability ? [d.availability] : [])];

  return (
    <>
      {reg.status === "pending" && (
        <Alert tone="warning">
          <strong className="font-medium">Thanks for volunteering!</strong> A {chapter.shortName} admin will review your
          registration and email you once you&apos;re approved.
        </Alert>
      )}
      {reg.status === "approved" && (
        <Alert tone="success">
          You&apos;re approved to judge at {chapter.shortName}
          {chapter.eventDate ? ` on ${formatDate(chapter.eventDate)}` : ""}. We&apos;ll email project assignments and
          logistics before the event.
        </Alert>
      )}
      {reg.status === "rejected" && <Alert tone="error">Your judge registration was not approved this year.</Alert>}
      {reg.status === "withdrawn" && <Alert tone="info">You withdrew this registration.</Alert>}

      <Card title="Your application">
        <DefinitionList
          items={[
            ["Institution", [d.institution, d.department].filter(Boolean).join(", ")],
            ["Position", d.position],
            ["Highest degree", [d.degree, d.discipline, d.degreeDate].filter(Boolean).join(", ")],
            ["Expertise", <span key="e" className="whitespace-pre-line">{d.expertise}</span>],
            ["Judged before", d.hasJudged ? "Yes" : "No"],
          ]}
        />
        <p className="mt-4 text-xs font-light text-ink-soft">
          Need to change something else? Email {chapter.email ?? "the chapter"}.
        </p>
      </Card>

      {active && (
        <Card title="Availability & conflicts">
          <ActionForm action={updateJudgeDetailsAction} className="space-y-5">
            <input type="hidden" name="chapter" value={chapter.slug} />
            {options.length > 0 && (
              <Field label={`Availability${chapter.eventDate ? ` on ${formatDate(chapter.eventDate)}` : ""}`}>
                <Select name="availability" defaultValue={d.availability}>
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Field>
            )}
            <Field label="Do you know any students who may compete?">
              <Select name="knowsStudents" defaultValue={d.knowsStudents ? "yes" : "no"}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </Field>
            <Field label="If yes, who?">
              <Textarea name="knownStudents" rows={2} defaultValue={d.knownStudents} maxLength={2000} />
            </Field>
            <Field label="Are you mentoring any students this year?">
              <Select name="mentoring" defaultValue={d.mentoring ? "yes" : "no"}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </Field>
            <Field label="Mentoring details">
              <Textarea name="mentoringDetails" rows={2} defaultValue={d.mentoringDetails} maxLength={2000} />
            </Field>
            <Field label="Notes for the organizers">
              <Textarea name="notes" rows={2} defaultValue={d.notes} maxLength={2000} />
            </Field>
            <SubmitButton>Save changes</SubmitButton>
          </ActionForm>
        </Card>
      )}

      {active && (
        <Card title="Withdraw">
          <ActionForm action={withdrawAction}>
            <input type="hidden" name="chapter" value={chapter.slug} />
            <SubmitButton
              className={dangerButtonClass}
              pendingText="Withdrawing..."
              confirm="Withdraw as a judge? You can register again later while registration is open."
            >
              Withdraw as judge
            </SubmitButton>
          </ActionForm>
        </Card>
      )}
    </>
  );
}
