"use client";

import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import type { ActionState } from "@/lib/form";
import { Alert } from "@/components/ui";

const PendingContext = createContext(false);
const StateContext = createContext<ActionState>({});

export function useActionPending(): boolean {
  return useContext(PendingContext);
}

/** Field errors from the closest ActionForm. */
export function useFieldErrors(): Record<string, string> {
  return useContext(StateContext).fieldErrors ?? {};
}

/**
 * A <form> bound to a server action that shows its error/success message.
 * Submits through onSubmit (not the `action` prop) so React doesn't reset the
 * user's input when the server returns a validation error.
 */
export default function ActionForm({
  action,
  children,
  className = "space-y-5",
  resetOnSuccess = false,
  scrollToError = false,
  noValidate = false,
  onState,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  scrollToError?: boolean;
  noValidate?: boolean;
  /** Called whenever the action returns a new state. */
  onState?: (state: ActionState) => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state.ok) ref.current?.reset();
  }, [state.ok, resetOnSuccess]);

  useEffect(() => {
    onState?.(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (scrollToError && state.error) alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state, scrollToError]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => formAction(fd));
  }

  return (
    <PendingContext.Provider value={pending}>
      <StateContext.Provider value={state}>
        <form ref={ref} onSubmit={onSubmit} className={className} noValidate={noValidate}>
          <div ref={alertRef} className="empty:hidden">
            {state.error && <Alert tone="error">{state.error}</Alert>}
            {state.message && <Alert tone="success">{state.message}</Alert>}
          </div>
          {children}
        </form>
      </StateContext.Provider>
    </PendingContext.Provider>
  );
}
