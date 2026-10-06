import type { User } from "@/lib/auth";
import type { Chapter } from "@/lib/chapters";
import { first, parseJSON } from "@/lib/db";
import {
  getSchoolSras,
  getStudentsAtSchool,
  type RegistrationRow,
  type SraData,
  type StudentData,
} from "@/lib/registrations";
import {
  sraSetPaymentAction,
  sraSetStudentStatusAction,
  updateSraTitleAction,
  withdrawAction,
} from "@/app/actions/dashboard";
import ActionForm from "@/components/ActionForm";
import ChaperoneForm from "@/components/dashboard/ChaperoneForm";
import InlineAction from "@/components/InlineAction";
import SubmitButton from "@/components/SubmitButton";
import { Alert, Card, Field, Input, StatusBadge, dangerButtonClass, secondaryButtonClass, smallButtonClass } from "@/components/ui";

export default async function SraDashboard({
  user,
  reg,
  chapter,
}: {
  user: User;
  reg: RegistrationRow;
  chapter: Chapter;
}) {
  const data = parseJSON<SraData>(reg.data, { title: "" });
  const [school, students, sras] = await Promise.all([
    reg.school_id ? first<{ name: string; town: string }>("SELECT name, town FROM schools WHERE id = ?", reg.school_id) : null,
    reg.school_id && reg.status === "approved" ? getStudentsAtSchool(reg.school_id) : Promise.resolve([]),
    reg.school_id ? getSchoolSras(reg.school_id) : Promise.resolve([]),
  ]);
  // Contact details of other SRAs are only shown once this SRA is approved.
  const coSras = reg.status === "approved" ? sras.filter((s) => s.user_id !== user.id) : [];
  const order = { pending: 0, approved: 1, rejected: 2, withdrawn: 3 };
  const sorted = [...students].sort((a, b) => order[a.status] - order[b.status]);
  const counts = {
    total: students.filter((s) => s.status !== "withdrawn").length,
    pending: students.filter((s) => s.status === "pending").length,
    approved: students.filter((s) => s.status === "approved").length,
    paid: students.filter((s) => s.payment_received && s.status !== "withdrawn").length,
  };

  return (
    <>
      {reg.status === "pending" && (
        <Alert tone="warning">
          <strong className="font-medium">Awaiting admin approval.</strong> A {chapter.shortName} admin will review your
          registration. You&apos;ll get an email once your account is approved, and then you can manage your
          students here. Students from your school can already register in the meantime.
        </Alert>
      )}
      {reg.status === "rejected" && (
        <Alert tone="error">Your SRA registration was not approved. Please contact the chapter for details.</Alert>
      )}
      {reg.status === "withdrawn" && <Alert tone="info">You withdrew this registration.</Alert>}

      <Card title="Your school">
        <p className="text-lg font-bold">
          {school?.name}
          {school?.town ? <span className="font-light"> ({school.town})</span> : null}
        </p>
        {coSras.length > 0 && (
          <p className="mt-2 text-sm font-light">
            Other SRAs at your school:{" "}
            {coSras.map((s, i) => (
              <span key={s.registration_id}>
                {i > 0 && ", "}
                {s.first_name} {s.last_name} ({s.email})
              </span>
            ))}
          </p>
        )}
        <ActionForm action={updateSraTitleAction} className="mt-5 flex flex-wrap items-end gap-3">
          <input type="hidden" name="chapter" value={chapter.slug} />
          <Field label="Your title" className="min-w-[240px] flex-1">
            <Input name="title" defaultValue={data.title} required maxLength={120} />
          </Field>
          <SubmitButton className={secondaryButtonClass}>Save</SubmitButton>
        </ActionForm>
      </Card>

      {(reg.status === "approved" || reg.status === "pending") && (
        <Card title="School chaperone">
          <p className="mb-4 text-sm font-light">
            Designate the adult who will supervise all students from your school at the event.
          </p>
          {data.chaperone && (
            <p className="mb-4 border-l-4 border-green-700 bg-green-50 px-3 py-2 text-sm">
              Current chaperone: <strong className="font-medium">{data.chaperone.name}</strong> · {data.chaperone.email} ·{" "}
              {data.chaperone.phone}
            </p>
          )}
          <ChaperoneForm chapterSlug={chapter.slug} current={data.chaperone} sraPhone={user.phone} />
        </Card>
      )}

      {reg.status === "approved" && (
        <Card title={`Your students (${counts.total})`}>
          <p className="mb-4 text-sm font-light">
            Approve each student from your school once you&apos;ve confirmed they&apos;re yours, and mark their entry fee
            {chapter.studentFee ? ` (${chapter.studentFee})` : ""} as received when you collect it.
          </p>
          <div className="mb-5 flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="font-medium">{counts.pending}</strong> pending
            </span>
            <span>
              <strong className="font-medium">{counts.approved}</strong> approved
            </span>
            <span>
              <strong className="font-medium">{counts.paid}</strong> paid
            </span>
          </div>
          {students.length === 0 ? (
            <p className="font-light">
              No students have registered yet. Share this link with them:{" "}
              <span className="break-all font-medium">asers.org/register/{chapter.slug}/student</span>
            </p>
          ) : (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b-2 border-brand-pale text-xs uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-5 py-2 sm:px-6">Student</th>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => {
                    const sd = parseJSON<StudentData>(s.data, { grade: "", shirtSize: "" });
                    const partner = s.is_team ? students.find((o) => o.project_id === s.project_id && o.user_id !== s.user_id) : null;
                    const base = { chapter: chapter.slug, registrationId: s.registration_id };
                    return (
                      <tr key={s.registration_id} className="border-b border-brand-pale align-top">
                        <td className="px-5 py-3 sm:px-6">
                          <span className="font-medium">
                            {s.first_name} {s.last_name}
                          </span>
                          <span className="block text-xs font-light">
                            Grade {sd.grade} · {s.email}
                          </span>
                          {!s.email_verified_at && (
                            <span className="block text-xs font-light text-amber-700">Email not verified yet</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-light">{s.project_title}</span>
                          {s.is_team ? (
                            <span className="block text-xs font-light text-ink-soft">
                              Team{partner ? ` with ${partner.first_name} ${partner.last_name}` : ""}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-3 py-3">
                          {s.status === "withdrawn" ? (
                            "—"
                          ) : (
                            <InlineAction
                              action={sraSetPaymentAction}
                              fields={{ ...base, paid: s.payment_received ? "0" : "1" }}
                              label={s.payment_received ? "✓ Received" : "Mark received"}
                              className={
                                s.payment_received
                                  ? "inline-flex border-2 border-green-700 bg-green-50 px-3 py-1 text-sm font-medium text-green-800 hover:bg-white"
                                  : smallButtonClass
                              }
                            />
                          )}
                        </td>
                        <td className="space-x-2 space-y-1 px-3 py-3">
                          {s.status !== "withdrawn" && s.status !== "approved" && (
                            <InlineAction action={sraSetStudentStatusAction} fields={{ ...base, status: "approved" }} label="Approve" />
                          )}
                          {s.status !== "withdrawn" && s.status !== "rejected" && (
                            <InlineAction
                              action={sraSetStudentStatusAction}
                              fields={{ ...base, status: "rejected" }}
                              label="Reject"
                              className={dangerButtonClass}
                              confirm={`Reject ${s.first_name} ${s.last_name}? They'll be notified by email.`}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {reg.status !== "withdrawn" && (
        <Card title="Withdraw">
          <ActionForm action={withdrawAction}>
            <input type="hidden" name="chapter" value={chapter.slug} />
            <SubmitButton
              className={dangerButtonClass}
              pendingText="Withdrawing..."
              confirm="Withdraw as SRA? Your students stay registered, but you'll lose access to manage them."
            >
              Withdraw as SRA
            </SubmitButton>
          </ActionForm>
        </Card>
      )}
    </>
  );
}
