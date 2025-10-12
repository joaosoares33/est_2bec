-- Queries úteis para o Sistema de Estacionamento do 2º BEC
-- Versão: 1.0

USE estacionamento_2bec;

-- Listar todos os cartões ativos
SELECT 
  id,
  military_name,
  rank,
  war_name,
  vehicle_plate,
  vehicle_model,
  vehicle_type,
  issue_type,
  valid_until,
  status,
  created_at
FROM parking_cards
WHERE status = 'active'
ORDER BY created_at DESC;

-- Listar cartões próximos ao vencimento (30 dias)
SELECT 
  id,
  military_name,
  rank,
  war_name,
  vehicle_plate,
  valid_until,
  DATEDIFF(valid_until, CURDATE()) as dias_restantes
FROM parking_cards
WHERE status = 'active'
  AND valid_until BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY valid_until ASC;

-- Listar cartões vencidos
SELECT 
  id,
  military_name,
  rank,
  war_name,
  vehicle_plate,
  valid_until,
  DATEDIFF(CURDATE(), valid_until) as dias_vencidos
FROM parking_cards
WHERE status = 'active'
  AND valid_until < CURDATE()
ORDER BY valid_until ASC;

-- Contar cartões por tipo de veículo
SELECT 
  vehicle_type,
  COUNT(*) as total
FROM parking_cards
WHERE status = 'active'
GROUP BY vehicle_type
ORDER BY total DESC;

-- Contar cartões por tipo de emissão
SELECT 
  issue_type,
  COUNT(*) as total
FROM parking_cards
WHERE status = 'active'
GROUP BY issue_type;

-- Buscar cartão por placa
SELECT *
FROM parking_cards
WHERE vehicle_plate = 'ABC-1234';

-- Buscar cartões por nome de guerra
SELECT *
FROM parking_cards
WHERE war_name LIKE '%Silva%'
  AND status = 'active';

-- Histórico de alterações de um cartão específico
SELECT 
  h.action,
  h.changed_at,
  u.full_name as changed_by_name,
  h.old_data,
  h.new_data
FROM parking_cards_history h
LEFT JOIN users u ON h.changed_by = u.id
WHERE h.card_id = 'ID_DO_CARTAO'
ORDER BY h.changed_at DESC;

-- Estatísticas gerais
SELECT 
  COUNT(*) as total_cartoes,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inativos,
  SUM(CASE WHEN valid_until < CURDATE() AND status = 'active' THEN 1 ELSE 0 END) as vencidos,
  SUM(CASE WHEN valid_until BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'active' THEN 1 ELSE 0 END) as proximos_vencimento
FROM parking_cards;
