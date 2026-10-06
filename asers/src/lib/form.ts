// Helpers for reading and validating FormData in server actions.

export type ActionState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Bumps on every successful submit so client forms can reset. */
  ok?: number;
};

export function str(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Like str() but keeps internal whitespace/newlines and trims only the ends. */
export function text(fd: FormData, key: string, max = 5000): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

export function list(fd: FormData, key: string, max = 50): string[] {
  return fd
    .getAll(key)
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isEmail(v: string): boolean {
  return v.length <= 254 && EMAIL_RE.test(v);
}

export function isPhone(v: string): boolean {
  return v.replace(/\D/g, "").length >= 10;
}

export function isISODate(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}
