import Link from "next/link";
import { requireNationalAdmin } from "@/lib/admin";
import { all } from "@/lib/db";
import { addNationalAdminAction } from "@/app/actions/admin";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, inputClass, secondaryButtonClass } from "@/components/ui";

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_national_admin: number;
  disabled: number;
  email_verified_at: string | null;
  regs: string | null;
  admin_of: string | null;
};

const USER_SQL = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.is_national_admin, u.disabled, u.email_verified_at,
    (SELECT GROUP_CONCAT(r.chapter_slug || ':' || r.role, ', ') FROM registrations r WHERE r.user_id = u.id) AS regs,
    (SELECT GROUP_CONCAT(a.chapter_slug, ', ') FROM chapter_admins a WHERE a.user_id = u.id) AS admin_of
  FROM users u`;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireNationalAdmin();
  const q = ((await searchParams).q ?? "").trim();
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const [admins, results] = await Promise.all([
    all<Row>(`${USER_SQL} WHERE u.is_national_admin = 1 OR EXISTS (SELECT 1 FROM chapter_admins a WHERE a.user_id = u.id) ORDER BY u.is_national_admin DESC, u.last_name`),
    q
      ? all<Row>(`${USER_SQL} WHERE u.email LIKE ? OR (u.first_name || ' ' || u.last_name) LIKE ? ORDER BY u.last_name LIMIT 100`, like, like)
      : Promise.resolve([] as Row[]),
  ]);

  const table = (rows: Row[]) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b-2 border-brand-pale text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Admin of</th>
            <th className="px-3 py-2">Registrations</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="border-b border-brand-pale align-top">
              <td className="px-3 py-2">
                <Link href={`/admin/users/${u.id}`} className="font-medium text-brand underline">
                  {u.first_name} {u.last_name}
                </Link>
                <span className="block text-xs font-light">{u.email}</span>
                {u.disabled ? <span className="text-xs text-red-700">Disabled</span> : null}
              </td>
              <td className="px-3 py-2 text-xs">{u.is_national_admin ? "NATIONAL" : u.admin_of ?? "—"}</td>
              <td className="px-3 py-2 text-xs">{u.regs ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-[-0.015em]">Users &amp; admins</h1>
      <Card title="Find a user">
        <form method="get" className="flex flex-wrap gap-3">
          <input name="q" defaultValue={q} placeholder="Name or email" className={`${inputClass} mt-0 w-72`} />
          <button className={secondaryButtonClass}>Search</button>
        </form>
        {q && <div className="mt-4">{results.length ? table(results) : <p className="text-sm font-light">No users match.</p>}</div>}
      </Card>
      <Card title={`Admins (${admins.length})`}>
        {table(admins)}
        <p className="mt-3 text-xs font-light text-ink-soft">Add chapter admins from each chapter&apos;s Admins tab.</p>
      </Card>
      <Card title="Add a national admin">
        <p className="mb-4 text-sm font-light">National admins can manage every chapter, create chapters and manage admins.</p>
        <ActionForm action={addNationalAdminAction} className="space-y-4" resetOnSuccess>
          <Field label="Email" required>
            <Input name="email" type="email" required maxLength={254} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" hint="Only needed if they don't have an account">
              <Input name="firstName" maxLength={80} />
            </Field>
            <Field label="Last name">
              <Input name="lastName" maxLength={80} />
            </Field>
          </div>
          <SubmitButton className={secondaryButtonClass}>Add national admin</SubmitButton>
        </ActionForm>
      </Card>
    </div>
  );
}
