// Shared form + layout primitives for the registration, dashboard and admin pages.
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export const inputClass =
  "mt-2 block w-full border-2 border-brand-pale bg-white px-3 py-2 font-normal outline-none focus:border-brand disabled:bg-strip disabled:text-ink-soft";

export const buttonClass =
  "inline-flex items-center justify-center bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center border-2 border-brand px-5 py-2.5 font-medium text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

export const smallButtonClass =
  "inline-flex items-center justify-center border-2 border-brand px-3 py-1 text-sm font-medium text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClass =
  "inline-flex items-center justify-center border-2 border-red-700 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
  width = "max-w-3xl",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  width?: string;
}) {
  return (
    <div className={`mx-auto ${width} px-4 py-14 sm:px-6`}>
      {eyebrow && (
        <p className="font-condensed text-lg uppercase tracking-tight text-brand">{eyebrow}</p>
      )}
      <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-[-0.015em] sm:text-[42px]">
        {title}
      </h1>
      {intro && <div className="mt-3 text-[17px] font-light leading-[1.6]">{intro}</div>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className = "",
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {label}
      {required && <span className="text-red-700"> *</span>}
      {children}
      {hint && <span className="mt-1 block text-xs font-light text-ink-soft">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-700">{error}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${inputClass} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error" | "warning";
  children: ReactNode;
}) {
  const styles = {
    info: "border-brand-pale bg-strip",
    success: "border-green-700 bg-green-50 text-green-900",
    error: "border-red-700 bg-red-50 text-red-900",
    warning: "border-amber-600 bg-amber-50 text-amber-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`border-l-4 px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function Card({ title, children, actions }: { title?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="border-2 border-brand-pale bg-white p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-condensed text-xl uppercase tracking-tight text-brand">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-green-100 text-green-900",
  rejected: "bg-red-100 text-red-900",
  withdrawn: "bg-gray-200 text-gray-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${statusStyles[status] ?? "bg-strip"}`}
    >
      {status}
    </span>
  );
}

export function DefinitionList({ items }: { items: [ReactNode, ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[200px_1fr]">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="font-medium text-ink-soft">{k}</dt>
          <dd className="break-words font-light">{v === null || v === undefined || v === "" ? "—" : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand underline hover:text-brand-dark">
      {children}
    </Link>
  );
}
