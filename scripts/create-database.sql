-- Script de criação do banco de dados MySQL para o Sistema de Estacionamento do 2º BEC
-- Versão: 1.0
-- Data: 2025-01-11

-- Criar banco de dados se não existir
CREATE DATABASE IF NOT EXISTS estacionamento_2bec
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE estacionamento_2bec;

-- Tabela de usuários do sistema
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Hash da senha usando bcrypt',
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  full_name VARCHAR(100) NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de usuários do sistema de estacionamento';

-- Tabela de cartões de estacionamento
CREATE TABLE IF NOT EXISTS parking_cards (
  id VARCHAR(36) PRIMARY KEY,
  military_name VARCHAR(100) NOT NULL COMMENT 'Nome completo do militar',
  rank VARCHAR(50) NOT NULL COMMENT 'Posto/Graduação',
  war_name VARCHAR(100) NOT NULL COMMENT 'Nome de guerra',
  vehicle_plate VARCHAR(20) NOT NULL COMMENT 'Placa do veículo',
  vehicle_model VARCHAR(100) NOT NULL COMMENT 'Modelo do veículo',
  vehicle_color VARCHAR(50) NOT NULL COMMENT 'Cor do veículo',
  vehicle_type ENUM('carro', 'moto', 'caminhonete', 'van', 'onibus') NOT NULL COMMENT 'Tipo do veículo',
  issue_type ENUM('provisorio', 'definitivo') NOT NULL COMMENT 'Tipo de emissão do cartão',
  valid_until DATE NOT NULL COMMENT 'Data de validade do cartão',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36) COMMENT 'ID do usuário que criou o cartão',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) COMMENT 'ID do usuário que atualizou o cartão',
  INDEX idx_military_name (military_name),
  INDEX idx_war_name (war_name),
  INDEX idx_vehicle_plate (vehicle_plate),
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_status (status),
  INDEX idx_valid_until (valid_until),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de cartões de estacionamento do 2º BEC';

-- Tabela de histórico de alterações (auditoria)
CREATE TABLE IF NOT EXISTS parking_cards_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id VARCHAR(36) NOT NULL,
  action ENUM('created', 'updated', 'deleted', 'activated', 'deactivated') NOT NULL,
  changed_by VARCHAR(36),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  old_data JSON COMMENT 'Dados anteriores em formato JSON',
  new_data JSON COMMENT 'Novos dados em formato JSON',
  INDEX idx_card_id (card_id),
  INDEX idx_changed_at (changed_at),
  INDEX idx_action (action),
  FOREIGN KEY (card_id) REFERENCES parking_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de histórico de alterações para auditoria';

-- Inserir usuário administrador padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (id, username, email, password, role, full_name, status)
VALUES (
  UUID(),
  'admin',
  'admin@2bec.mil.br',
  '$2a$10$rOzJQjYJKGhqvXZvXoXxXeYvXoXxXeYvXoXxXeYvXoXxXeYvXoXxXe',
  'admin',
  'Administrador do Sistema',
  'active'
) ON DUPLICATE KEY UPDATE username=username;

-- Inserir usuário comum padrão
-- Senha: user123 (hash bcrypt)
INSERT INTO users (id, username, email, password, role, full_name, status)
VALUES (
  UUID(),
  'usuario',
  'usuario@2bec.mil.br',
  '$2a$10$uSeRjYJKGhqvXZvXoXxXeYvXoXxXeYvXoXxXeYvXoXxXeYvXoXxXe',
  'user',
  'Usuário Padrão',
  'active'
) ON DUPLICATE KEY UPDATE username=username;
