"use client";

import { useState } from "react";
import ActionForm from "@/components/ActionForm";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import AccountFields, { type AccountUser } from "@/components/register/AccountFields";
import ProjectFields from "@/components/register/ProjectFields";
import { Alert, Input, Select } from "@/components/ui";
import { registerStudentAction } from "@/app/actions/register";
import { GRADES, SHIRT_SIZES } from "@/lib/options";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border-t-2 border-brand-pale pt-6">
      <h2 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h2>
      {children}
    </section>
  );
}

export default function StudentForm({
  chapterSlug,
  chapterShortName,
  contactEmail,
  user,
  schools,
}: {
  chapterSlug: string;
  chapterShortName: string;
  contactEmail: string | null;
  user: AccountUser;
  schools: { id: string; name: string; town: string }[];
}) {
  const [isTeam, setIsTeam] = useState(false);

  if (schools.length === 0) {
    return (
      <Alert tone="warning">
        No schools in {chapterShortName} have a registered Science Research Advisor yet. Ask a teacher at your
        school to <a className="font-medium underline" href={`/register/${chapterSlug}/sra`}>register as your SRA</a>{" "}
        first, then come back to register.
        {contactEmail && (
          <>
            {" "}
            Questions? Email <a className="font-medium underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        )}
      </Alert>
    );
  }

  return (
    <ActionForm action={registerStudentAction} className="space-y-8" scrollToError>
      <input type="hidden" name="chapter" value={chapterSlug} />

      <Section title="About you">
        <AccountFields user={user} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="grade" label="Grade" required>
            <Select name="grade" required defaultValue="">
              <option value="">Select grade...</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}th
                </option>
              ))}
            </Select>
          </FormField>
          <FormField name="shirtSize" label="Shirt size" required>
            <Select name="shirtSize" required defaultValue="">
              <option value="">Select shirt size...</option>
              {SHIRT_SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField
          name="schoolId"
          label="School"
          required
          hint="Only schools with a registered Science Research Advisor are listed. Don't see yours? Your advisor needs to register first."
        >
          <Select name="schoolId" required defaultValue="">
            <option value="">Select a school...</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.town ? ` (${s.town})` : ""}
              </option>
            ))}
          </Select>
        </FormField>
      </Section>

      <Section title="Team">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="isTeam"
            checked={isTeam}
            onChange={(e) => setIsTeam(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand"
          />
          This is a team project (maximum 2 people)
        </label>
        {isTeam && (
          <div className="space-y-5 border-l-4 border-brand-pale pl-4">
            <p className="text-sm font-light">
              Register once for the whole team. We&apos;ll email your partner a link to set their own password and
              view the shared project. Your partner must attend the same school.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField name="partnerFirstName" label="Partner first name" required>
                <Input name="partnerFirstName" required maxLength={80} />
              </FormField>
              <FormField name="partnerLastName" label="Partner last name" required>
                <Input name="partnerLastName" required maxLength={80} />
              </FormField>
            </div>
            <FormField name="partnerEmail" label="Partner email" required>
              <Input name="partnerEmail" type="email" required maxLength={254} />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField name="partnerGrade" label="Partner grade" required>
                <Select name="partnerGrade" required defaultValue="">
                  <option value="">Select grade...</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}th
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField name="partnerShirtSize" label="Partner shirt size" required>
                <Select name="partnerShirtSize" required defaultValue="">
                  <option value="">Select shirt size...</option>
                  {SHIRT_SIZES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>
        )}
      </Section>

      <Section title="Project">
        <ProjectFields />
      </Section>

      <div className="border-t-2 border-brand-pale pt-6">
        <p className="mb-5 text-sm font-light">
          After you register, your Science Research Advisor reviews and approves your registration.
        </p>
        <SubmitButton pendingText="Registering...">Register as a student</SubmitButton>
      </div>
    </ActionForm>
  );
}
