-- Execute este script no SQL Editor do Supabase

-- Tabela de atendentes
CREATE TABLE IF NOT EXISTS attendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de demandas
CREATE TABLE IF NOT EXISTS demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  demand_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TMS', 'TMS+CSV')),
  requester TEXT NOT NULL,
  attendant_id UUID REFERENCES attendants(id) ON DELETE SET NULL,
  service_time TIME,
  completion_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_atendimento', 'finalizada')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_demands_date ON demands(date DESC);
CREATE INDEX IF NOT EXISTS idx_demands_status ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_attendant_id ON demands(attendant_id);

-- Habilitar RLS
ALTER TABLE attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (ajuste conforme necessidade de autenticação)
CREATE POLICY "Permitir leitura pública de atendentes"
  ON attendants FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública de atendentes"
  ON attendants FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de atendentes"
  ON attendants FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão pública de atendentes"
  ON attendants FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de demandas"
  ON demands FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública de demandas"
  ON demands FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de demandas"
  ON demands FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão pública de demandas"
  ON demands FOR DELETE USING (true);
