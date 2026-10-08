"use client";

import type { ReactNode } from "react";
import { useFieldErrors } from "@/components/ActionForm";
import { Field } from "@/components/ui";

/** Field that shows the server-side error for `name` from the enclosing ActionForm. */
export default function FormField({
  name,
  label,
  required,
  hint,
  children,
  className,
}: {
  name: string;
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const errors = useFieldErrors();
  return (
    <Field label={label} required={required} hint={hint} error={errors[name]} className={className}>
      {children}
    </Field>
  );
}

/** Error line for groups (checkbox/radio sets) that aren't wrapped in a single label. */
export function FieldError({ name }: { name: string }) {
  const error = useFieldErrors()[name];
  return error ? <p className="mt-1 text-xs font-medium text-red-700">{error}</p> : null;
}
