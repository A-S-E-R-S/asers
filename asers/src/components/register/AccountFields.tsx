"use client";

import FormField from "@/components/FormField";
import { Input } from "@/components/ui";
import { PASSWORD_MIN } from "@/lib/options";

export type AccountUser = { firstName: string; lastName: string; email: string; phone: string | null } | null;

/** Name / email / password, or a "registering as" note for logged-in users. */
export default function AccountFields({
  user,
  withPhone,
  phoneLabel = "Phone",
}: {
  user: AccountUser;
  withPhone?: boolean;
  phoneLabel?: string;
}) {
  const phone = withPhone ? (
    <FormField name="phone" label={phoneLabel} required>
      <Input name="phone" type="tel" autoComplete="tel" defaultValue={user?.phone ?? ""} required maxLength={40} />
    </FormField>
  ) : null;

  if (user) {
    return (
      <div className="space-y-5">
        <div className="border-2 border-brand-pale bg-strip px-4 py-3 text-sm">
          Registering as{" "}
          <strong className="font-medium">
            {user.firstName} {user.lastName}
          </strong>{" "}
          ({user.email}). Your existing login will work for this chapter too.
        </div>
        {phone}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="firstName" label="First name" required>
          <Input name="firstName" autoComplete="given-name" required maxLength={80} />
        </FormField>
        <FormField name="lastName" label="Last name" required>
          <Input name="lastName" autoComplete="family-name" required maxLength={80} />
        </FormField>
      </div>
      <FormField
        name="email"
        label="Email"
        required
        hint="We recommend a personal email address. School email systems may block our verification emails."
      >
        <Input name="email" type="email" autoComplete="email" required maxLength={254} />
      </FormField>
      {phone}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="password" label="Password" required hint={`At least ${PASSWORD_MIN} characters.`}>
          <Input name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
        </FormField>
        <FormField name="confirmPassword" label="Confirm password" required>
          <Input name="confirmPassword" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} required />
        </FormField>
      </div>
    </div>
  );
}
