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
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

// Função auxiliar para executar queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const connection = await getPool().getConnection()
  try {
    const [results] = await connection.execute(sql, params)
    return results as T
  } finally {
    connection.release()
  }
}
