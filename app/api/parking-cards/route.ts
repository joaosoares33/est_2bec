import { type NextRequest, NextResponse } from "next/server"
import { ParkingDB } from "@/lib/parking-db"

// GET - Buscar todos os cartões ou pesquisar
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    let cards
    if (search) {
      cards = await ParkingDB.search(search)
    } else {
      cards = await ParkingDB.getAll()
    }

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Erro ao buscar cartões:", error)
    return NextResponse.json({ message: "Erro ao buscar cartões" }, { status: 500 })
  }
}

// POST - Criar novo cartão
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    if (!formData) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 })
    }

    const card = await ParkingDB.create(formData, 1)

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cartão:", error)
    return NextResponse.json({ message: "Erro ao criar cartão" }, { status: 500 })
  }
}
