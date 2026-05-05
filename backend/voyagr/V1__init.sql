-- ─────────────────────────────────────────────────────────────────────────────
-- V1__init.sql — Initial schema for Voyagr.
--
-- Mirrors the schema documented in ARCHITECTURE.md. JSONB used for messages
-- so we can store the full conversation array without a separate join table
-- (matches the documented design).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ─── users ────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,        -- bcrypt
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (LOWER(email));

-- ─── user_preferences ─────────────────────────────────────────────────────────
CREATE TABLE user_preferences (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    travel_style    VARCHAR(64),                  -- nature | culture | adventure | relaxation
    budget_range    VARCHAR(64),                  -- budget | mid | luxury
    dietary_prefs   TEXT[],                       -- e.g. {'vegetarian','gluten-free'}
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── refresh_tokens ───────────────────────────────────────────────────────────
-- Tokens are stored as SHA-256 hashes (never plaintext). Lookup is by hash.
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id   ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);

-- ─── conversations ────────────────────────────────────────────────────────────
-- One row per conversation. `messages` holds the entire ordered history as JSONB.
-- A user may have multiple conversations over time.
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    messages        JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id    ON conversations (user_id);
CREATE INDEX idx_conversations_updated_at ON conversations (updated_at DESC);
