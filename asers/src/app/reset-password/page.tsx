import type { Metadata } from "next";
import { findResetToken } from "@/lib/auth";
import { resetPasswordAction } from "@/app/actions/auth";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Alert, Field, Input, PageShell, TextLink } from "@/components/ui";
import { PASSWORD_MIN } from "@/lib/options";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const found = await findResetToken(token);

  if (!found) {
    return (
      <PageShell eyebrow="Account" title="Link expired" width="max-w-md">
        <Alert tone="error">This password link is invalid or has expired.</Alert>
        <p className="mt-6 text-sm">
          <TextLink href="/forgot-password">Request a new link</TextLink>
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Account"
      title="Set a new password"
      width="max-w-md"
      intro={
        <>
          For <strong className="font-medium">{found.email}</strong>
        </>
      }
    >
      <ActionForm action={resetPasswordAction}>
        <input type="hidden" name="token" value={token} />
        <Field label="New password" hint={`At least ${PASSWORD_MIN} characters.`}>
          <Input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
        </Field>
        <Field label="Confirm new password">
          <Input name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
        </Field>
        <SubmitButton pendingText="Saving...">Set password and log in</SubmitButton>
      </ActionForm>
    </PageShell>
  );
}
