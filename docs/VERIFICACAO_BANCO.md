# Verificação do Banco de Dados MySQL

## Checklist de Verificação

### 1. Verificar se o MySQL está rodando

\`\`\`bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl status mysql
# ou
sudo service mysql status
\`\`\`

### 2. Verificar se o banco de dados existe

\`\`\`bash
mysql -u root -p
\`\`\`

\`\`\`sql
SHOW DATABASES;
USE estacionamento_2bec;
SHOW TABLES;
\`\`\`

### 3. Verificar se as tabelas foram criadas

\`\`\`sql
DESCRIBE users;
DESCRIBE parking_cards;
DESCRIBE parking_cards_history;
\`\`\`

### 4. Verificar se há dados nas tabelas

\`\`\`sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM parking_cards;

-- Ver usuários cadastrados
SELECT id, username, name, role FROM users;

-- Ver cartões cadastrados
SELECT id, military_name, vehicle_plate, status FROM parking_cards WHERE deleted_at IS NULL;
\`\`\`

### 5. Verificar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=estacionamento_2bec
\`\`\`

### 6. Testar conexão manualmente

Crie um arquivo `test-db.js` na raiz do projeto:

\`\`\`javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'sua_senha_aqui',
      database: 'estacionamento_2bec'
    });

    console.log('✅ Conexão estabelecida com sucesso!');

    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM parking_cards');
    console.log('✅ Total de cartões:', rows[0].total);

    await connection.end();
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
  }
}

testConnection();
\`\`\`

Execute:
\`\`\`bash
node test-db.js
\`\`\`

### 7. Problemas Comuns

#### Erro: "ER_NOT_SUPPORTED_AUTH_MODE"
\`\`\`sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha';
FLUSH PRIVILEGES;
\`\`\`

#### Erro: "ER_ACCESS_DENIED_ERROR"
- Verifique usuário e senha no `.env.local`
- Verifique se o usuário tem permissões:
\`\`\`sql
GRANT ALL PRIVILEGES ON estacionamento_2bec.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

#### Erro: "ER_BAD_DB_ERROR"
- O banco de dados não existe
- Execute o script `setup-completo-mysql.sql`

### 8. Reiniciar o servidor Next.js

Após configurar o banco e as variáveis de ambiente:

\`\`\`bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
\`\`\`

### 9. Verificar logs do navegador

Abra o console do navegador (F12) e verifique os logs com prefixo `[v0]` para identificar onde está o erro.

### 10. Verificar logs do servidor

No terminal onde o Next.js está rodando, verifique os logs com prefixo `[v0]` para ver detalhes da conexão e queries.
