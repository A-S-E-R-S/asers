"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import type { ActionState } from "@/lib/form";
import { smallButtonClass } from "@/components/ui";

/** A one-button form for table rows (approve, mark paid, ...). Errors show as a small line below. */
export default function InlineAction({
  action,
  fields,
  label,
  pendingLabel = "...",
  className = smallButtonClass,
  confirm,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  className?: string;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }
  return (
    <form onSubmit={onSubmit} className="inline-block">
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" disabled={pending} className={className}>
        {pending ? pendingLabel : label}
      </button>
      {state.error && <span className="mt-1 block text-xs text-red-700">{state.error}</span>}
    </form>
  );
}
