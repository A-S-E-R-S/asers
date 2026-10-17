import type { Chapter } from "@/lib/chapters";
import { formatDate } from "@/lib/chapters";
import { parseJSON } from "@/lib/db";
import { JUDGING_CRITERIA, listJudgeAssignments, scoreMap } from "@/lib/judging";
import type { JudgeData, RegistrationRow } from "@/lib/registrations";
import { submitJudgeScoreAction } from "@/app/actions/judging";
import { updateJudgeDetailsAction, withdrawAction } from "@/app/actions/dashboard";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Alert, Card, DefinitionList, Field, Select, Textarea, dangerButtonClass } from "@/components/ui";

export default async function JudgeDashboard({ reg, chapter }: { reg: RegistrationRow; chapter: Chapter }) {
  const d = parseJSON<Partial<JudgeData>>(reg.data, {});
  const assignments = reg.status === "approved" ? await listJudgeAssignments(reg.user_id, chapter.slug) : [];
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

      {reg.status === "approved" && (
        <Card title="Judging assignments">
          {assignments.length === 0 ? (
            <p className="text-sm font-light">No projects have been assigned yet. Your chapter will add them when the event schedule is ready.</p>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const scores = scoreMap(assignment.score_json);
                return (
                  <div key={assignment.id} className="border-2 border-brand-pale p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-condensed text-lg uppercase text-brand">{assignment.round_name} · {assignment.format}</p>
                        <h3 className="mt-1 text-xl font-bold">{assignment.project_code ?? "Project"}: {assignment.project_title}</h3>
                        <p className="mt-1 text-sm font-light">{assignment.project_category}{assignment.room ? ` · ${assignment.room}` : ""}{assignment.session_label ? ` · ${assignment.session_label}` : ""}</p>
                      </div>
                      {assignment.submitted_at && <span className="text-sm font-medium text-green-700">Submitted</span>}
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm font-light leading-relaxed">{assignment.project_description}</p>
                    <ActionForm action={submitJudgeScoreAction} className="mt-5 space-y-4">
                      <input type="hidden" name="assignmentId" value={assignment.id} />
                      <div className="grid gap-4 sm:grid-cols-2">
                        {JUDGING_CRITERIA.map(([key, label]) => (
                          <Field key={key} label={`${label} (1–5)`} required>
                            <Select name={`score_${key}`} defaultValue={scores[key]?.toString() ?? ""} required>
                              <option value="">Select score</option>
                              {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
                            </Select>
                          </Field>
                        ))}
                      </div>
                      <Field label="Feedback for the student">
                        <Textarea name="comments" rows={4} defaultValue={assignment.comments ?? ""} maxLength={5000} placeholder="Strengths, limitations, and a useful next question..." />
                      </Field>
                      <SubmitButton>Save evaluation</SubmitButton>
                    </ActionForm>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

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
