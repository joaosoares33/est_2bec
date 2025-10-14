# Instalação Completa do Sistema de Estacionamento 2º BEC

## Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e rodando
- Git (opcional)

## Passo 1: Configurar o Banco de Dados MySQL

### 1.1 Instalar MySQL

**Windows:**
- Baixe o MySQL Installer em: https://dev.mysql.com/downloads/installer/
- Execute o instalador e siga as instruções
- Anote a senha do usuário root

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

### 1.2 Executar o Script SQL

1. Abra o MySQL Workbench ou o terminal MySQL:
\`\`\`bash
mysql -u root -p
\`\`\`

2. Execute o script completo:
\`\`\`bash
mysql -u root -p < scripts/setup-mysql-completo.sql
\`\`\`

Ou copie e cole o conteúdo do arquivo `scripts/setup-mysql-completo.sql` no MySQL Workbench e execute.

### 1.3 Verificar a Instalação

\`\`\`sql
USE estacionamento_2bec;
SHOW TABLES;
SELECT * FROM users;
\`\`\`

Você deve ver 3 tabelas criadas e 2 usuários cadastrados.

## Passo 2: Configurar as Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=estacionamento_2bec
\`\`\`

2. Substitua `sua_senha_mysql` pela senha do seu MySQL

## Passo 3: Instalar Dependências do Projeto

\`\`\`bash
npm install
\`\`\`

## Passo 4: Executar o Sistema

### Modo Desenvolvimento
\`\`\`bash
npm run dev
\`\`\`

O sistema estará disponível em: http://localhost:3000

### Modo Produção
\`\`\`bash
npm run build
npm start
\`\`\`

## Credenciais de Acesso

### Usuário Administrador
- **Usuário:** admin
- **Senha:** admin123

### Usuário Operador
- **Usuário:** operador
- **Senha:** operador123

**IMPORTANTE:** Altere essas senhas em produção!

## Solução de Problemas

### Erro: "Cannot connect to MySQL"

1. Verifique se o MySQL está rodando:
\`\`\`bash
# Windows
net start MySQL80

# Linux/macOS
sudo systemctl status mysql
\`\`\`

2. Verifique as credenciais no arquivo `.env.local`

3. Teste a conexão manualmente:
\`\`\`bash
mysql -u root -p -h localhost
\`\`\`

### Erro: "Table doesn't exist"

Execute novamente o script SQL:
\`\`\`bash
mysql -u root -p < scripts/setup-mysql-completo.sql
\`\`\`

### Erro: "Access denied for user"

1. Verifique a senha no arquivo `.env.local`
2. Recrie o usuário no MySQL:
\`\`\`sql
DROP USER IF EXISTS 'root'@'localhost';
CREATE USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

## Manutenção

### Backup do Banco de Dados
\`\`\`bash
mysqldump -u root -p estacionamento_2bec > backup_$(date +%Y%m%d).sql
\`\`\`

### Restaurar Backup
\`\`\`bash
mysql -u root -p estacionamento_2bec < backup_20250114.sql
\`\`\`

### Limpar Dados de Teste
\`\`\`sql
USE estacionamento_2bec;
DELETE FROM parking_cards WHERE created_by = (SELECT id FROM users WHERE username = 'admin');
\`\`\`

## Suporte

Para problemas ou dúvidas, consulte:
- `docs/VERIFICACAO_BANCO.md` - Verificação do banco de dados
- `docs/TROUBLESHOOTING_AUTH.md` - Problemas de autenticação
- `docs/API_DOCUMENTATION.md` - Documentação da API
