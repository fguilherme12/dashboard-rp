-- Migração v2 — execute se já rodou o schema antigo

-- 1. Tabela de solicitantes
CREATE TABLE IF NOT EXISTS requesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE requesters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Permitir leitura pública de solicitantes"
    ON requesters FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Permitir inserção pública de solicitantes"
    ON requesters FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Permitir atualização pública de solicitantes"
    ON requesters FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Permitir exclusão pública de solicitantes"
    ON requesters FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Seed solicitantes
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

-- 3. Coluna requester_id
ALTER TABLE demands ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES requesters(id) ON DELETE SET NULL;

-- Migrar texto antigo para FK (se existir coluna requester)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'demands' AND column_name = 'requester'
  ) THEN
    UPDATE demands d
    SET requester_id = r.id
    FROM requesters r
    WHERE d.requester = r.name AND d.requester_id IS NULL;

    INSERT INTO requesters (name)
    SELECT DISTINCT d.requester FROM demands d
    WHERE d.requester IS NOT NULL AND d.requester <> ''
      AND NOT EXISTS (SELECT 1 FROM requesters r WHERE r.name = d.requester)
    ON CONFLICT (name) DO NOTHING;

    UPDATE demands d
    SET requester_id = r.id
    FROM requesters r
    WHERE d.requester = r.name AND d.requester_id IS NULL;

    ALTER TABLE demands DROP COLUMN requester;
  END IF;
END $$;

-- 4. Remover constraints antigas ANTES de atualizar os dados
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_type_check;
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_status_check;

-- 5. Atualizar status e tipos legados
UPDATE demands SET status = 'concluido' WHERE status = 'finalizada';
UPDATE demands SET type = 'tracking' WHERE type = 'TMS';
UPDATE demands SET type = 'tracking_conversao' WHERE type = 'TMS+CSV';

-- 6. Recriar constraints com os novos valores
ALTER TABLE demands ADD CONSTRAINT demands_type_check CHECK (type IN (
  'tracking', 'conversao', 'pdf', 'tracking_conversao', 'atualizacao_status'
));

ALTER TABLE demands ADD CONSTRAINT demands_status_check CHECK (status IN (
  'pendente', 'em_atendimento', 'concluido', 'cancelada'
));

CREATE INDEX IF NOT EXISTS idx_demands_requester_id ON demands(requester_id);
