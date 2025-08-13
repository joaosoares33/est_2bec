-- Stored Procedures úteis

DELIMITER //

-- Procedure para renovar cartão
CREATE PROCEDURE RenewParkingCard(
    IN p_card_id VARCHAR(36),
    IN p_new_issue_type ENUM('provisorio', 'definitivo'),
    IN p_updated_by VARCHAR(36)
)
BEGIN
    DECLARE new_valid_until DATE;
    
    -- Calcular nova data de validade
    IF p_new_issue_type = 'provisorio' THEN
        SET new_valid_until = DATE_ADD(CURDATE(), INTERVAL 30 DAY);
    ELSE
        SET new_valid_until = DATE_ADD(CURDATE(), INTERVAL 1 YEAR);
    END IF;
    
    -- Atualizar cartão
    UPDATE parking_cards 
    SET 
        issue_type = p_new_issue_type,
        valid_until = new_valid_until,
        updated_by = p_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_card_id;
    
    SELECT ROW_COUNT() as affected_rows;
END//

-- Procedure para relatório de cartões vencidos
CREATE PROCEDURE GetExpiredCards()
BEGIN
    SELECT 
        id,
        military_name,
        rank,
        war_name,
        vehicle_plate,
        vehicle_model,
        issue_type,
        valid_until,
        DATEDIFF(CURDATE(), valid_until) as days_expired,
        created_at
    FROM parking_cards 
    WHERE status = 'active' 
    AND valid_until < CURDATE()
    ORDER BY valid_until ASC;
END//

-- Novas procedures para sistema de usuários
-- Procedure para criar usuário com hash de senha
CREATE PROCEDURE CreateUser(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_full_name VARCHAR(100),
    IN p_role ENUM('admin', 'user'),
    IN p_created_by VARCHAR(36)
)
BEGIN
    DECLARE new_user_id VARCHAR(36);
    SET new_user_id = UUID();
    
    INSERT INTO users (
        id, username, email, password, full_name, role, status
    ) VALUES (
        new_user_id, p_username, p_email, p_password, p_full_name, p_role, 'active'
    );
    
    SELECT new_user_id as user_id, ROW_COUNT() as affected_rows;
END//

-- Procedure para autenticar usuário
CREATE PROCEDURE AuthenticateUser(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE user_found INT DEFAULT 0;
    DECLARE user_id_found VARCHAR(36);
    
    SELECT COUNT(*), id INTO user_found, user_id_found
    FROM users 
    WHERE username = p_username 
    AND password = p_password 
    AND status = 'active';
    
    IF user_found > 0 THEN
        -- Atualizar último login
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = user_id_found;
        
        -- Registrar login na auditoria
        INSERT INTO users_audit (user_id, action, changed_by) 
        VALUES (user_id_found, 'LOGIN', user_id_found);
        
        -- Retornar dados do usuário
        SELECT id, username, email, full_name, role, status, last_login
        FROM users 
        WHERE id = user_id_found;
    ELSE
        SELECT NULL as id, 'Invalid credentials' as error;
    END IF;
END//

-- Procedure para limpeza de sessões expiradas
CREATE PROCEDURE CleanExpiredSessions()
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    SELECT ROW_COUNT() as cleaned_sessions;
END//

-- Procedure para relatório de atividade de usuários
CREATE PROCEDURE GetUserActivityReport(
    IN p_days_back INT DEFAULT 30
)
BEGIN
    SELECT 
        u.id,
        u.username,
        u.full_name,
        u.role,
        u.last_login,
        COUNT(ua.id) as total_actions,
        SUM(CASE WHEN ua.action = 'LOGIN' THEN 1 ELSE 0 END) as login_count,
        MAX(ua.changed_at) as last_activity
    FROM users u
    LEFT JOIN users_audit ua ON u.id = ua.user_id 
        AND ua.changed_at >= DATE_SUB(CURRENT_DATE, INTERVAL p_days_back DAY)
    WHERE u.status = 'active'
    GROUP BY u.id, u.username, u.full_name, u.role, u.last_login
    ORDER BY last_activity DESC;
END//

DELIMITER ;
