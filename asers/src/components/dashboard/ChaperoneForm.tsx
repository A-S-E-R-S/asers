"use client";

import { useState } from "react";
import ActionForm from "@/components/ActionForm";
import SubmitButton from "@/components/SubmitButton";
import { Field, Input, secondaryButtonClass } from "@/components/ui";
import { updateChaperoneAction } from "@/app/actions/dashboard";
import type { Chaperone } from "@/lib/registrations";

export default function ChaperoneForm({
  chapterSlug,
  current,
  sraPhone,
}: {
  chapterSlug: string;
  current: Chaperone | undefined;
  sraPhone: string | null;
}) {
  const [self, setSelf] = useState(current?.self ?? false);
  return (
    <ActionForm action={updateChaperoneAction} className="space-y-4">
      <input type="hidden" name="chapter" value={chapterSlug} />
      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="self"
          checked={self}
          onChange={(e) => setSelf(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        I will be the chaperone myself
      </label>
      {!self && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Chaperone name" required className="sm:col-span-2">
            <Input name="name" defaultValue={current && !current.self ? current.name : ""} required maxLength={120} />
          </Field>
          <Field label="Email" required>
            <Input name="email" type="email" defaultValue={current && !current.self ? current.email : ""} required maxLength={254} />
          </Field>
          <Field label="Cell phone (event day)" required>
            <Input name="phone" type="tel" defaultValue={current && !current.self ? current.phone : ""} required maxLength={40} />
          </Field>
        </div>
      )}
      {self && (
        <Field label="Your cell phone (event day)" required>
          <Input name="phone" type="tel" defaultValue={current?.self ? current.phone : sraPhone ?? ""} required maxLength={40} />
        </Field>
      )}
      <SubmitButton className={secondaryButtonClass}>Save chaperone</SubmitButton>
    </ActionForm>
  );
}
