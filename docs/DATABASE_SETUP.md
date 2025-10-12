# Configuração do Banco de Dados MySQL

## Requisitos

- MySQL 8.0 ou superior
- Acesso com privilégios de criação de banco de dados

## Instalação

### 1. Executar Script de Criação

Execute o script de criação do banco de dados:

\`\`\`bash
mysql -u root -p < scripts/create-database.sql
\`\`\`

### 2. Inserir Dados de Exemplo (Opcional)

Para inserir dados de exemplo para testes:

\`\`\`bash
mysql -u root -p < scripts/seed-sample-data.sql
\`\`\`

## Estrutura do Banco de Dados

### Tabela: users

Armazena os usuários do sistema.

**Campos:**
- `id`: Identificador único (UUID)
- `username`: Nome de usuário (único)
- `email`: Email do usuário (único)
- `password`: Hash da senha (bcrypt)
- `role`: Papel do usuário (admin/user)
- `full_name`: Nome completo
- `status`: Status do usuário (active/inactive)
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela: parking_cards

Armazena os cartões de estacionamento.

**Campos:**
- `id`: Identificador único (UUID)
- `military_name`: Nome completo do militar
- `rank`: Posto/Graduação
- `war_name`: Nome de guerra
- `vehicle_plate`: Placa do veículo
- `vehicle_model`: Modelo do veículo
- `vehicle_color`: Cor do veículo
- `vehicle_type`: Tipo do veículo (carro/moto/caminhonete/van/onibus)
- `issue_type`: Tipo de emissão (provisorio/definitivo)
- `valid_until`: Data de validade
- `status`: Status do cartão (active/inactive)
- `created_at`: Data de criação
- `created_by`: ID do usuário que criou
- `updated_at`: Data de atualização
- `updated_by`: ID do usuário que atualizou

### Tabela: parking_cards_history

Armazena o histórico de alterações para auditoria.

**Campos:**
- `id`: Identificador único (auto-increment)
- `card_id`: ID do cartão relacionado
- `action`: Tipo de ação (created/updated/deleted/activated/deactivated)
- `changed_by`: ID do usuário que fez a alteração
- `changed_at`: Data da alteração
- `old_data`: Dados anteriores (JSON)
- `new_data`: Novos dados (JSON)

## Usuários Padrão

### Administrador
- **Usuário:** admin
- **Email:** admin@2bec.mil.br
- **Senha:** admin123
- **Papel:** admin

### Usuário Comum
- **Usuário:** usuario
- **Email:** usuario@2bec.mil.br
- **Senha:** user123
- **Papel:** user

**IMPORTANTE:** Altere as senhas padrão após a primeira instalação!

## Configuração da Aplicação

Adicione as seguintes variáveis de ambiente no arquivo `.env`:

\`\`\`env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=estacionamento_2bec
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
\`\`\`

## Queries Úteis

Consulte o arquivo `scripts/queries-uteis.sql` para queries comuns de consulta e relatórios.

## Backup

Recomenda-se fazer backup regular do banco de dados:

\`\`\`bash
mysqldump -u root -p estacionamento_2bec > backup_$(date +%Y%m%d).sql
\`\`\`

## Restauração

Para restaurar um backup:

\`\`\`bash
mysql -u root -p estacionamento_2bec < backup_20250111.sql
\`\`\`

## Manutenção

### Limpar histórico antigo (mais de 1 ano)

\`\`\`sql
DELETE FROM parking_cards_history 
WHERE changed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
\`\`\`

### Otimizar tabelas

\`\`\`sql
OPTIMIZE TABLE users, parking_cards, parking_cards_history;
