-- Registration + admin schema for asers.org.
-- Apply with: npm run db:migrate:local  /  npm run db:migrate:remote

-- Chapters are the unit everything else hangs off. Public page content and
-- registration settings live here so chapter admins can edit them in /admin.
CREATE TABLE chapters (
  slug TEXT PRIMARY KEY,
  subdomain TEXT UNIQUE,
  name TEXT NOT NULL,                -- state / region, e.g. "New Jersey"
  short_name TEXT NOT NULL,          -- e.g. "NJSRS"
  full_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',    -- longer page body; blank lines separate paragraphs
  announcement TEXT NOT NULL DEFAULT '',
  site TEXT,
  contact_email TEXT,
  venue TEXT,
  founded TEXT,
  event_date TEXT,                   -- YYYY-MM-DD
  event_details TEXT NOT NULL DEFAULT '',
  registration_deadline TEXT,        -- YYYY-MM-DD, shown to registrants
  student_fee TEXT NOT NULL DEFAULT '',
  student_reg_open INTEGER NOT NULL DEFAULT 0,
  sra_reg_open INTEGER NOT NULL DEFAULT 0,
  judge_reg_open INTEGER NOT NULL DEFAULT 0,
  judge_availability TEXT NOT NULL DEFAULT '[]',  -- JSON array of option labels
  published INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- One account per person (email). A person can hold registrations in several
-- chapters (e.g. a remote judge), but only one per chapter.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,        -- stored lowercased
  password_hash TEXT,                -- NULL until an invited team partner sets one
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email_verified_at TEXT,
  is_national_admin INTEGER NOT NULL DEFAULT 0,
  disabled INTEGER NOT NULL DEFAULT 0,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,               -- sha256(token); the raw token only lives in the cookie
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,       -- unix ms
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX sessions_user ON sessions(user_id);

-- Email verification codes and password-reset tokens (hashed).
CREATE TABLE auth_codes (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, purpose)
);
CREATE INDEX auth_codes_hash ON auth_codes(code_hash);

-- Fixed-window counters for login / code throttling.
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

CREATE TABLE chapter_admins (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_slug TEXT NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, chapter_slug)
);

-- Schools are per chapter and created by SRAs when they register.
CREATE TABLE schools (
  id TEXT PRIMARY KEY,
  chapter_slug TEXT NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  name TEXT NOT NULL COLLATE NOCASE,
  town TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (chapter_slug, name)
);

-- A project is shared by the 1-2 students on it.
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  chapter_slug TEXT NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  domains TEXT NOT NULL DEFAULT '[]',
  methods TEXT NOT NULL DEFAULT '[]',
  focus TEXT NOT NULL DEFAULT '',
  focus_other TEXT NOT NULL DEFAULT '',
  is_team INTEGER NOT NULL DEFAULT 0,
  project_code TEXT,                 -- admin-assigned ID, e.g. "LS-04"
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_slug TEXT NOT NULL REFERENCES chapters(slug) ON DELETE CASCADE ON UPDATE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'sra', 'judge')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  school_id TEXT REFERENCES schools(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  data TEXT NOT NULL DEFAULT '{}',   -- role-specific answers (JSON)
  payment_received INTEGER NOT NULL DEFAULT 0,
  admin_notes TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, chapter_slug)
);
CREATE INDEX registrations_chapter ON registrations(chapter_slug, role, status);
CREATE INDEX registrations_school ON registrations(school_id);
CREATE INDEX registrations_project ON registrations(project_id);

CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id TEXT,
  chapter_slug TEXT,
  action TEXT NOT NULL,
  target TEXT,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_log_chapter ON audit_log(chapter_slug, id);

-- Founding chapter (was src/data/chapters.ts).
INSERT INTO chapters (
  slug, subdomain, name, short_name, full_name, description, site, contact_email,
  venue, founded, student_fee, judge_availability, published, sort_order
) VALUES (
  'new-jersey', 'nj', 'New Jersey', 'NJSRS', 'New Jersey Science Research Symposium',
  'Our founding chapter. NJSRS is a premier science research competition open to any high school student attending a public or private high school in New Jersey, featuring oral presentations judged by STEM professionals, a finals round, a poster session, and sponsored special awards.',
  'https://njsrs.org', 'fairdirector@njsrs.org',
  'Millburn High School, 462 Millburn Ave, Millburn, NJ 07041', '2025', '$30 per student',
  '["In Person (Full Day, 8:30 AM - 3:30 PM)","In Person (Morning Only, 8:30 AM - 12:00 PM)","Remote (Morning Only, 8:30 AM - 12:00 PM)"]',
  1, 0
);
