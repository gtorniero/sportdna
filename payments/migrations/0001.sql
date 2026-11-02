CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, product TEXT NOT NULL,
 provider TEXT NOT NULL, amount INTEGER NOT NULL, mode TEXT NOT NULL,
 provider_id TEXT UNIQUE, state TEXT NOT NULL DEFAULT 'creating',
 checkout_url TEXT, pix_code TEXT, pix_image TEXT,
 created_at INTEGER NOT NULL, checked_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS orders_provider ON orders(provider, provider_id);
CREATE TABLE IF NOT EXISTS rate_limits (id TEXT PRIMARY KEY, count INTEGER NOT NULL);
