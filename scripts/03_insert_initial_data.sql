-- Inserção de dados iniciais

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

-- Adicionando usuários padrão com senhas resetadas
-- Resetando senhas para padrões mais seguros
INSERT INTO users (id, username, email, password, full_name, role, status) VALUES
(UUID(), 'admin', 'admin@2bec.mil.br', 'admin2024', 'Administrador do Sistema', 'admin', 'active'),
(UUID(), 'usuario', 'usuario@2bec.mil.br', 'user2024', 'Usuário Comum', 'user', 'active');

-- Dados de exemplo para demonstração (opcional)
INSERT INTO users (id, username, email, password, full_name, role, status) VALUES
(UUID(), 'operador1', 'operador1@2bec.mil.br', 'op2024', 'João Silva Santos', 'user', 'active'),
(UUID(), 'operador2', 'operador2@2bec.mil.br', 'op2024', 'Maria Oliveira Costa', 'user', 'active');
