# Teste de Conexão com MySQL

## Verificar se o MySQL está rodando

Execute este comando no terminal:

\`\`\`bash
# Windows
net start | findstr MySQL

# Linux/Mac
sudo systemctl status mysql
# ou
ps aux | grep mysql
\`\`\`

## Testar conexão manualmente

Crie um arquivo `test-connection.js` na raiz do projeto:

\`\`\`javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Tentando conectar ao MySQL...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'estacionamento_2bec'
    });

    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Query executada:', rows);
    
    // Verificar tabelas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Tabelas no banco:', tables);
    
    await connection.end();
    console.log('✅ Conexão fechada');
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();
\`\`\`

Execute:

\`\`\`bash
node test-connection.js
\`\`\`

## Verificar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=estacionamento_2bec
\`\`\`

## Verificar se o banco de dados existe

\`\`\`sql
SHOW DATABASES;
USE estacionamento_2bec;
SHOW TABLES;
\`\`\`

## Verificar se as tabelas foram criadas

\`\`\`sql
DESCRIBE parking_cards;
DESCRIBE users;
DESCRIBE parking_cards_history;
\`\`\`

## Problemas comuns

### 1. Erro: "Access denied for user"
- Verifique usuário e senha no `.env.local`
- Verifique se o usuário tem permissões no banco

### 2. Erro: "Unknown database"
- Execute o script `setup-completo-mysql.sql`
- Ou crie o banco manualmente: `CREATE DATABASE estacionamento_2bec;`

### 3. Erro: "Can't connect to MySQL server"
- Verifique se o MySQL está rodando
- Verifique host e porta no `.env.local`

### 4. Erro: "Table doesn't exist"
- Execute o script de criação de tabelas
- Verifique se está usando o banco correto: `USE estacionamento_2bec;`
