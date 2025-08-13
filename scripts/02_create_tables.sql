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

-- Atualizada tabela de usuários do sistema com novos campos
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

-- Tabela principal de Cartões de Estacionamento
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

-- Tabela de Auditoria/Log de Alterações
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

-- Nova tabela de sessões de usuário
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

-- Nova tabela de auditoria de usuários
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
