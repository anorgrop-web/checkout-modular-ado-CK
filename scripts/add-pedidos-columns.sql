-- Adiciona colunas faltantes na tabela pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS metodo_pagamento text DEFAULT 'pix',
  ADD COLUMN IF NOT EXISTS valor numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transaction_id text;

-- Índice para facilitar buscas por período e método
CREATE INDEX IF NOT EXISTS idx_pedidos_data_compra ON public.pedidos (data_compra);
CREATE INDEX IF NOT EXISTS idx_pedidos_metodo ON public.pedidos (metodo_pagamento);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON public.pedidos (status);
