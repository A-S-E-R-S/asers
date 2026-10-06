"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui";
import { useActionPending } from "@/components/ActionForm";

export default function SubmitButton({
  children,
  pendingText = "Saving...",
  className = buttonClass,
  disabled,
  name,
  value,
  confirm,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  /** If set, asks the user to confirm before submitting. */
  confirm?: string;
}) {
  // ActionForm submits via a transition, plain <form action> via form status.
  const actionPending = useActionPending();
  const { pending: formPending } = useFormStatus();
  const pending = actionPending || formPending;
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      className={className}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
