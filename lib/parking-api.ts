import type { ParkingCard, ParkingCardFormData } from "./types"

export class ParkingAPI {
  private static async fetchAPI(endpoint: string, options?: RequestInit) {
    console.log("[v0] ========== INÍCIO DA REQUISIÇÃO ==========")
    console.log("[v0] Endpoint:", endpoint)
    console.log("[v0] Método:", options?.method || "GET")
    console.log("[v0] Body:", options?.body)

    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })

      console.log("[v0] Status da resposta:", response.status)
      console.log("[v0] Status text:", response.statusText)
      console.log("[v0] Response OK:", response.ok)

      if (!response.ok) {
        let errorData
        const contentType = response.headers.get("content-type")

        console.log("[v0] Content-Type da resposta:", contentType)

        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json()
          console.log("[v0] Erro JSON recebido:", errorData)
        } else {
          const textError = await response.text()
          console.log("[v0] Erro em texto recebido:", textError)
          errorData = { message: textError || "Erro desconhecido" }
        }

        const errorMessage = errorData.message || errorData.error || `Erro na requisição: ${response.status}`
        console.error("[v0] Mensagem de erro final:", errorMessage)
        console.error("[v0] Detalhes do erro:", errorData.details || "Sem detalhes")

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("[v0] Dados recebidos com sucesso:", data)
      console.log("[v0] ========== FIM DA REQUISIÇÃO (SUCESSO) ==========")
      return data
    } catch (error) {
      console.error("[v0] ========== ERRO NA REQUISIÇÃO ==========")
      console.error("[v0] Tipo do erro:", error instanceof Error ? "Error" : typeof error)
      console.error("[v0] Mensagem:", error instanceof Error ? error.message : String(error))
      console.error("[v0] Stack:", error instanceof Error ? error.stack : "N/A")
      console.error("[v0] ========== FIM DO ERRO ==========")
      throw error
    }
  }

  static async getAll(): Promise<ParkingCard[]> {
    try {
      console.log("[v0] ParkingAPI.getAll() - Iniciando")
      const data = await this.fetchAPI("/api/parking-cards")
      console.log("[v0] ParkingAPI.getAll() - Dados recebidos:", data)
      return data.cards || []
    } catch (error) {
      console.error("[v0] Erro ao carregar cartões:", error)
      throw error
    }
  }

  static async getById(id: string): Promise<ParkingCard | null> {
    try {
      const data = await this.fetchAPI(`/api/parking-cards/${id}`)
      return data.card || null
    } catch (error) {
      console.error("Erro ao carregar cartão:", error)
      return null
    }
  }

  static async create(formData: ParkingCardFormData): Promise<ParkingCard> {
    try {
      console.log("[v0] ParkingAPI.create() - Iniciando criação")
      console.log("[v0] Dados a serem enviados:", formData)

      const data = await this.fetchAPI("/api/parking-cards", {
        method: "POST",
        body: JSON.stringify(formData),
      })

      console.log("[v0] ParkingAPI.create() - Cartão criado com sucesso:", data.card)
      return data.card
    } catch (error) {
      console.error("[v0] ParkingAPI.create() - Erro ao criar cartão:", error)
      throw error
    }
  }

  static async update(id: string, formData: ParkingCardFormData): Promise<ParkingCard> {
    try {
      const data = await this.fetchAPI(`/api/parking-cards/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      })
      return data.card
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error)
      throw error
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/api/parking-cards/${id}`, {
        method: "DELETE",
      })
      return true
    } catch (error) {
      console.error("Erro ao deletar cartão:", error)
      return false
    }
  }

  static async toggleStatus(id: string): Promise<ParkingCard | null> {
    try {
      const data = await this.fetchAPI(`/api/parking-cards/${id}/toggle-status`, {
        method: "PATCH",
      })
      return data.card || null
    } catch (error) {
      console.error("Erro ao alternar status:", error)
      return null
    }
  }

  static async search(query: string): Promise<ParkingCard[]> {
    try {
      const data = await this.fetchAPI(`/api/parking-cards?search=${encodeURIComponent(query)}`)
      return data.cards || []
    } catch (error) {
      console.error("Erro ao buscar cartões:", error)
      return []
    }
  }
}
