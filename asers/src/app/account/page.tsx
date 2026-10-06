import type { Metadata } from "next";
import { requireVerifiedUser } from "@/lib/auth";
import { changePasswordAction, logoutAction, updateProfileAction } from "@/app/actions/auth";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Card, Field, Input, PageShell, TextLink, secondaryButtonClass } from "@/components/ui";
import { PASSWORD_MIN } from "@/lib/options";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const user = await requireVerifiedUser("/account");
  return (
    <PageShell
      eyebrow={<TextLink href="/dashboard">Dashboard</TextLink>}
      title="Account settings"
      intro={user.email}
    >
      <div className="space-y-6">
        <Card title="Profile">
          <ActionForm action={updateProfileAction}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" required>
                <Input name="firstName" defaultValue={user.firstName} required maxLength={80} />
              </Field>
              <Field label="Last name" required>
                <Input name="lastName" defaultValue={user.lastName} required maxLength={80} />
              </Field>
            </div>
            <Field label="Phone">
              <Input name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={40} />
            </Field>
            <SubmitButton>Save profile</SubmitButton>
          </ActionForm>
          <p className="mt-4 text-xs font-light text-ink-soft">
            To change the email on your account, contact your chapter or contact@asers.org.
          </p>
        </Card>

        <Card title="Password">
          <ActionForm action={changePasswordAction} resetOnSuccess>
            {user.hasPassword && (
              <Field label="Current password" required>
                <Input name="current" type="password" autoComplete="current-password" required />
              </Field>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="New password" required hint={`At least ${PASSWORD_MIN} characters.`}>
                <Input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
              </Field>
              <Field label="Confirm new password" required>
                <Input name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
              </Field>
            </div>
            <SubmitButton>Change password</SubmitButton>
          </ActionForm>
        </Card>

        <form action={logoutAction}>
          <SubmitButton className={secondaryButtonClass} pendingText="Logging out...">
            Log out
          </SubmitButton>
        </form>
      </div>
    </PageShell>
  );
}
