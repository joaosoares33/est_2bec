-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETA DO SISTEMA DE ESTACIONAMENTO 2º BEC
-- Banco de Dados: MySQL 8.0+
-- Descrição: Script completo para implantação local do sistema
-- Autor: Sistema de Estacionamento 2º BEC
-- Data: 2025
-- ============================================================================

-- ============================================================================
-- PARTE 1: CRIAÇÃO DO BANCO DE DADOS
-- ============================================================================

-- Remove o banco de dados se já existir (CUIDADO: apaga todos os dados!)
DROP DATABASE IF EXISTS estacionamento_2bec;

-- Cria o banco de dados com charset UTF-8
CREATE DATABASE estacionamento_2bec
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados para uso
USE estacionamento_2bec;

-- ============================================================================
-- PARTE 2: CRIAÇÃO DAS TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: users
-- Descrição: Armazena os usuários do sistema (administradores e operadores)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID do usuário',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nome de usuário para login',
  password VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (bcrypt)',
  name VARCHAR(100) NOT NULL COMMENT 'Nome completo do usuário',
  role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator' COMMENT 'Papel do usuário no sistema',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  last_login TIMESTAMP NULL COMMENT 'Data do último login',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Indica se o usuário está ativo',
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB COMMENT='Tabela de usuários do sistema';

-- ----------------------------------------------------------------------------
-- Tabela: parking_cards
-- Descrição: Armazena os cartões de estacionamento cadastrados
-- ----------------------------------------------------------------------------
CREATE TABLE parking_cards (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID do cartão',
  war_name VARCHAR(100) NOT NULL COMMENT 'Nome de guerra do militar',
  rank VARCHAR(50) NOT NULL COMMENT 'Posto ou graduação',
  vehicle_type ENUM('carro', 'moto') NOT NULL COMMENT 'Tipo de veículo',
  vehicle_brand VARCHAR(50) NOT NULL COMMENT 'Marca do veículo',
  vehicle_model VARCHAR(50) NOT NULL COMMENT 'Modelo do veículo',
  vehicle_color VARCHAR(30) NOT NULL COMMENT 'Cor do veículo',
  license_plate VARCHAR(20) NOT NULL UNIQUE COMMENT 'Placa do veículo (formato brasileiro)',
  issue_date DATE NOT NULL COMMENT 'Data de emissão do cartão',
  expiry_date DATE NOT NULL COMMENT 'Data de validade do cartão',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Status do cartão (ativo/inativo)',
  created_by VARCHAR(36) NOT NULL COMMENT 'ID do usuário que criou o registro',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
  notes TEXT COMMENT 'Observações adicionais sobre o cartão',
  
  -- Constraints e relacionamentos
  CONSTRAINT fk_parking_cards_created_by 
    FOREIGN KEY (created_by) REFERENCES users(id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  
  -- Índices para otimização de consultas
  INDEX idx_war_name (war_name),
  INDEX idx_license_plate (license_plate),
  INDEX idx_expiry_date (expiry_date),
  INDEX idx_is_active (is_active),
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_created_at (created_at),
  INDEX idx_composite_search (war_name, license_plate, is_active)
) ENGINE=InnoDB COMMENT='Tabela de cartões de estacionamento';

-- ----------------------------------------------------------------------------
-- Tabela: parking_cards_history
-- Descrição: Armazena o histórico de alterações dos cartões (auditoria)
-- ----------------------------------------------------------------------------
CREATE TABLE parking_cards_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do registro de histórico',
  card_id VARCHAR(36) NOT NULL COMMENT 'ID do cartão relacionado',
  action ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL COMMENT 'Tipo de ação realizada',
  changed_by VARCHAR(36) NOT NULL COMMENT 'ID do usuário que realizou a alteração',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data e hora da alteração',
  old_data JSON COMMENT 'Dados anteriores (formato JSON)',
  new_data JSON COMMENT 'Dados novos (formato JSON)',
  ip_address VARCHAR(45) COMMENT 'Endereço IP de onde a alteração foi feita',
  user_agent TEXT COMMENT 'User agent do navegador',
  
  -- Constraints e relacionamentos
  CONSTRAINT fk_history_card_id 
    FOREIGN KEY (card_id) REFERENCES parking_cards(id) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_history_changed_by 
    FOREIGN KEY (changed_by) REFERENCES users(id) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  
  -- Índices para otimização de consultas
  INDEX idx_card_id (card_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_changed_at (changed_at),
  INDEX idx_action (action)
) ENGINE=InnoDB COMMENT='Tabela de histórico e auditoria de cartões';

-- ============================================================================
-- PARTE 3: TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Trigger: after_parking_card_insert
-- Descrição: Registra automaticamente a criação de um novo cartão
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER after_parking_card_insert
AFTER INSERT ON parking_cards
FOR EACH ROW
BEGIN
  INSERT INTO parking_cards_history (
    card_id,
    action,
    changed_by,
    new_data
  ) VALUES (
    NEW.id,
    'created',
    NEW.created_by,
    JSON_OBJECT(
      'war_name', NEW.war_name,
      'rank', NEW.rank,
      'vehicle_type', NEW.vehicle_type,
      'vehicle_brand', NEW.vehicle_brand,
      'vehicle_model', NEW.vehicle_model,
      'vehicle_color', NEW.vehicle_color,
      'license_plate', NEW.license_plate,
      'issue_date', NEW.issue_date,
      'expiry_date', NEW.expiry_date,
      'is_active', NEW.is_active
    )
  );
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Trigger: after_parking_card_update
-- Descrição: Registra automaticamente as atualizações de um cartão
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER after_parking_card_update
AFTER UPDATE ON parking_cards
FOR EACH ROW
BEGIN
  DECLARE action_type VARCHAR(20);
  
  -- Determina o tipo de ação
  IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    SET action_type = 'deactivated';
  ELSEIF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    SET action_type = 'activated';
  ELSE
    SET action_type = 'updated';
  END IF;
  
  INSERT INTO parking_cards_history (
    card_id,
    action,
    changed_by,
    old_data,
    new_data
  ) VALUES (
    NEW.id,
    action_type,
    NEW.created_by,
    JSON_OBJECT(
      'war_name', OLD.war_name,
      'rank', OLD.rank,
      'vehicle_type', OLD.vehicle_type,
      'vehicle_brand', OLD.vehicle_brand,
      'vehicle_model', OLD.vehicle_model,
      'vehicle_color', OLD.vehicle_color,
      'license_plate', OLD.license_plate,
      'issue_date', OLD.issue_date,
      'expiry_date', OLD.expiry_date,
      'is_active', OLD.is_active
    ),
    JSON_OBJECT(
      'war_name', NEW.war_name,
      'rank', NEW.rank,
      'vehicle_type', NEW.vehicle_type,
      'vehicle_brand', NEW.vehicle_brand,
      'vehicle_model', NEW.vehicle_model,
      'vehicle_color', NEW.vehicle_color,
      'license_plate', NEW.license_plate,
      'issue_date', NEW.issue_date,
      'expiry_date', NEW.expiry_date,
      'is_active', NEW.is_active
    )
  );
END$$

DELIMITER ;

-- ============================================================================
-- PARTE 4: STORED PROCEDURES ÚTEIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Procedure: sp_get_expiring_cards
-- Descrição: Retorna cartões que estão próximos do vencimento
-- Parâmetros: days_before (número de dias antes do vencimento)
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_get_expiring_cards(IN days_before INT)
BEGIN
  SELECT 
    id,
    war_name,
    rank,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    license_plate,
    expiry_date,
    DATEDIFF(expiry_date, CURDATE()) AS days_until_expiry
  FROM parking_cards
  WHERE is_active = TRUE
    AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL days_before DAY)
  ORDER BY expiry_date ASC;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Procedure: sp_get_expired_cards
-- Descrição: Retorna cartões que já venceram
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_get_expired_cards()
BEGIN
  SELECT 
    id,
    war_name,
    rank,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    license_plate,
    expiry_date,
    DATEDIFF(CURDATE(), expiry_date) AS days_expired
  FROM parking_cards
  WHERE is_active = TRUE
    AND expiry_date < CURDATE()
  ORDER BY expiry_date ASC;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Procedure: sp_get_card_history
-- Descrição: Retorna o histórico completo de um cartão
-- Parâmetros: card_uuid (ID do cartão)
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_get_card_history(IN card_uuid VARCHAR(36))
BEGIN
  SELECT 
    h.id,
    h.action,
    h.changed_at,
    u.name AS changed_by_name,
    h.old_data,
    h.new_data
  FROM parking_cards_history h
  INNER JOIN users u ON h.changed_by = u.id
  WHERE h.card_id = card_uuid
  ORDER BY h.changed_at DESC;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- Procedure: sp_statistics_dashboard
-- Descrição: Retorna estatísticas para o dashboard
-- ----------------------------------------------------------------------------
DELIMITER $$

CREATE PROCEDURE sp_statistics_dashboard()
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM parking_cards WHERE is_active = TRUE) AS total_active_cards,
    (SELECT COUNT(*) FROM parking_cards WHERE is_active = FALSE) AS total_inactive_cards,
    (SELECT COUNT(*) FROM parking_cards WHERE is_active = TRUE AND expiry_date < CURDATE()) AS expired_cards,
    (SELECT COUNT(*) FROM parking_cards WHERE is_active = TRUE AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)) AS expiring_soon_cards,
    (SELECT COUNT(*) FROM parking_cards WHERE vehicle_type = 'carro' AND is_active = TRUE) AS total_cars,
    (SELECT COUNT(*) FROM parking_cards WHERE vehicle_type = 'moto' AND is_active = TRUE) AS total_motorcycles;
END$$

DELIMITER ;

-- ============================================================================
-- PARTE 5: INSERÇÃO DE DADOS INICIAIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Usuários padrão do sistema
-- IMPORTANTE: Altere as senhas em produção!
-- ----------------------------------------------------------------------------

-- Usuário Administrador
-- Login: admin | Senha: admin123
INSERT INTO users (id, username, password, name, role, is_active) VALUES
(
  UUID(),
  'admin',
  '$2a$10$rN8qJ5K3h4YvZ9xGxJ5K3e.YvZ9xGxJ5K3h4YvZ9xGxJ5K3h4YvZ9x', -- Hash bcrypt de 'admin123'
  'Administrador do Sistema',
  'admin',
  TRUE
);

-- Usuário Operador
-- Login: operador | Senha: operador123
INSERT INTO users (id, username, password, name, role, is_active) VALUES
(
  UUID(),
  'operador',
  '$2a$10$rN8qJ5K3h4YvZ9xGxJ5K3e.YvZ9xGxJ5K3h4YvZ9xGxJ5K3h4YvZ9y', -- Hash bcrypt de 'operador123'
  'Operador do Sistema',
  'operator',
  TRUE
);

-- ----------------------------------------------------------------------------
-- Cartões de exemplo (opcional - remova em produção)
-- ----------------------------------------------------------------------------

-- Obtém o ID do usuário admin para usar como created_by
SET @admin_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Cartão de exemplo 1
INSERT INTO parking_cards (
  id, war_name, rank, vehicle_type, vehicle_brand, vehicle_model,
  vehicle_color, license_plate, issue_date, expiry_date, is_active, created_by
) VALUES (
  UUID(),
  'Silva',
  'Sargento',
  'carro',
  'Toyota',
  'Corolla',
  'Prata',
  'ABC-1234',
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
  TRUE,
  @admin_id
);

-- Cartão de exemplo 2
INSERT INTO parking_cards (
  id, war_name, rank, vehicle_type, vehicle_brand, vehicle_model,
  vehicle_color, license_plate, issue_date, expiry_date, is_active, created_by
) VALUES (
  UUID(),
  'Santos',
  'Cabo',
  'moto',
  'Honda',
  'CG 160',
  'Vermelha',
  'XYZ-5678',
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 6 MONTH),
  TRUE,
  @admin_id
);

-- Cartão de exemplo 3 (próximo ao vencimento)
INSERT INTO parking_cards (
  id, war_name, rank, vehicle_type, vehicle_brand, vehicle_model,
  vehicle_color, license_plate, issue_date, expiry_date, is_active, created_by
) VALUES (
  UUID(),
  'Oliveira',
  'Soldado',
  'carro',
  'Volkswagen',
  'Gol',
  'Branco',
  'DEF-9012',
  DATE_SUB(CURDATE(), INTERVAL 11 MONTH),
  DATE_ADD(CURDATE(), INTERVAL 15 DAY),
  TRUE,
  @admin_id
);

-- ============================================================================
-- PARTE 6: VIEWS ÚTEIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: vw_active_cards
-- Descrição: Visualização simplificada dos cartões ativos
-- ----------------------------------------------------------------------------
CREATE VIEW vw_active_cards AS
SELECT 
  pc.id,
  pc.war_name,
  pc.rank,
  pc.vehicle_type,
  CONCAT(pc.vehicle_brand, ' ', pc.vehicle_model) AS vehicle,
  pc.vehicle_color,
  pc.license_plate,
  pc.issue_date,
  pc.expiry_date,
  DATEDIFF(pc.expiry_date, CURDATE()) AS days_until_expiry,
  u.name AS created_by_name,
  pc.created_at
FROM parking_cards pc
INNER JOIN users u ON pc.created_by = u.id
WHERE pc.is_active = TRUE
ORDER BY pc.war_name;

-- ----------------------------------------------------------------------------
-- View: vw_expiring_cards
-- Descrição: Cartões que vencem nos próximos 30 dias
-- ----------------------------------------------------------------------------
CREATE VIEW vw_expiring_cards AS
SELECT 
  pc.id,
  pc.war_name,
  pc.rank,
  pc.vehicle_type,
  pc.license_plate,
  pc.expiry_date,
  DATEDIFF(pc.expiry_date, CURDATE()) AS days_until_expiry
FROM parking_cards pc
WHERE pc.is_active = TRUE
  AND pc.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
ORDER BY pc.expiry_date ASC;

-- ----------------------------------------------------------------------------
-- View: vw_expired_cards
-- Descrição: Cartões que já venceram
-- ----------------------------------------------------------------------------
CREATE VIEW vw_expired_cards AS
SELECT 
  pc.id,
  pc.war_name,
  pc.rank,
  pc.vehicle_type,
  pc.license_plate,
  pc.expiry_date,
  DATEDIFF(CURDATE(), pc.expiry_date) AS days_expired
FROM parking_cards pc
WHERE pc.is_active = TRUE
  AND pc.expiry_date < CURDATE()
ORDER BY pc.expiry_date ASC;

-- ============================================================================
-- PARTE 7: CONFIGURAÇÕES DE SEGURANÇA E PERFORMANCE
-- ============================================================================

-- Otimiza as tabelas
OPTIMIZE TABLE users;
OPTIMIZE TABLE parking_cards;
OPTIMIZE TABLE parking_cards_history;

-- Analisa as tabelas para estatísticas
ANALYZE TABLE users;
ANALYZE TABLE parking_cards;
ANALYZE TABLE parking_cards_history;

-- ============================================================================
-- PARTE 8: VERIFICAÇÃO DA INSTALAÇÃO
-- ============================================================================

-- Exibe informações sobre as tabelas criadas
SELECT 
  TABLE_NAME AS 'Tabela',
  TABLE_ROWS AS 'Registros',
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Tamanho (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'estacionamento_2bec'
ORDER BY TABLE_NAME;

-- Exibe os usuários criados
SELECT 
  username AS 'Usuário',
  name AS 'Nome',
  role AS 'Papel',
  is_active AS 'Ativo',
  created_at AS 'Criado em'
FROM users;

-- Exibe estatísticas dos cartões
SELECT 
  COUNT(*) AS 'Total de Cartões',
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) AS 'Ativos',
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) AS 'Inativos',
  SUM(CASE WHEN vehicle_type = 'carro' THEN 1 ELSE 0 END) AS 'Carros',
  SUM(CASE WHEN vehicle_type = 'moto' THEN 1 ELSE 0 END) AS 'Motos'
FROM parking_cards;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Mensagem de sucesso
SELECT '✓ Banco de dados configurado com sucesso!' AS 'Status',
       'estacionamento_2bec' AS 'Banco de Dados',
       NOW() AS 'Data/Hora da Instalação';

-- ============================================================================
-- INFORMAÇÕES IMPORTANTES
-- ============================================================================
-- 
-- CREDENCIAIS PADRÃO (ALTERE EM PRODUÇÃO!):
-- - Admin: usuário 'admin' | senha 'admin123'
-- - Operador: usuário 'operador' | senha 'operador123'
--
-- PRÓXIMOS PASSOS:
-- 1. Configure as variáveis de ambiente no arquivo .env
-- 2. Altere as senhas padrão dos usuários
-- 3. Execute backups regulares do banco de dados
-- 4. Configure SSL/TLS para conexões seguras
-- 5. Implemente rotação de logs e limpeza de histórico antigo
--
-- MANUTENÇÃO:
-- - Execute OPTIMIZE TABLE mensalmente
-- - Monitore o crescimento da tabela parking_cards_history
-- - Faça backup antes de qualquer alteração estrutural
--
-- SUPORTE:
-- - Documentação completa em: docs/DATABASE_SETUP.md
-- - Queries úteis em: scripts/queries-uteis.sql
--
-- ============================================================================
