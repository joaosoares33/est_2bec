import { type NextRequest, NextResponse } from "next/server"
import { ParkingDB } from "@/lib/parking-db"

// GET - Buscar cartão por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const card = await ParkingDB.getById(params.id)

    if (!card) {
      return NextResponse.json({ success: false, error: "Cartão não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: card })
  } catch (error) {
    console.error("Erro ao buscar cartão:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar cartão" }, { status: 500 })
  }
}

// PUT - Atualizar cartão
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { formData, userId } = body

    if (!formData || !userId) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    const card = await ParkingDB.update(params.id, formData, userId)

    if (!card) {
      return NextResponse.json({ success: false, error: "Cartão não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: card })
  } catch (error) {
    console.error("Erro ao atualizar cartão:", error)
    return NextResponse.json({ success: false, error: "Erro ao atualizar cartão" }, { status: 500 })
  }
}

// DELETE - Deletar cartão
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
    }

    const success = await ParkingDB.delete(params.id, userId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Cartão não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar cartão:", error)
    return NextResponse.json({ success: false, error: "Erro ao deletar cartão" }, { status: 500 })
  }
}
