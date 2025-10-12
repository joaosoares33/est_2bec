# Guia de Migração para MySQL

Este guia detalha o processo completo de migração do sistema de estacionamento do 2º BEC do localStorage para MySQL.

## 📋 Pré-requisitos

- MySQL 8.0 ou superior instalado
- Node.js 18+ e npm/yarn
- Acesso administrativo ao MySQL

## 🔧 Etapa 1: Configuração do Banco de Dados

### 1.1 Instalar MySQL

**Windows:**
\`\`\`bash
# Baixe o instalador em: https://dev.mysql.com/downloads/installer/
# Execute o instalador e siga as instruções
\`\`\`

**Linux (Ubuntu/Debian):**
\`\`\`bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
\`\`\`

**macOS:**
\`\`\`bash
brew install mysql
brew services start mysql
\`\`\`

### 1.2 Criar o Banco de Dados

Execute o script SQL de criação:

\`\`\`bash
mysql -u root -p < scripts/create-database.sql
\`\`\`

Ou manualmente no MySQL:

\`\`\`bash
mysql -u root -p
\`\`\`

Depois execute:
\`\`\`sql
source scripts/create-database.sql
\`\`\`

### 1.3 Popular com Dados de Exemplo (Opcional)

\`\`\`bash
mysql -u root -p estacionamento_2bec < scripts/seed-sample-data.sql
\`\`\`

## 🔐 Etapa 2: Configurar Variáveis de Ambiente

### 2.1 Criar arquivo .env.local

Copie o arquivo de exemplo:

\`\`\`bash
cp .env.example .env.local
\`\`\`

### 2.2 Configurar credenciais do MySQL

Edite o arquivo `.env.local` com suas credenciais:

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=estacionamento_2bec
\`\`\`

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env.local` no Git!

## 📦 Etapa 3: Instalar Dependências

A dependência `mysql2` já está incluída no package.json. Execute:

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

## 🔄 Etapa 4: Migrar Dados do localStorage (Opcional)

Se você já tem dados no localStorage e quer migrá-los para o MySQL:

### 4.1 Exportar dados do localStorage

Abra o console do navegador (F12) e execute:

\`\`\`javascript
// Exportar cartões
const cards = localStorage.getItem('parking_cards_2bec')
console.log(cards)
// Copie o resultado
\`\`\`

### 4.2 Criar script de importação

Crie um arquivo `scripts/import-from-localstorage.sql` com os dados:

\`\`\`sql
-- Exemplo de importação manual
INSERT INTO parking_cards (
  id, military_name, rank, war_name, vehicle_plate,
  vehicle_model, vehicle_color, vehicle_type, issue_type,
  valid_until, status, created_by
) VALUES
('uuid-1', 'João Silva', 'Soldado', 'Silva', 'ABC-1234', 'Gol', 'Branco', 'carro', 'definitivo', '2026-01-01', 'active', 'admin'),
('uuid-2', 'Maria Santos', 'Cabo', 'Santos', 'XYZ-5678', 'CG 160', 'Preta', 'moto', 'provisorio', '2025-02-01', 'active', 'admin');
\`\`\`

### 4.3 Executar importação

\`\`\`bash
mysql -u root -p estacionamento_2bec < scripts/import-from-localstorage.sql
\`\`\`

## 🚀 Etapa 5: Testar a Conexão

### 5.1 Iniciar o servidor de desenvolvimento

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

### 5.2 Verificar logs

Abra o terminal e verifique se não há erros de conexão com o banco de dados.

### 5.3 Testar funcionalidades

1. Faça login no sistema
2. Tente criar um novo cartão
3. Edite um cartão existente
4. Busque cartões
5. Gere um PDF
6. Verifique o dashboard

## 📊 Etapa 6: Verificar Dados no MySQL

### 6.1 Conectar ao MySQL

\`\`\`bash
mysql -u root -p estacionamento_2bec
\`\`\`

### 6.2 Consultar dados

\`\`\`sql
-- Ver todos os cartões
SELECT * FROM parking_cards;

-- Ver usuários
SELECT * FROM users;

-- Ver histórico
SELECT * FROM parking_cards_history;

-- Estatísticas
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inativos
FROM parking_cards
WHERE deleted_at IS NULL;
\`\`\`

## 🔒 Etapa 7: Segurança em Produção

### 7.1 Criar usuário específico para a aplicação

\`\`\`sql
-- Conectar como root
mysql -u root -p

-- Criar usuário
CREATE USER 'estacionamento_app'@'localhost' IDENTIFIED BY 'senha_forte_aqui';

-- Conceder permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON estacionamento_2bec.* TO 'estacionamento_app'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;
\`\`\`

### 7.2 Atualizar .env.local

\`\`\`env
DB_USER=estacionamento_app
DB_PASSWORD=senha_forte_aqui
\`\`\`

### 7.3 Configurar backup automático

Crie um script de backup:

\`\`\`bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/caminho/para/backups"
DB_NAME="estacionamento_2bec"

mysqldump -u root -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
\`\`\`

Configure no cron:

\`\`\`bash
crontab -e

# Adicione (backup diário às 2h da manhã):
0 2 * * * /caminho/para/backup-db.sh
\`\`\`

## 🐛 Solução de Problemas

### Erro: "Cannot connect to MySQL server"

**Solução:**
1. Verifique se o MySQL está rodando: `sudo systemctl status mysql`
2. Verifique as credenciais no `.env.local`
3. Teste a conexão: `mysql -u root -p`

### Erro: "Access denied for user"

**Solução:**
1. Verifique o usuário e senha no `.env.local`
2. Recrie o usuário com as permissões corretas
3. Execute `FLUSH PRIVILEGES;` no MySQL

### Erro: "Table doesn't exist"

**Solução:**
1. Execute novamente o script de criação: `mysql -u root -p < scripts/create-database.sql`
2. Verifique se o banco foi criado: `SHOW DATABASES;`
3. Verifique as tabelas: `USE estacionamento_2bec; SHOW TABLES;`

### Dados não aparecem no sistema

**Solução:**
1. Verifique os logs do servidor Next.js
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique se há dados no banco: `SELECT * FROM parking_cards;`
4. Teste as APIs diretamente: `curl http://localhost:3000/api/parking-cards`

## 📈 Monitoramento

### Queries úteis para monitoramento

\`\`\`sql
-- Ver conexões ativas
SHOW PROCESSLIST;

-- Ver tamanho do banco
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'estacionamento_2bec'
GROUP BY table_schema;

-- Ver últimas operações
SELECT * FROM parking_cards_history 
ORDER BY changed_at DESC 
LIMIT 10;
\`\`\`

## ✅ Checklist de Migração

- [ ] MySQL instalado e configurado
- [ ] Banco de dados criado (create-database.sql)
- [ ] Dados de exemplo inseridos (opcional)
- [ ] Arquivo .env.local configurado
- [ ] Dependências instaladas (npm install)
- [ ] Dados do localStorage migrados (opcional)
- [ ] Servidor de desenvolvimento testado
- [ ] Todas as funcionalidades testadas
- [ ] Usuário específico criado para produção
- [ ] Backup automático configurado
- [ ] Sistema em produção funcionando

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. **Remover código do localStorage** (opcional, manter como fallback)
2. **Configurar ambiente de produção** (servidor, domínio, SSL)
3. **Implementar autenticação robusta** (JWT, sessões)
4. **Adicionar logs de auditoria** (já incluído no histórico)
5. **Configurar monitoramento** (uptime, performance)
6. **Treinar usuários** no novo sistema

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação do MySQL: https://dev.mysql.com/doc/
- Consulte a documentação do Next.js: https://nextjs.org/docs
- Verifique os logs do sistema
