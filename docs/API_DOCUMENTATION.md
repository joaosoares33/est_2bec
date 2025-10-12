# Documentação da API - Sistema de Estacionamento 2º BEC

## 📡 Endpoints Disponíveis

### Cartões de Estacionamento

#### GET /api/parking-cards

Busca todos os cartões ou realiza pesquisa.

**Query Parameters:**
- `q` (opcional): Termo de busca

**Resposta de Sucesso (200):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "militaryName": "João Silva",
      "rank": "Soldado",
      "warName": "Silva",
      "vehiclePlate": "ABC-1234",
      "vehicleModel": "Gol",
      "vehicleColor": "Branco",
      "vehicleType": "carro",
      "issueType": "definitivo",
      "validUntil": "2026-01-01T00:00:00.000Z",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
\`\`\`

**Exemplo de Uso:**
\`\`\`javascript
// Buscar todos
const response = await fetch('/api/parking-cards')
const { data } = await response.json()

// Buscar com filtro
const response = await fetch('/api/parking-cards?q=Silva')
const { data } = await response.json()
\`\`\`

---

#### POST /api/parking-cards

Cria um novo cartão de estacionamento.

**Body:**
\`\`\`json
{
  "formData": {
    "militaryName": "João Silva",
    "rank": "Soldado",
    "warName": "Silva",
    "vehiclePlate": "ABC-1234",
    "vehicleModel": "Gol",
    "vehicleColor": "Branco",
    "vehicleType": "carro",
    "issueType": "definitivo"
  },
  "userId": "admin"
}
\`\`\`

**Resposta de Sucesso (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "militaryName": "João Silva",
    "rank": "Soldado",
    "warName": "Silva",
    "vehiclePlate": "ABC-1234",
    "vehicleModel": "Gol",
    "vehicleColor": "Branco",
    "vehicleType": "carro",
    "issueType": "definitivo",
    "validUntil": "2026-01-01T00:00:00.000Z",
    "status": "active",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
\`\`\`

**Exemplo de Uso:**
\`\`\`javascript
const response = await fetch('/api/parking-cards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formData: { /* dados do formulário */ },
    userId: 'admin'
  })
})
const { data } = await response.json()
\`\`\`

---

#### GET /api/parking-cards/[id]

Busca um cartão específico por ID.

**Resposta de Sucesso (200):**
\`\`\`json
{
  "success": true,
  "data": { /* dados do cartão */ }
}
\`\`\`

**Resposta de Erro (404):**
\`\`\`json
{
  "success": false,
  "error": "Cartão não encontrado"
}
\`\`\`

---

#### PUT /api/parking-cards/[id]

Atualiza um cartão existente.

**Body:**
\`\`\`json
{
  "formData": { /* dados atualizados */ },
  "userId": "admin"
}
\`\`\`

**Resposta de Sucesso (200):**
\`\`\`json
{
  "success": true,
  "data": { /* cartão atualizado */ }
}
\`\`\`

---

#### DELETE /api/parking-cards/[id]

Remove um cartão (soft delete).

**Body:**
\`\`\`json
{
  "userId": "admin"
}
\`\`\`

**Resposta de Sucesso (200):**
\`\`\`json
{
  "success": true
}
\`\`\`

---

#### POST /api/parking-cards/[id]/toggle-status

Alterna o status do cartão entre ativo e inativo.

**Body:**
\`\`\`json
{
  "userId": "admin"
}
\`\`\`

**Resposta de Sucesso (200):**
\`\`\`json
{
  "success": true,
  "data": { /* cartão com status atualizado */ }
}
\`\`\`

## 🔐 Autenticação

Atualmente o sistema usa autenticação básica com userId. Em produção, implemente:

- JWT tokens
- Sessões seguras
- Rate limiting
- CORS apropriado

## 🚨 Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro no servidor)

## 📝 Notas

- Todas as datas são retornadas em formato ISO 8601
- O soft delete mantém os dados no banco mas marca como deletado
- O histórico de alterações é registrado automaticamente
