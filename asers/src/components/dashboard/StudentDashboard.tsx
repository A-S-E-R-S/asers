import type { User } from "@/lib/auth";
import type { Chapter } from "@/lib/chapters";
import { parseJSON } from "@/lib/db";
import {
  focusLabel,
  getProject,
  getSchoolSras,
  getTeammates,
  type RegistrationRow,
  type StudentData,
} from "@/lib/registrations";
import { first } from "@/lib/db";
import { resendPartnerInviteAction, updateProjectAction, withdrawAction } from "@/app/actions/dashboard";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import ProjectFields from "@/components/register/ProjectFields";
import { Alert, Card, DefinitionList, StatusBadge, dangerButtonClass, smallButtonClass } from "@/components/ui";

const statusText = {
  pending:
    "Your registration is pending approval from your Science Research Advisor. You'll get an email once it's reviewed.",
  approved: "Your registration has been approved. Watch your email and this page for next steps.",
  rejected: "Your registration was not approved. Please contact your Science Research Advisor for more information.",
  withdrawn: "You withdrew this registration. To rejoin, register again while registration is open.",
};

export default async function StudentDashboard({
  user,
  reg,
  chapter,
}: {
  user: User;
  reg: RegistrationRow;
  chapter: Chapter;
}) {
  const data = parseJSON<StudentData>(reg.data, { grade: "", shirtSize: "" });
  const [project, teammates, sras, school] = await Promise.all([
    getProject(reg.project_id),
    reg.project_id ? getTeammates(reg.project_id, user.id) : Promise.resolve([]),
    reg.school_id ? getSchoolSras(reg.school_id) : Promise.resolve([]),
    reg.school_id ? first<{ name: string; town: string }>("SELECT name, town FROM schools WHERE id = ?", reg.school_id) : null,
  ]);
  const active = reg.status !== "withdrawn" && reg.status !== "rejected";
  const editable = active && chapter.regOpen.student;
  const approvedSras = sras.filter((s) => s.status === "approved");

  return (
    <>
      <Alert tone={reg.status === "approved" ? "success" : reg.status === "pending" ? "warning" : "error"}>
        {statusText[reg.status]}
      </Alert>

      <Card title="Registration">
        <DefinitionList
          items={[
            ["Name", `${user.firstName} ${user.lastName}`],
            ["Email", user.email],
            ["School", school ? `${school.name}${school.town ? ` (${school.town})` : ""}` : null],
            ["Grade", data.grade ? `${data.grade}th` : null],
            ["Shirt size", data.shirtSize],
            ["Project ID", project?.projectCode ?? "Assigned later"],
            ["Entry fee", chapter.studentFee ? `${chapter.studentFee} · ${reg.payment_received ? "Received" : "Not received yet"}` : reg.payment_received ? "Received" : null],
            [
              "Science Research Advisor",
              (approvedSras.length ? approvedSras : sras).map((s) => (
                <span key={s.registration_id} className="block">
                  {s.first_name} {s.last_name}
                  {s.title ? `, ${s.title}` : ""} ·{" "}
                  <a className="text-brand underline" href={`mailto:${s.email}`}>
                    {s.email}
                  </a>
                </span>
              )),
            ],
          ]}
        />
      </Card>

      {teammates.length > 0 && (
        <Card title="Team partner">
          {teammates.map((t) => (
            <div key={t.user_id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-medium">
                  {t.first_name} {t.last_name}
                </span>{" "}
                · {t.email} <StatusBadge status={t.status} />
                {!t.has_password && (
                  <span className="mt-1 block text-xs font-light text-ink-soft">
                    Hasn&apos;t set up their account yet.
                  </span>
                )}
              </span>
              {!t.has_password && (
                <ActionForm action={resendPartnerInviteAction} className="space-y-2">
                  <input type="hidden" name="chapter" value={chapter.slug} />
                  <input type="hidden" name="partnerId" value={t.user_id} />
                  <SubmitButton className={smallButtonClass} pendingText="Sending...">
                    Resend invite
                  </SubmitButton>
                </ActionForm>
              )}
            </div>
          ))}
        </Card>
      )}

      {project && (
        <Card title="Project">
          {editable ? (
            <ActionForm action={updateProjectAction} className="space-y-6">
              <input type="hidden" name="chapter" value={chapter.slug} />
              <ProjectFields defaults={project} />
              <SubmitButton>Save project</SubmitButton>
              {project.isTeam && (
                <p className="text-xs font-light text-ink-soft">Changes apply to your whole team.</p>
              )}
            </ActionForm>
          ) : (
            <>
              <DefinitionList
                items={[
                  ["Title", project.title],
                  ["Description", <span key="d" className="whitespace-pre-line">{project.description}</span>],
                  ["Domains", project.domains.join("; ")],
                  ["Methodology", project.methods.join("; ")],
                  ["Real-world focus", focusLabel(project)],
                ]}
              />
              {active && (
                <p className="mt-4 text-xs font-light text-ink-soft">
                  Registration is closed, so project details are locked. Contact the chapter for changes.
                </p>
              )}
            </>
          )}
        </Card>
      )}

      {active && (
        <Card title="Withdraw">
          <p className="mb-4 text-sm font-light">
            Can&apos;t attend? Withdrawing lets your advisor and the chapter know. Your partner&apos;s registration is
            not affected.
          </p>
          <ActionForm action={withdrawAction}>
            <input type="hidden" name="chapter" value={chapter.slug} />
            <SubmitButton
              className={dangerButtonClass}
              pendingText="Withdrawing..."
              confirm="Withdraw your registration? You can register again later while registration is open."
            >
              Withdraw registration
            </SubmitButton>
          </ActionForm>
        </Card>
      )}
    </>
  );
}
