import type { ParkingCard, ParkingCardFormData } from "./types"

export class ParkingAPI {
  private static async fetchAPI(endpoint: string, options?: RequestInit) {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      throw new Error(error.message || `Erro na requisição: ${response.status}`)
    }

    return response.json()
  }

  static async getAll(): Promise<ParkingCard[]> {
    try {
      const data = await this.fetchAPI("/api/parking-cards")
      return data.cards || []
    } catch (error) {
      console.error("Erro ao carregar cartões:", error)
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
      const data = await this.fetchAPI("/api/parking-cards", {
        method: "POST",
        body: JSON.stringify(formData),
      })
      return data.card
    } catch (error) {
      console.error("Erro ao criar cartão:", error)
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
