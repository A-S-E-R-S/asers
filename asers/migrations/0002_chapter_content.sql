-- Public chapter sections managed by chapter admins.
ALTER TABLE chapters ADD COLUMN local_rules TEXT NOT NULL DEFAULT '';
ALTER TABLE chapters ADD COLUMN photos TEXT NOT NULL DEFAULT '[]';
