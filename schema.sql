-- ===================================================
-- PARALLAX v1 - SQLite Database Schema
-- ===================================================
-- This schema defines the local data store used by
-- the Fastify API server, Playwright worker, and
-- React dashboard.
-- ---------------------------------------------------

PRAGMA foreign_keys = ON;

-- ===================================================
-- 1. API KEYS
-- ===================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,            -- UUID
  key_hash TEXT UNIQUE NOT NULL,  -- sha256(key)
  name TEXT,                      -- Label like "obsidian" or "cursor"
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);

-- ===================================================
-- 2. SESSIONS (persistent login cookies)
-- ===================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,            -- session_<uuid>
  cookies_json TEXT NOT NULL,     -- serialized browser cookies (JSON array)
  user_agent TEXT,
  valid BOOLEAN DEFAULT 1,
  created_at INTEGER NOT NULL,
  expires_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sessions_valid ON sessions(valid);

-- ===================================================
-- 3. CONVERSATIONS (mapped to Perplexity threads)
-- ===================================================
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,             -- conv_<uuid> or custom name
  perplexity_thread_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  app_name TEXT,                   -- e.g. Obsidian, Cursor, n8n
  api_key_id TEXT,
  message_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_message_at INTEGER,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversations_app ON conversations(app_name);
CREATE INDEX IF NOT EXISTS idx_conversations_thread ON conversations(perplexity_thread_url);

-- ===================================================
-- 4. MESSAGES (stored conversation content)
-- ===================================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,             -- msg_<uuid>
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,           -- Markdown text or prompt
  sources_json TEXT,               -- [{title,url,favicon,image_url}]
  created_at INTEGER NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- ===================================================
-- 5. JOBS (execution queue)
-- ===================================================
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(
    status IN ('pending','running','completed','failed',
               'failed_timeout','failed_captcha','pending_session')),
  prompt TEXT NOT NULL,
  conversation_id TEXT,
  result_json TEXT,               -- serialized job result
  error_message TEXT,
  debug_artifacts_json TEXT,      -- screenshot/html dump references
  retry_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- ===================================================
-- 6. METADATA (persistent worker stats)
-- ===================================================
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ===================================================
-- DEFAULT DATA: initial admin API key placeholder
-- ===================================================
INSERT OR IGNORE INTO api_keys (id, key_hash, name, created_at)
VALUES ('key_seed','seed_placeholder_hash','default',strftime('%s','now'));

-- ===================================================
-- END OF SCHEMA
-- ===================================================
