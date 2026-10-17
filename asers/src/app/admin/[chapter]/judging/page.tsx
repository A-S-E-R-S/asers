import { requireChapterAdmin } from "@/lib/admin";
import { listApprovedJudges, listApprovedProjects, listJudgingRounds, listRoundAssignments } from "@/lib/judging";
import { createJudgeAssignmentAction, createJudgingRoundAction } from "@/app/actions/judging";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, Select } from "@/components/ui";

type Props = { params: Promise<{ chapter: string }> };

export default async function JudgingAdminPage({ params }: Props) {
  const { chapter: slug } = await params;
  await requireChapterAdmin(slug);
  const [rounds, judges, projects] = await Promise.all([
    listJudgingRounds(slug),
    listApprovedJudges(slug),
    listApprovedProjects(slug),
  ]);
  const assignmentsByRound = await Promise.all(rounds.map(async (round) => [round.id, await listRoundAssignments(slug, round.id)] as const));

  return (
    <div className="space-y-6">
      <Card title="Create a judging round">
        <p className="text-sm font-light">Create a live oral, poster, or final round before assigning judges to projects.</p>
        <ActionForm action={createJudgingRoundAction} className="mt-5 grid gap-4 sm:grid-cols-[2fr_1fr_auto]" resetOnSuccess>
          <input type="hidden" name="chapter" value={slug} />
          <Field label="Round name" required>
            <Input name="name" required placeholder="Oral judging — morning session" />
          </Field>
          <Field label="Format" required>
            <Select name="format" defaultValue="oral" required>
              <option value="oral">Oral</option>
              <option value="poster">Poster</option>
              <option value="final">Final round</option>
            </Select>
          </Field>
          <div className="self-end"><SubmitButton>Create round</SubmitButton></div>
        </ActionForm>
      </Card>

      <Card title="Assign judges to projects">
        {rounds.length === 0 ? (
          <p className="text-sm font-light">Create a round first.</p>
        ) : judges.length === 0 || projects.length === 0 ? (
          <p className="text-sm font-light">You need at least one approved judge and one approved student project.</p>
        ) : (
          <ActionForm action={createJudgeAssignmentAction} className="grid gap-4 sm:grid-cols-2" resetOnSuccess>
            <input type="hidden" name="chapter" value={slug} />
            <Field label="Round" required>
              <Select name="roundId" required>
                {rounds.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.format}</option>)}
              </Select>
            </Field>
            <Field label="Judge" required>
              <Select name="judgeId" required>
                {judges.map((j) => <option key={j.id} value={j.id}>{j.name} · {j.institution}</option>)}
              </Select>
            </Field>
            <Field label="Project" required>
              <Select name="projectId" required>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.code ?? "Unassigned"} · {p.title} {p.category ? `· ${p.category}` : ""}</option>)}
              </Select>
            </Field>
            <Field label="Room">
              <Input name="room" placeholder="Room 201" maxLength={100} />
            </Field>
            <Field label="Session">
              <Input name="session" placeholder="10:00 AM" maxLength={100} />
            </Field>
            <Field label="Order">
              <Input name="order" type="number" min="0" defaultValue="0" />
            </Field>
            <div className="sm:col-span-2"><SubmitButton>Assign project</SubmitButton></div>
          </ActionForm>
        )}
      </Card>

      <Card title="Rounds">
        {rounds.length === 0 ? <p className="text-sm font-light">No rounds yet.</p> : (
          <ul className="divide-y-2 divide-brand-pale">
            {rounds.map((r) => {
              const assignments = assignmentsByRound.find(([id]) => id === r.id)?.[1] ?? [];
              return (
                <li key={r.id} className="py-3">
                  <div className="flex flex-wrap justify-between gap-3"><span className="font-medium">{r.name}</span><span className="text-sm font-light uppercase">{r.format} · {assignments.length} assignments</span></div>
                  {assignments.length > 0 && (
                    <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-brand-pale text-xs uppercase text-ink-soft"><tr><th className="px-2 py-2">Project</th><th className="px-2 py-2">Judge</th><th className="px-2 py-2">Schedule</th><th className="px-2 py-2">Evaluation</th></tr></thead><tbody>{assignments.map((a) => <tr key={a.id} className="border-b border-brand-pale"><td className="px-2 py-2">{a.project_code ?? "Project"} · {a.project_title}</td><td className="px-2 py-2">{a.judge_name}</td><td className="px-2 py-2">{[a.room, a.session_label].filter(Boolean).join(" · ") || "Not scheduled"}</td><td className="px-2 py-2">{a.submitted_at ? <span className="text-green-700">Submitted</span> : "Pending"}</td></tr>)}</tbody></table></div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
