-- Schema completo — execute no SQL Editor do Supabase (projeto novo)

CREATE TABLE IF NOT EXISTS attendants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  demand_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'tracking', 'conversao', 'pdf', 'tracking_conversao', 'atualizacao_status'
  )),
  requester_id UUID REFERENCES requesters(id) ON DELETE SET NULL,
  attendant_id UUID REFERENCES attendants(id) ON DELETE SET NULL,
  service_time TIME,
  completion_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'em_atendimento', 'concluido', 'cancelada'
  )),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demands_date ON demands(date DESC);
CREATE INDEX IF NOT EXISTS idx_demands_status ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_attendant_id ON demands(attendant_id);
CREATE INDEX IF NOT EXISTS idx_demands_requester_id ON demands(requester_id);

ALTER TABLE attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE demands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de atendentes"
  ON attendants FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de atendentes"
  ON attendants FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de atendentes"
  ON attendants FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública de atendentes"
  ON attendants FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de solicitantes"
  ON requesters FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de solicitantes"
  ON requesters FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de solicitantes"
  ON requesters FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública de solicitantes"
  ON requesters FOR DELETE USING (true);

CREATE POLICY "Permitir leitura pública de demandas"
  ON demands FOR SELECT USING (true);
CREATE POLICY "Permitir inserção pública de demandas"
  ON demands FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização pública de demandas"
  ON demands FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão pública de demandas"
  ON demands FOR DELETE USING (true);

-- Solicitantes iniciais
INSERT INTO requesters (name) VALUES
  ('Adriano Correia'), ('Adriano Luz'), ('Alceu Filho'), ('Alexandro Silva'),
  ('Amanda Silva'), ('Ana Carla'), ('Ariane Januario'), ('Arlete Fraga'),
  ('Dagmara Amorim'), ('Daniel Filho'), ('Douglas Oliveira'), ('Edilaine Bandeira'),
  ('Emanoelli Vitória'), ('Fernanda Nunes'), ('Filipe Silva'), ('Gabrielaa Fagundes'),
  ('Gleydson Saraiva'), ('Guilherme Werpp'), ('Hugo Leonardo'), ('Jairo Rodrigues'),
  ('Jessica Dias'), ('Jessica Reis'), ('João Carlos'), ('Lucas Martins'),
  ('Luiza Araujo'), ('Luma Amorim'), ('Magna Marques'), ('Marivaldo Silva'),
  ('Matheus Mendes'), ('Matheus Padilha'), ('Mônica Melo'), ('Nilza Jungklaus'),
  ('Pablo Ferreira'), ('Pedro Rodrigues'), ('Robert Emanuel'), ('Sammia Cordeiro'),
  ('Theisy Vieira'), ('Tiago Santos'), ('Vanessa Fagundes'), ('Wallacy Nascimento')
ON CONFLICT (name) DO NOTHING;
