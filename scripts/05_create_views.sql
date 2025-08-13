-- Views úteis para relatórios

-- View de cartões ativos
CREATE VIEW active_parking_cards AS
SELECT 
    id,
    military_name,
    rank,
    war_name,
    vehicle_plate,
    vehicle_model,
    vehicle_color,
    vehicle_type,
    issue_type,
    valid_until,
    CASE 
        WHEN valid_until < CURDATE() THEN 'VENCIDO'
        WHEN valid_until <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'VENCE_EM_7_DIAS'
        ELSE 'VALIDO'
    END as validity_status,
    created_at,
    updated_at
FROM parking_cards 
WHERE status = 'active';

-- View de estatísticas
CREATE VIEW parking_statistics AS
SELECT 
    COUNT(*) as total_cards,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_cards,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_cards,
    SUM(CASE WHEN issue_type = 'provisorio' THEN 1 ELSE 0 END) as provisional_cards,
    SUM(CASE WHEN issue_type = 'definitivo' THEN 1 ELSE 0 END) as definitive_cards,
    SUM(CASE WHEN valid_until < CURDATE() AND status = 'active' THEN 1 ELSE 0 END) as expired_cards,
    SUM(CASE WHEN vehicle_type = 'Carro' THEN 1 ELSE 0 END) as cars,
    SUM(CASE WHEN vehicle_type = 'Moto' THEN 1 ELSE 0 END) as motorcycles
FROM parking_cards;

-- View de cartões próximos ao vencimento
CREATE VIEW expiring_cards AS
SELECT 
    id,
    military_name,
    rank,
    war_name,
    vehicle_plate,
    valid_until,
    DATEDIFF(valid_until, CURDATE()) as days_until_expiry
FROM parking_cards 
WHERE status = 'active' 
AND valid_until BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY valid_until ASC;

-- Novas views para sistema de usuários
-- View de usuários ativos
CREATE VIEW active_users AS
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    last_login,
    created_at
FROM users 
WHERE status = 'active';

-- View de estatísticas de usuários
CREATE VIEW user_statistics AS
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
    SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
    SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
    SUM(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active_last_30_days
FROM users;

-- View de auditoria recente
CREATE VIEW recent_audit_log AS
SELECT 
    'parking_card' as entity_type,
    pca.card_id as entity_id,
    pca.action,
    pca.changed_by,
    pca.changed_at,
    pc.military_name as entity_name
FROM parking_cards_audit pca
LEFT JOIN parking_cards pc ON pca.card_id = pc.id
UNION ALL
SELECT 
    'user' as entity_type,
    ua.user_id as entity_id,
    ua.action,
    ua.changed_by,
    ua.changed_at,
    u.full_name as entity_name
FROM users_audit ua
LEFT JOIN users u ON ua.user_id = u.id
ORDER BY changed_at DESC
LIMIT 100;
