import Link from "next/link";
import { notFound } from "next/navigation";
import { getRegistrationForAdmin, requireChapterAdmin } from "@/lib/admin";
import { all, parseJSON } from "@/lib/db";
import {
  focusLabel,
  getSchools,
  getSchoolSras,
  getStudentsAtSchool,
  getTeammates,
  toProject,
  type JudgeData,
  type ProjectRow,
  type SraData,
  type StudentData,
} from "@/lib/registrations";
import { ROLE_LABELS, STATUSES } from "@/lib/options";
import {
  changeSchoolAction,
  deleteRegistrationAction,
  markVerifiedAction,
  sendPasswordLinkAction,
  setPaymentAction,
  setProjectCodeAction,
  setRegistrationStatusAction,
  updateAdminNotesAction,
} from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import {
  Card,
  DefinitionList,
  Input,
  Select,
  StatusBadge,
  Textarea,
  dangerButtonClass,
  secondaryButtonClass,
  smallButtonClass,
} from "@/components/ui";

type Props = { params: Promise<{ chapter: string; id: string }> };

const yesNo = (v: boolean | undefined) => (v === undefined ? null : v ? "Yes" : "No");
const pre = (s: string | undefined) => (s ? <span className="whitespace-pre-line">{s}</span> : null);

export default async function RegistrationDetailPage({ params }: Props) {
  const { chapter: slug, id } = await params;
  const { chapter } = await requireChapterAdmin(slug);
  const r = await getRegistrationForAdmin(slug, id);
  if (!r) notFound();

  const otherChapters = await all<{ chapter_slug: string; role: string; status: string }>(
    "SELECT chapter_slug, role, status FROM registrations WHERE user_id = ? AND chapter_slug != ?",
    r.user_id,
    slug
  );
  const schools = r.role === "judge" ? [] : await getSchools(slug);
  const base = { chapter: slug, id: r.id };
  const listHref = `/admin/${slug}/${r.role === "sra" ? "sras" : `${r.role}s`}`;

  let details: React.ReactNode = null;
  if (r.role === "student") {
    const d = parseJSON<StudentData>(r.data, { grade: "", shirtSize: "" });
    const project = r.project_id
      ? toProject({
          id: r.project_id,
          title: r.project_title ?? "",
          description: r.project_description ?? "",
          domains: r.project_domains ?? "[]",
          methods: r.project_methods ?? "[]",
          focus: r.project_focus ?? "",
          focus_other: r.project_focus_other ?? "",
          is_team: r.is_team ?? 0,
          project_code: r.project_code,
        } as ProjectRow)
      : null;
    const [teammates, sras] = await Promise.all([
      r.project_id ? getTeammates(r.project_id, r.user_id) : Promise.resolve([]),
      r.school_id ? getSchoolSras(r.school_id) : Promise.resolve([]),
    ]);
    details = (
      <>
        <Card title="Student">
          <DefinitionList
            items={[
              ["Grade", d.grade],
              ["Shirt size", d.shirtSize],
              ["School", r.school_name],
              [
                "SRA(s)",
                sras.map((s) => (
                  <span key={s.registration_id} className="block">
                    <Link href={`/admin/${slug}/registrations/${s.registration_id}`} className="text-brand underline">
                      {s.first_name} {s.last_name}
                    </Link>{" "}
                    ({s.email}) <StatusBadge status={s.status} />
                  </span>
                )),
              ],
              [
                "Team partner",
                teammates.length
                  ? teammates.map((t) => (
                      <span key={t.registration_id} className="block">
                        <Link href={`/admin/${slug}/registrations/${t.registration_id}`} className="text-brand underline">
                          {t.first_name} {t.last_name}
                        </Link>{" "}
                        ({t.email}) <StatusBadge status={t.status} />
                        {!t.has_password && <span className="text-xs text-amber-700"> · hasn&apos;t set a password</span>}
                      </span>
                    ))
                  : "Individual project",
              ],
              [
                "Entry fee",
                <ActionForm key="fee" action={setPaymentAction} className="flex items-center gap-3">
                  <input type="hidden" name="chapter" value={slug} />
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="paid" value={r.payment_received ? "0" : "1"} />
                  <span>{r.payment_received ? "Received" : "Not received"}</span>
                  <SubmitButton className={smallButtonClass}>{r.payment_received ? "Mark unpaid" : "Mark received"}</SubmitButton>
                </ActionForm>,
              ],
            ]}
          />
        </Card>
        {project && (
          <Card title="Project">
            <DefinitionList
              items={[
                ["Title", project.title],
                ["Description", pre(project.description)],
                ["Domains", project.domains.join("; ")],
                ["Methodology", project.methods.join("; ")],
                ["Real-world focus", focusLabel(project)],
              ]}
            />
            <ActionForm action={setProjectCodeAction} className="mt-5 flex flex-wrap items-end gap-3">
              <input type="hidden" name="chapter" value={slug} />
              <input type="hidden" name="id" value={r.id} />
              <label className="text-sm font-medium">
                Project ID
                <Input name="code" defaultValue={project.projectCode ?? ""} maxLength={30} className="mt-1 w-40 font-mono" />
              </label>
              <SubmitButton className={smallButtonClass}>Save ID</SubmitButton>
            </ActionForm>
          </Card>
        )}
      </>
    );
  } else if (r.role === "sra") {
    const d = parseJSON<SraData>(r.data, { title: "" });
    const students = r.school_id ? await getStudentsAtSchool(r.school_id) : [];
    details = (
      <Card title="Advisor">
        <DefinitionList
          items={[
            ["Title", d.title],
            ["School", r.school_name ? `${r.school_name}${r.school_town ? ` (${r.school_town})` : ""}` : null],
            [
              "Chaperone",
              d.chaperone
                ? `${d.chaperone.name}${d.chaperone.self ? " (the SRA)" : ""} · ${d.chaperone.email} · ${d.chaperone.phone}`
                : "Not set yet",
            ],
            [
              `Students at school (${students.length})`,
              students.length
                ? students.map((s) => (
                    <span key={s.registration_id} className="block">
                      <Link href={`/admin/${slug}/registrations/${s.registration_id}`} className="text-brand underline">
                        {s.first_name} {s.last_name}
                      </Link>{" "}
                      · {s.project_title} <StatusBadge status={s.status} /> {s.payment_received ? "· paid" : ""}
                    </span>
                  ))
                : "None yet",
            ],
          ]}
        />
      </Card>
    );
  } else {
    const d = parseJSON<Partial<JudgeData>>(r.data, {});
    details = (
      <Card title="Judge application">
        <DefinitionList
          items={[
            ["Address", d.address],
            ["Institution", d.institution],
            ["Department", d.department],
            ["Position", d.position],
            ["Years at institution", d.yearsAtInstitution],
            ["Employment", d.employmentStatus],
            ["Highest degree", [d.degree, d.degreeDate].filter(Boolean).join(", ")],
            ["Discipline", d.discipline],
            ["Expertise", pre(d.expertise)],
            ["Publications", pre(d.publications)],
            ["Patents", pre(d.patents)],
            ["Judged before", yesNo(d.hasJudged)],
            ["Judging experience", pre(d.judgingExperience)],
            ["Commits to all projects", yesNo(d.commitAll)],
            ["Knows students", yesNo(d.knowsStudents)],
            ["Known students", pre(d.knownStudents)],
            ["Mentoring", yesNo(d.mentoring)],
            ["Mentoring details", pre(d.mentoringDetails)],
            ["Availability", d.availability],
            ["Notes", pre(d.notes)],
          ]}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={listHref} className="text-sm text-brand underline">
        ← Back to {r.role === "sra" ? "SRAs" : `${r.role}s`}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold">
          {r.first_name} {r.last_name}
        </h2>
        <span className="text-sm font-light">{ROLE_LABELS[r.role]}</span>
        <StatusBadge status={r.status} />
      </div>

      <Card title="Contact">
        <DefinitionList
          items={[
            ["Email", <a key="e" href={`mailto:${r.email}`} className="text-brand underline">{r.email}</a>],
            ["Email verified", r.email_verified_at ? r.email_verified_at.slice(0, 10) : "Not yet"],
            ["Account", r.has_password ? "Password set" : "Invited; hasn't set a password yet"],
            ["Phone", r.phone],
            ["Registered", r.created_at.slice(0, 16).replace("T", " ") + " UTC"],
            [
              "Other chapters",
              otherChapters.length ? otherChapters.map((o) => `${o.chapter_slug} (${o.role}, ${o.status})`).join("; ") : null,
            ],
          ]}
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionForm action={sendPasswordLinkAction} className="space-y-2">
            <input type="hidden" name="chapter" value={slug} />
            <input type="hidden" name="userId" value={r.user_id} />
            <SubmitButton className={smallButtonClass} pendingText="Sending...">
              {r.has_password ? "Email password reset link" : "Resend set-password invite"}
            </SubmitButton>
          </ActionForm>
          {!r.email_verified_at && (
            <ActionForm action={markVerifiedAction} className="space-y-2">
              <input type="hidden" name="chapter" value={slug} />
              <input type="hidden" name="userId" value={r.user_id} />
              <SubmitButton className={smallButtonClass}>Mark email verified</SubmitButton>
            </ActionForm>
          )}
        </div>
      </Card>

      <Card title="Status">
        <ActionForm action={setRegistrationStatusAction} className="space-y-4">
          <input type="hidden" name="chapter" value={slug} />
          <input type="hidden" name="id" value={r.id} />
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">
              Status
              <Select name="status" defaultValue={r.status} className="mt-1 w-48">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex items-center gap-2 pb-3 text-sm">
              <input type="hidden" name="notifyField" value="1" />
              <input type="checkbox" name="notify" value="true" defaultChecked className="h-4 w-4 accent-brand" />
              Email them about approval / rejection
            </label>
            <SubmitButton className={secondaryButtonClass}>Update status</SubmitButton>
          </div>
        </ActionForm>
      </Card>

      {details}

      {r.role !== "judge" && (
        <Card title="School">
          <ActionForm action={changeSchoolAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="chapter" value={slug} />
            <input type="hidden" name="id" value={r.id} />
            <label className="text-sm font-medium">
              Move to school
              <Select name="schoolId" defaultValue={r.school_id ?? ""} className="mt-1 max-w-sm">
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </label>
            <SubmitButton className={smallButtonClass}>Move</SubmitButton>
          </ActionForm>
          {r.role === "student" && r.is_team ? (
            <p className="mt-2 text-xs font-light text-ink-soft">Moving a team student moves their partner too.</p>
          ) : null}
        </Card>
      )}

      <Card title="Admin notes">
        <ActionForm action={updateAdminNotesAction} className="space-y-3">
          <input type="hidden" name="chapter" value={slug} />
          <input type="hidden" name="id" value={r.id} />
          <Textarea name="notes" rows={4} defaultValue={r.admin_notes} maxLength={5000} placeholder={`Only ${chapter.shortName} admins can see these.`} />
          <SubmitButton className={smallButtonClass}>Save notes</SubmitButton>
        </ActionForm>
      </Card>

      <Card title="Delete">
        <p className="mb-3 text-sm font-light">
          Permanently removes this registration{r.role === "student" ? " (and the project, if no partner remains on it)" : ""}.
          The person&apos;s account stays so they can register again. Prefer setting the status to withdrawn or rejected
          to keep a record.
        </p>
        <ActionForm action={deleteRegistrationAction}>
          <input type="hidden" name="chapter" value={slug} />
          <input type="hidden" name="id" value={r.id} />
          <SubmitButton
            className={dangerButtonClass}
            pendingText="Deleting..."
            confirm={`Permanently delete ${r.first_name} ${r.last_name}'s registration?`}
          >
            Delete registration
          </SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
