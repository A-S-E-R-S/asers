import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { loginAction } from "@/app/actions/auth";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Field, Input, PageShell, TextLink } from "@/components/ui";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getCurrentUser()) redirect(next);

  return (
    <PageShell
      eyebrow="Account"
      title="Log in"
      width="max-w-md"
      intro="Students, Science Research Advisors, judges, and chapter admins all log in here."
    >
      <ActionForm action={loginAction}>
        <input type="hidden" name="next" value={next} />
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required maxLength={254} />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" autoComplete="current-password" required />
        </Field>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
          <TextLink href="/forgot-password">Forgot password?</TextLink>
        </div>
      </ActionForm>
      <p className="mt-10 border-t-2 border-brand-pale pt-6 text-sm font-light">
        New here? <TextLink href="/register">Register as a student, advisor, or judge</TextLink>.
      </p>
    </PageShell>
  );
}
