import { NextResponse } from "next/server"
import { getPool } from "@/lib/db-config"

export async function GET() {
  try {
    // Tenta fazer uma query simples para verificar a conexão
    const pool = getPool()
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()

    return NextResponse.json({ status: "ok", database: "connected" })
  } catch (error) {
    console.error("[v0] Health check falhou:", error)
    return NextResponse.json(
      { status: "error", database: "disconnected", error: error instanceof Error ? error.message : String(error) },
      { status: 503 },
    )
  }
}
