-- Correção rápida — use se a migration-v2 falhou no passo de UPDATE
-- (constraints antigas ainda bloqueiam status 'concluido' e tipos novos)

ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_type_check;
ALTER TABLE demands DROP CONSTRAINT IF EXISTS demands_status_check;

UPDATE demands SET status = 'concluido' WHERE status = 'finalizada';
UPDATE demands SET type = 'tracking' WHERE type = 'TMS';
UPDATE demands SET type = 'tracking_conversao' WHERE type = 'TMS+CSV';

ALTER TABLE demands ADD CONSTRAINT demands_type_check CHECK (type IN (
  'tracking', 'conversao', 'pdf', 'tracking_conversao', 'atualizacao_status'
));

ALTER TABLE demands ADD CONSTRAINT demands_status_check CHECK (status IN (
  'pendente', 'em_atendimento', 'concluido', 'cancelada'
));
