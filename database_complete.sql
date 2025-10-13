-- =====================================================
-- SISTEMA DE CARTÕES DE ESTACIONAMENTO - 2º BEC
-- Base de Dados Completa para Produção
-- Versão: 2.0 com Sistema de Usuários
-- Data: 2024
-- =====================================================

-- =====================================================
-- 1. CRIAÇÃO DO BANCO DE DADOS
-- =====================================================

CREATE DATABASE IF NOT EXISTS parking_system_2bec 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE parking_system_2bec;

-- =====================================================
-- 2. CRIAÇÃO DAS TABELAS
-- =====================================================

-- Tabela de Postos/Graduações
CREATE TABLE ranks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rank_name VARCHAR(50) NOT NULL UNIQUE,
    rank_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Tipos de Veículos
CREATE TABLE vehicle_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários do Sistema
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Em produção usar hash bcrypt
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Tabela Principal de Cartões de Estacionamento
CREATE TABLE parking_cards (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    military_name VARCHAR(100) NOT NULL,
    rank VARCHAR(50) NOT NULL,
    war_name VARCHAR(50) NOT NULL,
    vehicle_plate VARCHAR(8) NOT NULL UNIQUE,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_color VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    issue_type ENUM('provisorio', 'definitivo') NOT NULL DEFAULT 'provisorio',
    valid_until DATE NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(36), -- Referência ao usuário que criou
    updated_by VARCHAR(36), -- Referência ao usuário que atualizou
    
    -- Índices para otimização
    INDEX idx_military_name (military_name),
    INDEX idx_war_name (war_name),
    INDEX idx_vehicle_plate (vehicle_plate),
    INDEX idx_rank (rank),
    INDEX idx_status (status),
    INDEX idx_issue_type (issue_type),
    INDEX idx_valid_until (valid_until),
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by),
    INDEX idx_updated_by (updated_by),
    
    -- Chaves estrangeiras
    FOREIGN KEY (rank) REFERENCES ranks(rank_name) ON UPDATE CASCADE,
    FOREIGN KEY (vehicle_type) REFERENCES vehicle_types(type_name) ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de Auditoria/Log de Alterações dos Cartões
CREATE TABLE parking_cards_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    card_id VARCHAR(36) NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(36) NOT NULL, -- Referência ao usuário
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_card_id (card_id),
    INDEX idx_action (action),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by),
    
    FOREIGN KEY (card_id) REFERENCES parking_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Sessões de Usuário
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Auditoria de Usuários
CREATE TABLE users_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(36),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_changed_at (changed_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- 3. INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Postos e Graduações do Exército Brasileiro
INSERT INTO ranks (rank_name, rank_order) VALUES
('General de Exército', 1),
('General de Divisão', 2),
('General de Brigada', 3),
('Coronel', 4),
('Tenente-Coronel', 5),
('Major', 6),
('Capitão', 7),
('1º Tenente', 8),
('2º Tenente', 9),
('Aspirante a Oficial', 10),
('Subtenente', 11),
('1º Sargento', 12),
('2º Sargento', 13),
('3º Sargento', 14),
('Cabo', 15),
('Soldado', 16);

-- Tipos de Veículos
INSERT INTO vehicle_types (type_name) VALUES
('Carro'),
('Moto');

-- Usuários Padrão do Sistema
-- IMPORTANTE: Alterar senhas em produção e usar hash bcrypt
INSERT INTO users (id, username, email, password, full_name, role, status) VALUES
(UUID(), 'admin', 'admin@2bec.mil.br', 'admin123', 'Administrador do Sistema', 'admin', 'active'),
(UUID(), 'usuario', 'usuario@2bec.mil.br', 'user123', 'Usuário Comum', 'user', 'active'),
(UUID(), 'operador1', 'operador1@2bec.mil.br', 'op123', 'João Silva Santos', 'user', 'active'),
(UUID(), 'operador2', 'operador2@2bec.mil.br', 'op123', 'Maria Oliveira Costa', 'user', 'active');

-- =====================================================
-- 4. TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- =====================================================

DELIMITER //

-- Trigger para INSERT em parking_cards
CREATE TRIGGER parking_cards_after_insert
AFTER INSERT ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, new_values, changed_by
    ) VALUES (
        NEW.id, 
        'INSERT', 
        JSON_OBJECT(
            'military_name', NEW.military_name,
            'rank', NEW.rank,
            'war_name', NEW.war_name,
            'vehicle_plate', NEW.vehicle_plate,
            'vehicle_model', NEW.vehicle_model,
            'vehicle_color', NEW.vehicle_color,
            'vehicle_type', NEW.vehicle_type,
            'issue_type', NEW.issue_type,
            'valid_until', NEW.valid_until,
            'status', NEW.status
        ),
        COALESCE(NEW.created_by, 'SYSTEM')
    );
END//

-- Trigger para UPDATE em parking_cards
CREATE TRIGGER parking_cards_after_update
AFTER UPDATE ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, old_values, new_values, changed_by
    ) VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'military_name', OLD.military_name,
            'rank', OLD.rank,
            'war_name', OLD.war_name,
            'vehicle_plate', OLD.vehicle_plate,
            'vehicle_model', OLD.vehicle_model,
            'vehicle_color', OLD.vehicle_color,
            'vehicle_type', OLD.vehicle_type,
            'issue_type', OLD.issue_type,
            'valid_until', OLD.valid_until,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'military_name', NEW.military_name,
            'rank', NEW.rank,
            'war_name', NEW.war_name,
            'vehicle_plate', NEW.vehicle_plate,
            'vehicle_model', NEW.vehicle_model,
            'vehicle_color', NEW.vehicle_color,
            'vehicle_type', NEW.vehicle_type,
            'issue_type', NEW.issue_type,
            'valid_until', NEW.valid_until,
            'status', NEW.status
        ),
        COALESCE(NEW.updated_by, 'SYSTEM')
    );
END//

-- Trigger para DELETE em parking_cards
CREATE TRIGGER parking_cards_after_delete
AFTER DELETE ON parking_cards
FOR EACH ROW
BEGIN
    INSERT INTO parking_cards_audit (
        card_id, action, old_values, changed_by
    ) VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'military_name', OLD.military_name,
            'rank', OLD.rank,
            'war_name', OLD.war_name,
            'vehicle_plate', OLD.vehicle_plate,
            'vehicle_model', OLD.vehicle_model,
            'vehicle_color', OLD.vehicle_color,
            'vehicle_type', OLD.vehicle_type,
            'issue_type', OLD.issue_type,
            'valid_until', OLD.valid_until,
            'status', OLD.status
        ),
        COALESCE(OLD.updated_by, 'SYSTEM')
    );
END//

-- Triggers para auditoria de usuários
CREATE TRIGGER users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, new_values, changed_by
    ) VALUES (
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'username', NEW.username,
            'email', NEW.email,
            'full_name', NEW.full_name,
            'role', NEW.role,
            'status', NEW.status
        ),
        NEW.id
    );
END//

CREATE TRIGGER users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, old_values, new_values, changed_by
    ) VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'username', OLD.username,
            'email', OLD.email,
            'full_name', OLD.full_name,
            'role', OLD.role,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'username', NEW.username,
            'email', NEW.email,
            'full_name', NEW.full_name,
            'role', NEW.role,
            'status', NEW.status
        ),
        NEW.id
    );
END//

CREATE TRIGGER users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO users_audit (
        user_id, action, old_values
    ) VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'username', OLD.username,
            'email', OLD.email,
            'full_name', OLD.full_name,
            'role', OLD.role,
            'status', OLD.status
        )
    );
END//

DELIMITER ;

-- =====================================================
-- 5. VIEWS PARA RELATÓRIOS
-- =====================================================

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

-- View de estatísticas gerais
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

-- =====================================================
-- 6. STORED PROCEDURES
-- =====================================================

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

-- Procedure para criar usuário
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

-- =====================================================
-- 7. CONFIGURAÇÕES DE SEGURANÇA E PERFORMANCE
-- =====================================================

-- Configurações recomendadas para produção
-- SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
-- SET GLOBAL max_connections = 200;
-- SET GLOBAL query_cache_size = 67108864; -- 64MB

-- =====================================================
-- 8. COMENTÁRIOS FINAIS
-- =====================================================

-- IMPORTANTE PARA PRODUÇÃO:
-- 1. Alterar todas as senhas padrão
-- 2. Implementar hash bcrypt para senhas
-- 3. Configurar backup automático
-- 4. Implementar SSL/TLS
-- 5. Configurar firewall do banco
-- 6. Monitorar logs de auditoria
-- 7. Implementar rotação de logs
-- 8. Configurar alertas para cartões vencidos

-- FIM DO SCRIPT
-- Sistema pronto para produção
-- Versão: 2.0 - Sistema Completo com Usuários
