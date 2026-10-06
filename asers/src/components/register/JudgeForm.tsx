"use client";

import { useRef, useState, type ReactNode } from "react";
import ActionForm from "@/components/ActionForm";
import FormField, { FieldError } from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import AccountFields, { type AccountUser } from "@/components/register/AccountFields";
import { Input, Select, Textarea, secondaryButtonClass } from "@/components/ui";
import { registerJudgeAction } from "@/app/actions/register";
import { DEGREES, EMPLOYMENT_STATUSES } from "@/lib/options";
import type { ActionState } from "@/lib/form";

function YesNo({ name, label, value, onChange }: { name: string; label: ReactNode; value?: string; onChange?: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">
        {label}
        <span className="text-red-700"> *</span>
      </legend>
      <div className="mt-2 flex gap-6">
        {["yes", "no"].map((v) => (
          <label key={v} className="flex items-center gap-2 text-sm font-light capitalize">
            <input
              type="radio"
              name={name}
              value={v}
              required
              checked={value === undefined ? undefined : value === v}
              onChange={() => onChange?.(v)}
              className="h-4 w-4 accent-brand"
            />
            {v}
          </label>
        ))}
      </div>
      <FieldError name={name} />
    </fieldset>
  );
}

export default function JudgeForm({
  chapterSlug,
  chapterShortName,
  eventDateLabel,
  availabilityOptions,
  user,
}: {
  chapterSlug: string;
  chapterShortName: string;
  eventDateLabel: string | null;
  availabilityOptions: string[];
  user: AccountUser;
}) {
  const [step, setStep] = useState(0);
  const [hasJudged, setHasJudged] = useState("");
  const [knowsStudents, setKnowsStudents] = useState("");
  const [mentoring, setMentoring] = useState("");
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps: { title: string; fields: string[]; body: ReactNode }[] = [
    {
      title: "Basic information",
      fields: ["firstName", "lastName", "email", "password", "confirmPassword"],
      body: <AccountFields user={user} />,
    },
    {
      title: "Contact information",
      fields: ["address", "phone"],
      body: (
        <>
          <FormField name="address" label="Mailing address" required>
            <Input name="address" autoComplete="street-address" required maxLength={300} />
          </FormField>
          <FormField name="phone" label="Cell phone number" required>
            <Input name="phone" type="tel" autoComplete="tel" required maxLength={40} defaultValue={user?.phone ?? ""} />
          </FormField>
        </>
      ),
    },
    {
      title: "Institution",
      fields: ["institution", "yearsAtInstitution", "department", "position", "employmentStatus"],
      body: (
        <>
          <FormField name="institution" label="Institution / employer" required>
            <Input name="institution" required maxLength={200} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField name="department" label="Department" required>
              <Input name="department" required maxLength={200} />
            </FormField>
            <FormField name="yearsAtInstitution" label="Years at institution">
              <Input name="yearsAtInstitution" inputMode="numeric" maxLength={20} />
            </FormField>
          </div>
          <FormField name="position" label="Current position" required>
            <Input name="position" required maxLength={200} />
          </FormField>
          <FormField name="employmentStatus" label="Are you currently working or retired?" required>
            <Select name="employmentStatus" required defaultValue="">
              <option value="">Select...</option>
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </FormField>
        </>
      ),
    },
    {
      title: "Education",
      fields: ["degree", "degreeDate", "discipline"],
      body: (
        <>
          <FormField name="degree" label="Highest degree" required>
            <Select name="degree" required defaultValue="">
              <option value="">Select...</option>
              {DEGREES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField name="degreeDate" label="Year received (or expected)" required hint="For example: 2014">
              <Input name="degreeDate" required maxLength={10} pattern="\d{4}(-\d{2}){0,2}" placeholder="YYYY" />
            </FormField>
            <FormField name="discipline" label="Discipline" required>
              <Input name="discipline" required maxLength={200} />
            </FormField>
          </div>
        </>
      ),
    },
    {
      title: "Area of expertise",
      fields: ["expertise"],
      body: (
        <FormField name="expertise" label="Primary area of expertise" required>
          <Textarea name="expertise" rows={5} required maxLength={2000} placeholder="Describe your area of expertise..." />
        </FormField>
      ),
    },
    {
      title: "Publications & patents",
      fields: ["publications", "patents"],
      body: (
        <>
          <FormField name="publications" label="Publications" hint="Optional.">
            <Textarea name="publications" rows={5} maxLength={5000} placeholder="List your publications (optional)" />
          </FormField>
          <FormField name="patents" label="Patents" hint="Optional.">
            <Textarea name="patents" rows={3} maxLength={3000} placeholder="List your patents (optional)" />
          </FormField>
        </>
      ),
    },
    {
      title: "Judging experience",
      fields: ["hasJudged", "judgingExperience", "commitAll"],
      body: (
        <>
          <YesNo name="hasJudged" label="Have you judged science fairs before?" value={hasJudged} onChange={setHasJudged} />
          {hasJudged === "yes" && (
            <FormField name="judgingExperience" label="Which fairs, and roughly when?">
              <Textarea name="judgingExperience" rows={3} maxLength={2000} />
            </FormField>
          )}
          <YesNo
            name="commitAll"
            label="Can you commit to reviewing all of your assigned projects, even ones outside your primary field?"
          />
        </>
      ),
    },
    {
      title: "Conflicts of interest",
      fields: ["knowsStudents", "knownStudents", "mentoring", "mentoringDetails"],
      body: (
        <>
          <YesNo
            name="knowsStudents"
            label={`Do you know any high school students who may compete at ${chapterShortName}?`}
            value={knowsStudents}
            onChange={setKnowsStudents}
          />
          {knowsStudents === "yes" && (
            <FormField name="knownStudents" label="If yes, who?" required>
              <Textarea name="knownStudents" rows={3} required maxLength={2000} />
            </FormField>
          )}
          <YesNo
            name="mentoring"
            label="Are you mentoring any students this year?"
            value={mentoring}
            onChange={setMentoring}
          />
          {mentoring === "yes" && (
            <FormField name="mentoringDetails" label="Please provide details" required>
              <Textarea name="mentoringDetails" rows={3} required maxLength={2000} />
            </FormField>
          )}
          <p className="text-xs font-light text-ink-soft">
            We use this only to avoid assigning you to projects where you have a conflict.
          </p>
        </>
      ),
    },
    {
      title: "Availability",
      fields: ["availability", "notes"],
      body: (
        <>
          {availabilityOptions.length > 0 && (
            <fieldset>
              <legend className="text-sm font-medium">
                Availability{eventDateLabel ? ` on ${eventDateLabel}` : " on the event day"}
                <span className="text-red-700"> *</span>
              </legend>
              <div className="mt-3 space-y-2">
                {availabilityOptions.map((o) => (
                  <label key={o} className="flex items-start gap-3 text-sm font-light">
                    <input type="radio" name="availability" value={o} required className="mt-1 h-4 w-4 accent-brand" />
                    {o}
                  </label>
                ))}
              </div>
              <FieldError name="availability" />
            </fieldset>
          )}
          <FormField name="notes" label="Anything else we should know?" hint="Optional.">
            <Textarea name="notes" rows={3} maxLength={2000} />
          </FormField>
        </>
      ),
    },
  ];

  const last = steps.length - 1;

  function validateStep(i: number): boolean {
    const el = stepRefs.current[i];
    if (!el) return true;
    const controls = Array.from(el.querySelectorAll("input, select, textarea")) as HTMLInputElement[];
    for (const c of controls) {
      if (!c.checkValidity()) {
        c.reportValidity();
        return false;
      }
    }
    return true;
  }

  function onState(state: ActionState) {
    const names = Object.keys(state.fieldErrors ?? {});
    if (!names.length) return;
    const idx = steps.findIndex((s) => s.fields.some((f) => names.includes(f)));
    if (idx >= 0) setStep(idx);
  }

  return (
    <ActionForm action={registerJudgeAction} className="space-y-6" noValidate onState={onState}>
      <input type="hidden" name="chapter" value={chapterSlug} />

      <div>
        <div className="flex justify-between text-xs font-medium uppercase tracking-wide text-ink-soft">
          <span>
            Step {step + 1} of {steps.length}
          </span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-2 w-full bg-strip">
          <div className="h-2 bg-brand transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      {steps.map((s, i) => (
        <div
          key={s.title}
          ref={(el) => {
            stepRefs.current[i] = el;
          }}
          hidden={i !== step}
          className="space-y-5"
        >
          <h2 className="font-condensed text-2xl uppercase tracking-tight text-brand">{s.title}</h2>
          {s.body}
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-brand-pale pt-6">
        <button
          type="button"
          className={secondaryButtonClass}
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Previous
        </button>
        {step < last ? (
          <button
            type="button"
            className="inline-flex items-center justify-center bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark"
            onClick={() => {
              if (validateStep(step)) {
                setStep((s) => s + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            Next
          </button>
        ) : (
          <span
            onClickCapture={(e) => {
              if (!validateStep(step)) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <SubmitButton pendingText="Registering...">Register as a judge</SubmitButton>
          </span>
        )}
      </div>
    </ActionForm>
  );
}
