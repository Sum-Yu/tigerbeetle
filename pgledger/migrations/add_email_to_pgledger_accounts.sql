-- One-off migration: add email to pgledger_accounts (run if your DB was created before email was added).
-- Safe to run multiple times (uses IF NOT EXISTS / CREATE OR REPLACE).

ALTER TABLE pgledger_accounts
ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';

DROP VIEW IF EXISTS pgledger_accounts_view;

CREATE VIEW pgledger_accounts_view AS
SELECT
    id,
    name,
    email,
    currency,
    balance,
    version,
    allow_negative_balance,
    allow_positive_balance,
    metadata,
    created_at,
    updated_at
FROM pgledger_accounts;

CREATE OR REPLACE FUNCTION pgledger_create_account(
    name TEXT,
    email TEXT,
    currency TEXT,
    allow_negative_balance BOOLEAN DEFAULT TRUE,
    allow_positive_balance BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT NULL
)
RETURNS SETOF pgledger_accounts_view
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO pgledger_accounts (name, email, currency, allow_negative_balance, allow_positive_balance, metadata, created_at, updated_at)
    VALUES (name, COALESCE(email, ''), currency, allow_negative_balance, allow_positive_balance, metadata, now(), now())
    RETURNING *;
END;
$$ LANGUAGE plpgsql;
