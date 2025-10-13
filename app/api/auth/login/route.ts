import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "estacionamento_2bec",
}

export async function POST(request: Request) {
  let connection

  try {
    const { username, password } = await request.json()

    console.log("[v0] Tentativa de login:", { username, passwordLength: password?.length })
    console.log("[v0] Configuração do banco:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      hasPassword: !!dbConfig.password,
    })

    if (!username || !password) {
      console.log("[v0] Erro: Usuário ou senha não fornecidos")
      return NextResponse.json({ error: "Usuário e senha são obrigatórios" }, { status: 400 })
    }

    // Conectar ao banco de dados
    console.log("[v0] Tentando conectar ao banco de dados...")
    connection = await mysql.createConnection(dbConfig)
    console.log("[v0] Conexão estabelecida com sucesso")

    // Buscar usuário no banco
    console.log("[v0] Buscando usuário no banco:", username)
    const [rows] = await connection.execute(
      "SELECT id, username, email, password, role, full_name, status, created_at, updated_at FROM users WHERE username = ? AND status = 'active'",
      [username],
    )

    const users = rows as any[]
    console.log("[v0] Usuários encontrados:", users.length)

    if (users.length === 0) {
      console.log("[v0] Erro: Usuário não encontrado ou inativo")
      return NextResponse.json({ error: "Usuário não encontrado ou inativo" }, { status: 401 })
    }

    const user = users[0]
    console.log("[v0] Usuário encontrado:", {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    })

    // Verificar senha (em produção, use bcrypt para hash)
    console.log("[v0] Comparando senhas:", {
      senhaFornecida: password,
      senhaBanco: user.password,
      match: user.password === password,
    })

    if (user.password !== password) {
      console.log("[v0] Erro: Senha incorreta")
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }

    console.log("[v0] Autenticação bem-sucedida!")

    // Retornar dados do usuário (sem a senha)
    const userData = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }

    return NextResponse.json({ user: userData }, { status: 200 })
  } catch (error) {
    console.error("[v0] Erro na autenticação:", error)
    return NextResponse.json({ error: "Erro ao autenticar usuário: " + (error as Error).message }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
