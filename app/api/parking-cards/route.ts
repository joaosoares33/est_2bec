import { type NextRequest, NextResponse } from "next/server"
import { ParkingDB } from "@/lib/parking-db"

// GET - Buscar todos os cartões ou pesquisar
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    let cards
    if (query) {
      cards = await ParkingDB.search(query)
    } else {
      cards = await ParkingDB.getAll()
    }

    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    console.error("Erro ao buscar cartões:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar cartões" }, { status: 500 })
  }
}

// POST - Criar novo cartão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formData, userId } = body

    if (!formData || !userId) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    const card = await ParkingDB.create(formData, userId)

    return NextResponse.json({ success: true, data: card }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cartão:", error)
    return NextResponse.json({ success: false, error: "Erro ao criar cartão" }, { status: 500 })
  }
}
