# Configuração Final do Sistema de Estacionamento 2º BEC

## ✅ Sistema Migrado para MySQL

O sistema foi completamente migrado do localStorage para MySQL. Todas as operações agora são persistidas no banco de dados.

## 📋 Checklist de Configuração

### 1. Banco de Dados MySQL

**Executar o script SQL completo:**

\`\`\`bash
mysql -u root -p < scripts/setup-completo-mysql.sql
\`\`\`

Este script cria:
- ✅ Banco de dados `estacionamento_2bec`
- ✅ Tabela `users` (usuários do sistema)
- ✅ Tabela `parking_cards` (cartões de estacionamento)
- ✅ Tabela `parking_cards_history` (histórico de alterações)
- ✅ Usuários padrão (admin/123 e user/123)
- ✅ Dados de exemplo para testes

### 2. Variáveis de Ambiente

**Criar arquivo `.env.local` na raiz do projeto:**

\`\`\`env
# Configuração do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=estacionamento_2bec
\`\`\`

**⚠️ IMPORTANTE:** Substitua `sua_senha_aqui` pela senha real do MySQL.

### 3. Dependências

A dependência `mysql2` já está instalada no `package.json`. Se necessário, execute:

\`\`\`bash
npm install
\`\`\`

### 4. Iniciar o Sistema

\`\`\`bash
npm run dev
\`\`\`

O sistema estará disponível em: `http://localhost:3000`

## 🔐 Credenciais de Acesso

### Administrador
- **Usuário:** admin
- **Senha:** 123
- **Permissões:** Acesso total ao sistema

### Usuário Comum
- **Usuário:** user
- **Senha:** 123
- **Permissões:** Visualização e operações básicas

## 🗂️ Estrutura de APIs Criadas

### Autenticação
- `POST /api/auth/login` - Login de usuários

### Cartões de Estacionamento
- `GET /api/parking-cards` - Listar todos os cartões
- `POST /api/parking-cards` - Criar novo cartão
- `GET /api/parking-cards/[id]` - Buscar cartão por ID
- `PUT /api/parking-cards/[id]` - Atualizar cartão
- `DELETE /api/parking-cards/[id]` - Excluir cartão
- `PATCH /api/parking-cards/[id]/toggle-status` - Ativar/Inativar cartão

## 📊 Verificação do Sistema

### Testar Conexão com Banco

\`\`\`bash
mysql -u root -p estacionamento_2bec -e "SELECT COUNT(*) as total_users FROM users;"
\`\`\`

Deve retornar: `total_users: 2`

### Testar Login

1. Acesse `http://localhost:3000`
2. Use as credenciais: `admin` / `123`
3. Você deve ser redirecionado para o Dashboard

### Testar Cartões

1. No Dashboard, clique em "Cadastrar Novo Cartão"
2. Preencha os dados e salve
3. Verifique no banco de dados:

\`\`\`bash
mysql -u root -p estacionamento_2bec -e "SELECT * FROM parking_cards;"
\`\`\`

## 🔧 Solução de Problemas

### Erro: "Cannot connect to MySQL"

**Solução:**
1. Verifique se o MySQL está rodando: `sudo systemctl status mysql`
2. Verifique as credenciais no `.env.local`
3. Teste a conexão: `mysql -u root -p`

### Erro: "Table doesn't exist"

**Solução:**
Execute novamente o script SQL:
\`\`\`bash
mysql -u root -p < scripts/setup-completo-mysql.sql
\`\`\`

### Erro: "Access denied for user"

**Solução:**
1. Verifique a senha no `.env.local`
2. Crie um usuário específico para a aplicação:

\`\`\`sql
CREATE USER 'estacionamento_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON estacionamento_2bec.* TO 'estacionamento_user'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

3. Atualize o `.env.local` com as novas credenciais

## 🚀 Deploy em Produção

### Recomendações de Segurança

1. **Senhas Fortes:** Altere as senhas padrão dos usuários
2. **Hash de Senhas:** Implemente bcrypt para hash de senhas
3. **HTTPS:** Use certificado SSL/TLS
4. **Backup:** Configure backup automático do banco de dados
5. **Firewall:** Restrinja acesso ao MySQL apenas para localhost

### Backup do Banco de Dados

\`\`\`bash
# Criar backup
mysqldump -u root -p estacionamento_2bec > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root -p estacionamento_2bec < backup_20250112.sql
\`\`\`

## 📝 Notas Importantes

- ✅ **localStorage removido:** Todos os dados agora são salvos no MySQL
- ✅ **Autenticação via API:** Login consulta o banco de dados
- ✅ **CRUD completo:** Todas as operações de cartões usam MySQL
- ✅ **Histórico de alterações:** Triggers automáticos registram mudanças
- ✅ **Dados persistentes:** Informações não são perdidas ao fechar o navegador

## 🎯 Próximos Passos

1. ✅ Testar todas as funcionalidades do sistema
2. ⚠️ Alterar senhas padrão dos usuários
3. ⚠️ Implementar hash de senhas (bcrypt)
4. ⚠️ Configurar backup automático
5. ⚠️ Implementar logs de auditoria
6. ⚠️ Adicionar validações de segurança adicionais

---

**Sistema desenvolvido para o 2º Batalhão de Engenharia de Construção**
