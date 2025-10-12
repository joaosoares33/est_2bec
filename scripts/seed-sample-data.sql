-- Script de dados de exemplo para o Sistema de Estacionamento do 2º BEC
-- Este script insere dados de exemplo para testes
-- Versão: 1.0

USE estacionamento_2bec;

-- Inserir cartões de estacionamento de exemplo
INSERT INTO parking_cards (
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
  status
) VALUES
(
  UUID(),
  'João da Silva Santos',
  'Capitão',
  'Silva',
  'ABC-1234',
  'Toyota Corolla',
  'Prata',
  'carro',
  'definitivo',
  DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
  'active'
),
(
  UUID(),
  'Maria Oliveira Costa',
  'Tenente',
  'Oliveira',
  'XYZ-5678',
  'Honda CB 500',
  'Vermelha',
  'moto',
  'definitivo',
  DATE_ADD(CURDATE(), INTERVAL 6 MONTH),
  'active'
),
(
  UUID(),
  'Pedro Alves Ferreira',
  'Sargento',
  'Alves',
  'DEF-9012',
  'Chevrolet S10',
  'Branca',
  'caminhonete',
  'provisorio',
  DATE_ADD(CURDATE(), INTERVAL 3 MONTH),
  'active'
),
(
  UUID(),
  'Ana Paula Rodrigues',
  'Cabo',
  'Paula',
  'GHI-3456',
  'Volkswagen Gol',
  'Azul',
  'carro',
  'definitivo',
  DATE_ADD(CURDATE(), INTERVAL 9 MONTH),
  'active'
),
(
  UUID(),
  'Carlos Eduardo Lima',
  'Soldado',
  'Eduardo',
  'JKL-7890',
  'Yamaha Fazer',
  'Preta',
  'moto',
  'provisorio',
  DATE_ADD(CURDATE(), INTERVAL 2 MONTH),
  'active'
);
