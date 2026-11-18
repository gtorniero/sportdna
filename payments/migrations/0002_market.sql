-- Mercado (país) do pedido internacional de teste: US, GB, CA ou AU. Pedidos brasileiros ficam NULL.
ALTER TABLE orders ADD COLUMN market TEXT;
