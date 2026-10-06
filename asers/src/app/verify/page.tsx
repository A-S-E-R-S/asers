import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser, safeNext } from "@/lib/auth";
import { changeUnverifiedEmailAction, resendCodeAction, verifyAction } from "@/app/actions/auth";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Field, Input, PageShell, secondaryButtonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  const user = await requireUser(`/verify?next=${encodeURIComponent(next)}`);
  if (user.emailVerified) redirect(next);

  return (
    <PageShell
      eyebrow="Account"
      title="Verify your email"
      width="max-w-md"
      intro={
        <>
          We sent a 6-digit code to <strong className="font-medium">{user.email}</strong>. Enter it below
          to finish setting up your account.
        </>
      }
    >
      <ActionForm action={verifyAction}>
        <input type="hidden" name="next" value={next} />
        <Field label="Verification code">
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="123456"
            className="text-2xl tracking-[0.3em]"
          />
        </Field>
        <SubmitButton pendingText="Verifying...">Verify email</SubmitButton>
      </ActionForm>

      <div className="mt-10 space-y-8 border-t-2 border-brand-pale pt-6">
        <div>
          <p className="text-sm font-light">
            Didn&apos;t get it? Check your spam folder. School email systems sometimes block outside
            mail, so a personal address can work better.
          </p>
          <ActionForm action={resendCodeAction} className="mt-3 space-y-3">
            <SubmitButton className={secondaryButtonClass} pendingText="Sending...">
              Send a new code
            </SubmitButton>
          </ActionForm>
        </div>
        <div>
          <p className="text-sm font-medium">Typo in your email?</p>
          <ActionForm action={changeUnverifiedEmailAction} className="mt-3 space-y-3" resetOnSuccess>
            <Field label="New email address">
              <Input name="email" type="email" required maxLength={254} />
            </Field>
            <SubmitButton className={secondaryButtonClass} pendingText="Updating...">
              Update email and resend
            </SubmitButton>
          </ActionForm>
        </div>
      </div>
    </PageShell>
  );
}
