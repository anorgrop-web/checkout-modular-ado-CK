-- Garante que a coluna transaction_id existe e tem índice para busca rápida no webhook
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS transaction_id TEXT;
CREATE INDEX IF NOT EXISTS idx_pedidos_transaction_id ON pedidos(transaction_id);
