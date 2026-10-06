"use client";

import { useState } from "react";
import FormField, { FieldError } from "@/components/FormField";
import { Input, Select, Textarea } from "@/components/ui";
import {
  DESCRIPTION_MAX_WORDS,
  DOMAINS,
  FOCUSES,
  MAX_DOMAINS,
  METHOD_GROUPS,
  wordCount,
} from "@/lib/options";

export type ProjectDefaults = {
  title: string;
  description: string;
  domains: string[];
  methods: string[];
  focus: string;
  focusOther: string;
};

/** Project title, description and classification. Shared by registration and the student dashboard. */
export default function ProjectFields({ defaults, disabled }: { defaults?: ProjectDefaults; disabled?: boolean }) {
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [domains, setDomains] = useState<string[]>(defaults?.domains ?? []);
  const [focus, setFocus] = useState(defaults?.focus ?? "");
  const words = wordCount(description);

  return (
    <div className="space-y-6">
      <FormField name="title" label="Project title" required>
        <Input name="title" required maxLength={200} defaultValue={defaults?.title} disabled={disabled} />
      </FormField>

      <FormField
        name="description"
        label={`Brief description of your project (${DESCRIPTION_MAX_WORDS} words max)`}
        required
        hint={
          <span className={words > DESCRIPTION_MAX_WORDS ? "font-medium text-red-700" : ""}>
            Word count: {words} / {DESCRIPTION_MAX_WORDS}
          </span>
        }
      >
        <Textarea
          name="description"
          rows={6}
          required
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={disabled}
        />
      </FormField>

      <fieldset>
        <legend className="text-sm font-medium">
          Primary scientific domain<span className="text-red-700"> *</span>
        </legend>
        <p className="mt-1 text-xs font-light text-ink-soft">
          Select up to {MAX_DOMAINS} that best represent your project. Selected: {domains.length}
        </p>
        <div className="mt-3 space-y-2">
          {DOMAINS.map((d) => {
            const checked = domains.includes(d);
            return (
              <label key={d} className="flex items-start gap-3 text-sm font-light">
                <input
                  type="checkbox"
                  name="domains"
                  value={d}
                  checked={checked}
                  disabled={disabled || (!checked && domains.length >= MAX_DOMAINS)}
                  onChange={() => setDomains(checked ? domains.filter((x) => x !== d) : [...domains, d])}
                  className="mt-1 h-4 w-4 accent-brand"
                />
                {d}
              </label>
            );
          })}
        </div>
        <FieldError name="domains" />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">
          Experimental methodology used<span className="text-red-700"> *</span>
        </legend>
        <p className="mt-1 text-xs font-light text-ink-soft">Select all that apply.</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2">
          {METHOD_GROUPS.map((g) => (
            <div key={g.group}>
              <p className="text-sm font-medium text-brand">{g.group}</p>
              <div className="mt-2 space-y-2">
                {g.options.map((m) => (
                  <label key={m} className="flex items-start gap-3 text-sm font-light">
                    <input
                      type="checkbox"
                      name="methods"
                      value={m}
                      defaultChecked={defaults?.methods.includes(m)}
                      disabled={disabled}
                      className="mt-1 h-4 w-4 accent-brand"
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <FieldError name="methods" />
      </fieldset>

      <FormField
        name="focus"
        label="Primary real-world focus: what problem or scientific objective does your work address?"
        required
      >
        <Select name="focus" required value={focus} onChange={(e) => setFocus(e.target.value)} disabled={disabled}>
          <option value="">Select a focus...</option>
          {FOCUSES.map((f) => (
            <option key={f} value={f}>
              {f === "Other" ? "Other (please specify)" : f}
            </option>
          ))}
        </Select>
      </FormField>
      {focus === "Other" && (
        <FormField name="focusOther" label="Other focus" required>
          <Input name="focusOther" required maxLength={200} defaultValue={defaults?.focusOther} disabled={disabled} />
        </FormField>
      )}
    </div>
  );
}
