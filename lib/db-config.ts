import mysql from "mysql2/promise"

// Configuração da conexão com MySQL
export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "estacionamento_2bec",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de conexões
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!pool) {
    console.log("[v0] Criando pool de conexões MySQL com config:", {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
    })
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Função auxiliar para executar queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  console.log("[v0] Executando query SQL:", sql.substring(0, 100) + "...")
  console.log("[v0] Parâmetros:", params)

  try {
    const connection = await getPool().getConnection()
    console.log("[v0] Conexão obtida do pool")

    try {
      const [results] = await connection.execute(sql, params)
      console.log("[v0] Query executada com sucesso")
      return results as T
    } finally {
      connection.release()
      console.log("[v0] Conexão liberada")
    }
  } catch (error) {
    console.error("[v0] Erro ao executar query:", error)
    console.error("[v0] SQL:", sql)
    console.error("[v0] Params:", params)
    throw error
  }
}
