import type { Metadata } from "next";
import { forgotPasswordAction } from "@/app/actions/auth";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Field, Input, PageShell, TextLink } from "@/components/ui";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <PageShell
      eyebrow="Account"
      title="Reset your password"
      width="max-w-md"
      intro="Enter your email address and we'll send you a link to reset your password."
    >
      <ActionForm action={forgotPasswordAction}>
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required maxLength={254} />
        </Field>
        <SubmitButton pendingText="Sending...">Send reset link</SubmitButton>
      </ActionForm>
      <p className="mt-8 text-sm">
        <TextLink href="/login">Back to login</TextLink>
      </p>
    </PageShell>
  );
}
