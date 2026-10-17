-- Each chapter can define its own project categories.
ALTER TABLE chapters ADD COLUMN categories TEXT NOT NULL DEFAULT '[]';
