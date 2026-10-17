-- Chapter-scoped live judging rounds, assignments, and rubric submissions.
CREATE TABLE IF NOT EXISTS judging_rounds (
  id TEXT PRIMARY KEY,
  chapter_slug TEXT NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('oral', 'poster', 'final')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (chapter_slug, name)
);

CREATE TABLE IF NOT EXISTS judge_assignments (
  id TEXT PRIMARY KEY,
  round_id TEXT NOT NULL REFERENCES judging_rounds(id) ON DELETE CASCADE,
  judge_registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room TEXT NOT NULL DEFAULT '',
  session_label TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (round_id, judge_registration_id, project_id)
);

CREATE TABLE IF NOT EXISTS judge_scores (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL UNIQUE REFERENCES judge_assignments(id) ON DELETE CASCADE,
  scores TEXT NOT NULL DEFAULT '{}',
  comments TEXT NOT NULL DEFAULT '',
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS judge_assignments_judge ON judge_assignments(judge_registration_id, round_id);
CREATE INDEX IF NOT EXISTS judge_assignments_project ON judge_assignments(project_id, round_id);
