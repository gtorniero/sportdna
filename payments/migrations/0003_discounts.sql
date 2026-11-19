-- Cupons de desconto do SPORT DNA (ex.: ARBO50). Guarda só o hash do código; percentual de 1 a 90; produtos em JSON.
CREATE TABLE IF NOT EXISTS discount_codes (hash TEXT PRIMARY KEY, code TEXT NOT NULL, percent INTEGER NOT NULL, products TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, expires INTEGER, created INTEGER NOT NULL);
-- Percentual de desconto aplicado ao pedido (NULL = preço cheio).
ALTER TABLE orders ADD COLUMN discount INTEGER;
