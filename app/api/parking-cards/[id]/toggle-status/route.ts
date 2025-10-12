import { type NextRequest, NextResponse } from "next/server"
import { ParkingDB } from "@/lib/parking-db"

// POST - Alternar status do cartão
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    const card = await ParkingDB.toggleStatus(params.id, userId)

    if (!card) {
      return NextResponse.json({ success: false, error: "Cartão não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: card })
  } catch (error) {
    console.error("Erro ao alternar status:", error)
    return NextResponse.json({ success: false, error: "Erro ao alternar status" }, { status: 500 })
  }
}
