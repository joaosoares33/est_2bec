-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA DO SISTEMA DE ESTACIONAMENTO 2º BEC
-- Banco de Dados: MySQL 8.0+
-- Descrição: Script completo para implantação local do sistema
-- ============================================================================

-- Remove o banco de dados se já existir
DROP DATABASE IF EXISTS estacionamento_2bec;

-- Cria o banco de dados com charset UTF-8
CREATE DATABASE estacionamento_2bec
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estacionamento_2bec;

-- ============================================================================
-- CRIAÇÃO DAS TABELAS
-- ============================================================================

-- Tabela de usuários
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de cartões de estacionamento
CREATE TABLE parking_cards (
  id VARCHAR(36) PRIMARY KEY,
  military_name VARCHAR(100) NOT NULL,
  rank VARCHAR(50) NOT NULL,
  war_name VARCHAR(100) NOT NULL,
  vehicle_plate VARCHAR(20) NOT NULL UNIQUE,
  vehicle_model VARCHAR(50) NOT NULL,
  vehicle_color VARCHAR(30) NOT NULL,
  vehicle_type ENUM('carro', 'moto') NOT NULL,
  issue_type ENUM('provisorio', 'definitivo') NOT NULL,
  valid_until DATE NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) NULL,
  deleted_at TIMESTAMP NULL,
  notes TEXT,
  
  CONSTRAINT fk_parking_cards_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX idx_war_name (war_name),
  INDEX idx_vehicle_plate (vehicle_plate),
  INDEX idx_valid_until (valid_until),
  INDEX idx_status (status),
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB;

-- Tabela de histórico de alterações
CREATE TABLE parking_cards_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  card_id VARCHAR(36) NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL,
  changed_by VARCHAR(36) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  old_data JSON,
  new_data JSON,
  
  CONSTRAINT fk_history_card_id 
    FOREIGN KEY (card_id) REFERENCES parking_cards(id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_history_changed_by 
    FOREIGN KEY (changed_by) REFERENCES users(id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  
  INDEX idx_card_id (card_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB;

-- ============================================================================
-- TRIGGERS PARA AUDITORIA
-- ============================================================================

DELIMITER $$

CREATE TRIGGER after_parking_card_insert
AFTER INSERT ON parking_cards
FOR EACH ROW
BEGIN
  INSERT INTO parking_cards_history (card_id, action, changed_by, new_data)
  VALUES (
    NEW.id,
    'created',
    NEW.created_by,
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
    )
  );
END$$

CREATE TRIGGER after_parking_card_update
AFTER UPDATE ON parking_cards
FOR EACH ROW
BEGIN
  DECLARE action_type VARCHAR(20);
  
  IF OLD.status = 'active' AND NEW.status = 'inactive' THEN
    SET action_type = 'deactivated';
  ELSEIF OLD.status = 'inactive' AND NEW.status = 'active' THEN
    SET action_type = 'activated';
  ELSE
    SET action_type = 'updated';
  END IF;
  
  INSERT INTO parking_cards_history (card_id, action, changed_by, old_data, new_data)
  VALUES (
    NEW.id,
    action_type,
    NEW.created_by,
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
    )
  );
END$$

DELIMITER ;

-- ============================================================================
-- INSERÇÃO DE DADOS INICIAIS
-- ============================================================================

-- Usuário Administrador (senha: admin123)
INSERT INTO users (id, username, password, email, full_name, role, status) VALUES
(UUID(), 'admin', 'admin123', 'admin@2bec.mil.br', 'Administrador do Sistema', 'admin', 'active');

-- Usuário Operador (senha: operador123)
INSERT INTO users (id, username, password, email, full_name, role, status) VALUES
(UUID(), 'operador', 'operador123', 'operador@2bec.mil.br', 'Operador do Sistema', 'user', 'active');

-- Obtém o ID do usuário admin
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Cartões de exemplo
INSERT INTO parking_cards (
  id, military_name, rank, war_name, vehicle_plate, vehicle_model,
  vehicle_color, vehicle_type, issue_type, valid_until, status, created_by
) VALUES
(UUID(), 'João da Silva', 'Sargento', 'Silva', 'ABC-1234', 'Toyota Corolla', 'Prata', 'carro', 'definitivo', DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'active', @admin_id),
(UUID(), 'Maria Santos', 'Cabo', 'Santos', 'XYZ-5678', 'Honda CG 160', 'Vermelha', 'moto', 'definitivo', DATE_ADD(CURDATE(), INTERVAL 6 MONTH), 'active', @admin_id),
(UUID(), 'Pedro Oliveira', 'Soldado', 'Oliveira', 'DEF-9012', 'Volkswagen Gol', 'Branco', 'carro', 'provisorio', DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'active', @admin_id);

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

CREATE VIEW vw_active_cards AS
SELECT 
  pc.id,
  pc.military_name,
  pc.rank,
  pc.war_name,
  pc.vehicle_type,
  CONCAT(pc.vehicle_model, ' - ', pc.vehicle_color) AS vehicle,
  pc.vehicle_plate,
  pc.issue_type,
  pc.valid_until,
  DATEDIFF(pc.valid_until, CURDATE()) AS days_until_expiry,
  u.full_name AS created_by_name,
  pc.created_at
FROM parking_cards pc
INNER JOIN users u ON pc.created_by = u.id
WHERE pc.status = 'active'
ORDER BY pc.war_name;

-- ============================================================================
-- VERIFICAÇÃO DA INSTALAÇÃO
-- ============================================================================

SELECT 'Banco de dados configurado com sucesso!' AS Status;

SELECT 
  username AS Usuario,
  full_name AS Nome,
  role AS Papel,
  status AS Status
FROM users;

SELECT 
  COUNT(*) AS Total_Cartoes,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS Ativos,
  SUM(CASE WHEN vehicle_type = 'carro' THEN 1 ELSE 0 END) AS Carros,
  SUM(CASE WHEN vehicle_type = 'moto' THEN 1 ELSE 0 END) AS Motos
FROM parking_cards;
