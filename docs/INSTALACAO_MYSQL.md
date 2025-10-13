# Guia de Instalação do Banco de Dados MySQL

## 📋 Pré-requisitos

- MySQL 8.0 ou superior instalado
- Acesso root ao MySQL
- Cliente MySQL (mysql-client, MySQL Workbench, phpMyAdmin, etc.)

## 🚀 Instalação Rápida

### Passo 1: Instalar o MySQL (se ainda não tiver)

#### Ubuntu/Debian:
\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
\`\`\`

#### Windows:
- Baixe o instalador em: https://dev.mysql.com/downloads/installer/
- Execute o instalador e siga as instruções

#### macOS:
\`\`\`bash
brew install mysql
brew services start mysql
\`\`\`

### Passo 2: Acessar o MySQL

\`\`\`bash
mysql -u root -p
\`\`\`

### Passo 3: Executar o Script de Instalação

#### Opção A: Via linha de comando
\`\`\`bash
mysql -u root -p < scripts/setup-completo-mysql.sql
\`\`\`

#### Opção B: Via MySQL Workbench
1. Abra o MySQL Workbench
2. Conecte-se ao servidor MySQL
3. Vá em File → Open SQL Script
4. Selecione o arquivo `scripts/setup-completo-mysql.sql`
5. Clique em Execute (⚡)

#### Opção C: Via phpMyAdmin
1. Acesse o phpMyAdmin
2. Clique em "Import"
3. Selecione o arquivo `scripts/setup-completo-mysql.sql`
4. Clique em "Go"

### Passo 4: Verificar a Instalação

Execute no MySQL:
\`\`\`sql
USE estacionamento_2bec;
SHOW TABLES;
SELECT * FROM users;
\`\`\`

Você deve ver 3 tabelas criadas e 2 usuários padrão.

## 🔐 Credenciais Padrão

**⚠️ IMPORTANTE: Altere estas senhas em produção!**

- **Administrador**
  - Usuário: `admin`
  - Senha: `admin123`

- **Operador**
  - Usuário: `operador`
  - Senha: `operador123`

## ⚙️ Configuração do Sistema

### 1. Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto:

\`\`\`env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=estacionamento_2bec

# Configurações da Aplicação
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

### 2. Instalar Dependências

\`\`\`bash
npm install mysql2
\`\`\`

### 3. Testar Conexão

Execute o script de teste:
\`\`\`bash
node scripts/test-connection.js
\`\`\`

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

1. **users** - Usuários do sistema
   - Armazena administradores e operadores
   - Senhas criptografadas com bcrypt

2. **parking_cards** - Cartões de estacionamento
   - Informações completas dos cartões
   - Dados dos veículos e militares

3. **parking_cards_history** - Histórico de alterações
   - Auditoria completa de todas as operações
   - Rastreamento de quem fez o quê e quando

### Triggers Automáticos

- `after_parking_card_insert` - Registra criação de cartões
- `after_parking_card_update` - Registra atualizações de cartões

### Stored Procedures

- `sp_get_expiring_cards(days)` - Cartões próximos ao vencimento
- `sp_get_expired_cards()` - Cartões vencidos
- `sp_get_card_history(card_id)` - Histórico de um cartão
- `sp_statistics_dashboard()` - Estatísticas para o dashboard

### Views

- `vw_active_cards` - Cartões ativos
- `vw_expiring_cards` - Cartões vencendo em 30 dias
- `vw_expired_cards` - Cartões vencidos

## 🔧 Comandos Úteis

### Backup do Banco de Dados

\`\`\`bash
mysqldump -u root -p estacionamento_2bec > backup_$(date +%Y%m%d).sql
\`\`\`

### Restaurar Backup

\`\`\`bash
mysql -u root -p estacionamento_2bec < backup_20250112.sql
\`\`\`

### Verificar Status das Tabelas

\`\`\`sql
USE estacionamento_2bec;
SHOW TABLE STATUS;
\`\`\`

### Otimizar Tabelas

\`\`\`sql
OPTIMIZE TABLE users, parking_cards, parking_cards_history;
\`\`\`

### Ver Logs de Auditoria

\`\`\`sql
SELECT * FROM parking_cards_history 
ORDER BY changed_at DESC 
LIMIT 50;
\`\`\`

## 🛡️ Segurança

### 1. Alterar Senhas Padrão

\`\`\`sql
USE estacionamento_2bec;

-- Alterar senha do admin (substitua 'nova_senha_hash' pelo hash bcrypt)
UPDATE users 
SET password = '$2a$10$SEU_HASH_BCRYPT_AQUI' 
WHERE username = 'admin';

-- Alterar senha do operador
UPDATE users 
SET password = '$2a$10$SEU_HASH_BCRYPT_AQUI' 
WHERE username = 'operador';
\`\`\`

### 2. Criar Usuário Específico para a Aplicação

\`\`\`sql
-- Criar usuário com permissões limitadas
CREATE USER 'estacionamento_app'@'localhost' 
IDENTIFIED BY 'senha_forte_aqui';

-- Conceder permissões necessárias
GRANT SELECT, INSERT, UPDATE, DELETE 
ON estacionamento_2bec.* 
TO 'estacionamento_app'@'localhost';

FLUSH PRIVILEGES;
\`\`\`

### 3. Configurar SSL/TLS (Produção)

\`\`\`sql
-- Verificar se SSL está habilitado
SHOW VARIABLES LIKE '%ssl%';

-- Configurar conexão SSL no .env
DB_SSL=true
DB_SSL_CA=/path/to/ca-cert.pem
\`\`\`

## 📈 Monitoramento

### Verificar Tamanho das Tabelas

\`\`\`sql
SELECT 
  TABLE_NAME,
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Tamanho (MB)',
  TABLE_ROWS AS 'Registros'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'estacionamento_2bec'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
\`\`\`

### Verificar Performance

\`\`\`sql
-- Queries lentas
SHOW PROCESSLIST;

-- Estatísticas de índices
SHOW INDEX FROM parking_cards;
\`\`\`

## 🐛 Solução de Problemas

### Erro: "Access denied for user"

\`\`\`bash
# Resetar senha do root
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nova_senha';
FLUSH PRIVILEGES;
\`\`\`

### Erro: "Table doesn't exist"

\`\`\`bash
# Verificar se o banco foi criado
mysql -u root -p -e "SHOW DATABASES;"

# Reexecutar o script
mysql -u root -p < scripts/setup-completo-mysql.sql
\`\`\`

### Erro: "Connection refused"

\`\`\`bash
# Verificar se o MySQL está rodando
sudo systemctl status mysql

# Iniciar o MySQL
sudo systemctl start mysql
\`\`\`

## 📞 Suporte

Para mais informações, consulte:
- Documentação da API: `docs/API_DOCUMENTATION.md`
- Guia de Migração: `docs/MIGRACAO_MYSQL.md`
- Queries Úteis: `scripts/queries-uteis.sql`

## ✅ Checklist de Instalação

- [ ] MySQL 8.0+ instalado
- [ ] Script `setup-completo-mysql.sql` executado com sucesso
- [ ] Banco de dados `estacionamento_2bec` criado
- [ ] 3 tabelas criadas (users, parking_cards, parking_cards_history)
- [ ] 2 usuários padrão criados
- [ ] Arquivo `.env` configurado
- [ ] Dependência `mysql2` instalada
- [ ] Conexão testada com sucesso
- [ ] Senhas padrão alteradas (PRODUÇÃO)
- [ ] Backup inicial criado
- [ ] Usuário específico da aplicação criado (PRODUÇÃO)

---

**Sistema de Estacionamento 2º BEC** | Versão 1.0 | 2025
