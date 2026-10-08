"use client";

import { useState } from "react";
import ActionForm from "@/components/ActionForm";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import AccountFields, { type AccountUser } from "@/components/register/AccountFields";
import { Input, Select } from "@/components/ui";
import { registerSraAction } from "@/app/actions/register";

const NEW = "__new__";

export default function SraForm({
  chapterSlug,
  chapterName,
  user,
  schools,
}: {
  chapterSlug: string;
  chapterName: string;
  user: AccountUser;
  schools: { id: string; name: string; town: string }[];
}) {
  const [choice, setChoice] = useState(schools.length ? "" : NEW);

  return (
    <ActionForm action={registerSraAction} className="space-y-6" scrollToError>
      <input type="hidden" name="chapter" value={chapterSlug} />
      <AccountFields user={user} withPhone />
      <FormField name="title" label="Title" required hint="For example: Science Research Teacher, Biology Teacher, Department Chair">
        <Input name="title" required maxLength={120} />
      </FormField>

      <FormField name="schoolId" label={`Your ${chapterName} school`} required>
        <Select value={choice} onChange={(e) => setChoice(e.target.value)} required>
          <option value="">Select your school...</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.town ? ` (${s.town})` : ""}
            </option>
          ))}
          <option value={NEW}>My school isn&apos;t listed. Add it</option>
        </Select>
      </FormField>
      <input type="hidden" name="schoolId" value={choice === NEW ? "" : choice} />

      {choice === NEW && (
        <div className="grid gap-5 border-l-4 border-brand-pale pl-4 sm:grid-cols-[2fr_1fr]">
          <FormField name="newSchool" label="School name" required hint="Use the school's full official name.">
            <Input name="newSchool" required maxLength={150} />
          </FormField>
          <FormField name="town" label="Town / city" required>
            <Input name="town" required maxLength={80} />
          </FormField>
        </div>
      )}

      <p className="text-sm font-light">
        Each school needs a registered SRA before its students can sign up. A chapter admin reviews and approves
        SRA registrations; once approved, you can approve your students and track their payments from your
        dashboard.
      </p>
      <SubmitButton pendingText="Registering...">Register as an SRA</SubmitButton>
    </ActionForm>
  );
}
