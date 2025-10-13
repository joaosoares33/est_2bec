import { type NextRequest, NextResponse } from "next/server"
import { ParkingDB } from "@/lib/parking-db"

// GET - Buscar todos os cartões ou pesquisar
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/parking-cards - Iniciando busca de cartões")

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")

    console.log("[v0] Parâmetro de busca:", search)

    let cards
    if (search) {
      console.log("[v0] Executando busca com query:", search)
      cards = await ParkingDB.search(search)
    } else {
      console.log("[v0] Buscando todos os cartões")
      cards = await ParkingDB.getAll()
    }

    console.log("[v0] Cartões encontrados:", cards.length)
    return NextResponse.json({ cards })
  } catch (error) {
    console.error("[v0] Erro ao buscar cartões:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")
    console.error("[v0] Mensagem:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        message: "Erro ao buscar cartões",
        error: error instanceof Error ? error.message : String(error),
        details: "Verifique se o banco de dados está configurado corretamente",
      },
      { status: 500 },
    )
  }
}

// POST - Criar novo cartão
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] ========== POST /api/parking-cards ==========")
    console.log("[v0] Iniciando criação de cartão")

    let formData
    try {
      formData = await request.json()
      console.log("[v0] Body parseado com sucesso:", formData)
    } catch (parseError) {
      console.error("[v0] Erro ao parsear JSON do body:", parseError)
      return NextResponse.json(
        {
          message: "Erro ao processar dados enviados",
          error: "JSON inválido",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    if (!formData || typeof formData !== "object") {
      console.error("[v0] Dados inválidos - formData não é um objeto válido")
      return NextResponse.json(
        {
          message: "Dados inválidos",
          error: "O corpo da requisição deve ser um objeto JSON válido",
        },
        { status: 400 },
      )
    }

    // Validar campos obrigatórios
    const requiredFields = [
      "militaryName",
      "rank",
      "warName",
      "vehiclePlate",
      "vehicleModel",
      "vehicleColor",
      "vehicleType",
      "issueType",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      console.error("[v0] Campos obrigatórios faltando:", missingFields)
      return NextResponse.json(
        {
          message: "Campos obrigatórios faltando",
          error: `Os seguintes campos são obrigatórios: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Validação passou, criando cartão no banco...")

    let card
    try {
      card = await ParkingDB.create(formData, "1")
      console.log("[v0] Cartão criado com sucesso no banco:", card)
    } catch (dbError) {
      console.error("[v0] Erro ao criar cartão no banco:", dbError)
      console.error("[v0] Stack do erro do banco:", dbError instanceof Error ? dbError.stack : "N/A")

      return NextResponse.json(
        {
          message: "Erro ao salvar cartão no banco de dados",
          error: dbError instanceof Error ? dbError.message : String(dbError),
          details: "Verifique se o banco de dados está configurado e acessível",
        },
        { status: 500 },
      )
    }

    console.log("[v0] ========== FIM POST (SUCESSO) ==========")
    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error("[v0] ========== ERRO CRÍTICO NO POST ==========")
    console.error("[v0] Erro:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")
    console.error("[v0] Mensagem:", error instanceof Error ? error.message : String(error))
    console.error("[v0] ========== FIM DO ERRO ==========")

    return NextResponse.json(
      {
        message: "Erro interno ao criar cartão",
        error: error instanceof Error ? error.message : String(error),
        details: "Erro inesperado no servidor. Verifique os logs para mais detalhes.",
      },
      { status: 500 },
    )
  }
}
