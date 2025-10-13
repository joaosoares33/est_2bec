# Troubleshooting - Problemas de Autenticação

## Problema: "Usuário e senha inválidos"

### Passos para Diagnóstico

#### 1. Verificar se o banco de dados foi criado corretamente

\`\`\`bash
mysql -u root -p
\`\`\`

\`\`\`sql
USE estacionamento_2bec;
SELECT * FROM users;
\`\`\`

**Resultado esperado:**
- Deve mostrar 2 usuários: `admin` e `operador`
- Senhas devem ser: `admin123` e `operador123`

#### 2. Verificar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=estacionamento_2bec
\`\`\`

**Importante:** Substitua `sua_senha_mysql` pela senha do seu MySQL.

#### 3. Verificar os logs do console

Após adicionar os logs de debug, verifique o console do navegador (F12) e o terminal onde o Next.js está rodando. Os logs mostrarão:

- Se a conexão com o banco está funcionando
- Se o usuário foi encontrado no banco
- Se a senha está sendo comparada corretamente

#### 4. Testar a conexão com o banco manualmente

Crie um arquivo de teste `test-db.js` na raiz do projeto:

\`\`\`javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'sua_senha_mysql',
      database: 'estacionamento_2bec'
    });

    console.log('✅ Conexão estabelecida com sucesso!');

    const [rows] = await connection.execute('SELECT * FROM users');
    console.log('✅ Usuários encontrados:', rows);

    await connection.end();
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
\`\`\`

Execute:
\`\`\`bash
node test-db.js
\`\`\`

#### 5. Problemas Comuns e Soluções

##### Erro: "Access denied for user"
**Causa:** Senha do MySQL incorreta ou usuário sem permissões.

**Solução:**
\`\`\`sql
-- Criar usuário com permissões
CREATE USER 'estacionamento'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON estacionamento_2bec.* TO 'estacionamento'@'localhost';
FLUSH PRIVILEGES;
\`\`\`

Atualize o `.env.local`:
\`\`\`env
DB_USER=estacionamento
DB_PASSWORD=senha_segura
\`\`\`

##### Erro: "Unknown database"
**Causa:** Banco de dados não foi criado.

**Solução:**
\`\`\`bash
mysql -u root -p < scripts/setup-completo-mysql.sql
\`\`\`

##### Erro: "Table 'users' doesn't exist"
**Causa:** Tabelas não foram criadas.

**Solução:**
Execute o script SQL completo novamente.

##### Senha não confere
**Causa:** Senhas no banco podem estar diferentes.

**Solução:**
\`\`\`sql
-- Atualizar senhas manualmente
UPDATE users SET password = 'admin123' WHERE username = 'admin';
UPDATE users SET password = 'operador123' WHERE username = 'operador';
\`\`\`

#### 6. Credenciais Padrão

Após executar o script SQL, use estas credenciais:

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`

**Operador:**
- Usuário: `operador`
- Senha: `operador123`

#### 7. Verificar se o Next.js está lendo as variáveis de ambiente

Reinicie o servidor Next.js após criar/modificar o `.env.local`:

\`\`\`bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
\`\`\`

#### 8. Verificar se o mysql2 está instalado

\`\`\`bash
npm install mysql2
\`\`\`

## Checklist de Verificação

- [ ] Banco de dados `estacionamento_2bec` existe
- [ ] Tabela `users` existe e tem dados
- [ ] Arquivo `.env.local` está configurado corretamente
- [ ] Senha do MySQL está correta no `.env.local`
- [ ] Servidor Next.js foi reiniciado após configurar `.env.local`
- [ ] Pacote `mysql2` está instalado
- [ ] Logs de debug aparecem no console
- [ ] Credenciais corretas: `admin` / `admin123`

## Suporte Adicional

Se o problema persistir após seguir todos os passos:

1. Verifique os logs de debug no console do navegador (F12)
2. Verifique os logs no terminal do Next.js
3. Execute o teste de conexão manual (`test-db.js`)
4. Verifique se o MySQL está rodando: `sudo systemctl status mysql` (Linux) ou verifique nos serviços do Windows
