import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function env(): CloudflareEnv {
  return getCloudflareContext().env;
}

export function db(): D1Database {
  return env().DB;
}

export async function first<T>(sql: string, ...params: unknown[]): Promise<T | null> {
  return db().prepare(sql).bind(...params).first<T>();
}

export async function all<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const { results } = await db().prepare(sql).bind(...params).all<T>();
  return results;
}

export async function run(sql: string, ...params: unknown[]): Promise<D1Result> {
  return db().prepare(sql).bind(...params).run();
}

export function stmt(sql: string, ...params: unknown[]): D1PreparedStatement {
  return db().prepare(sql).bind(...params);
}

/** Runs statements atomically (D1 batches are a single transaction). */
export async function batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
  return db().batch(statements);
}

export function newId(): string {
  return crypto.randomUUID();
}

export function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function audit(
  actorId: string | null,
  chapterSlug: string | null,
  action: string,
  target?: string | null,
  detail?: string | null
): Promise<void> {
  await run(
    "INSERT INTO audit_log (actor_id, chapter_slug, action, target, detail) VALUES (?, ?, ?, ?, ?)",
    actorId,
    chapterSlug,
    action,
    target ?? null,
    detail ?? null
  );
}
