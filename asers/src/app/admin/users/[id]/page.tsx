import Link from "next/link";
import { notFound } from "next/navigation";
import { requireNationalAdmin } from "@/lib/admin";
import { all, first } from "@/lib/db";
import { ROLE_LABELS, type Role } from "@/lib/options";
import { nationalUserActionsAction, setNationalAdminAction, setUserDisabledAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, DefinitionList, Input, StatusBadge, dangerButtonClass, smallButtonClass } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const { user: me } = await requireNationalAdmin();
  const u = await first<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    email_verified_at: string | null;
    is_national_admin: number;
    disabled: number;
    password_hash: string | null;
    created_at: string;
    last_login_at: string | null;
  }>("SELECT * FROM users WHERE id = ?", id);
  if (!u) notFound();
  const [regs, adminOf] = await Promise.all([
    all<{ id: string; chapter_slug: string; role: Role; status: string }>(
      "SELECT id, chapter_slug, role, status FROM registrations WHERE user_id = ? ORDER BY created_at",
      id
    ),
    all<{ chapter_slug: string }>("SELECT chapter_slug FROM chapter_admins WHERE user_id = ?", id),
  ]);
  const hidden = <input type="hidden" name="userId" value={u.id} />;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-brand underline">
        ← Users
      </Link>
      <h1 className="text-3xl font-bold tracking-[-0.015em]">
        {u.first_name} {u.last_name}
      </h1>
      <Card title="Account">
        <DefinitionList
          items={[
            ["Email", u.email],
            ["Phone", u.phone],
            ["Email verified", u.email_verified_at ?? "No"],
            ["Password", u.password_hash ? "Set" : "Not set (invited)"],
            ["Created", u.created_at],
            ["Last login", u.last_login_at],
            ["National admin", u.is_national_admin ? "Yes" : "No"],
            ["Chapter admin of", adminOf.map((a) => a.chapter_slug).join(", ")],
            ["Status", u.disabled ? "Disabled" : "Active"],
          ]}
        />
      </Card>
      <Card title="Registrations">
        {regs.length === 0 ? (
          <p className="text-sm font-light">None.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {regs.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/${r.chapter_slug}/registrations/${r.id}`} className="text-brand underline">
                  {r.chapter_slug}: {ROLE_LABELS[r.role]}
                </Link>{" "}
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Actions">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-3">
            <ActionForm action={nationalUserActionsAction} className="space-y-2">
              {hidden}
              <input type="hidden" name="op" value="link" />
              <SubmitButton className={smallButtonClass}>Email password link</SubmitButton>
            </ActionForm>
            {!u.email_verified_at && (
              <ActionForm action={nationalUserActionsAction} className="space-y-2">
                {hidden}
                <input type="hidden" name="op" value="verify" />
                <SubmitButton className={smallButtonClass}>Mark email verified</SubmitButton>
              </ActionForm>
            )}
            {u.id !== me.id && (
              <ActionForm action={setNationalAdminAction} className="space-y-2">
                {hidden}
                <input type="hidden" name="on" value={u.is_national_admin ? "0" : "1"} />
                <SubmitButton
                  className={u.is_national_admin ? dangerButtonClass : smallButtonClass}
                  confirm={u.is_national_admin ? "Revoke national admin?" : "Grant national admin (full access to every chapter)?"}
                >
                  {u.is_national_admin ? "Revoke national admin" : "Make national admin"}
                </SubmitButton>
              </ActionForm>
            )}
            {u.id !== me.id && (
              <ActionForm action={setUserDisabledAction} className="space-y-2">
                {hidden}
                <input type="hidden" name="disabled" value={u.disabled ? "0" : "1"} />
                <SubmitButton
                  className={u.disabled ? smallButtonClass : dangerButtonClass}
                  confirm={u.disabled ? undefined : "Disable this account and sign them out everywhere?"}
                >
                  {u.disabled ? "Re-enable account" : "Disable account"}
                </SubmitButton>
              </ActionForm>
            )}
          </div>
          <ActionForm action={nationalUserActionsAction} className="flex flex-wrap items-end gap-3">
            {hidden}
            <input type="hidden" name="op" value="email" />
            <label className="text-sm font-medium">
              Change email
              <Input name="email" type="email" defaultValue={u.email} required maxLength={254} className="mt-1 w-72" />
            </label>
            <SubmitButton className={smallButtonClass}>Change</SubmitButton>
          </ActionForm>
        </div>
      </Card>
    </div>
  );
}
