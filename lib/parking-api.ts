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
      const errorData = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      throw new Error(errorData.message || errorData.error || `Erro na requisição: ${response.status}`)
    }

    return response.json()
  }

  static async getAll(): Promise<ParkingCard[]> {
    const data = await this.fetchAPI("/api/parking-cards")
    return data.cards || []
  }

  static async getById(id: string): Promise<ParkingCard | null> {
    const data = await this.fetchAPI(`/api/parking-cards/${id}`)
    return data.card || null
  }

  static async create(formData: ParkingCardFormData): Promise<ParkingCard> {
    const data = await this.fetchAPI("/api/parking-cards", {
      method: "POST",
      body: JSON.stringify(formData),
    })
    return data.card
  }

  static async update(id: string, formData: ParkingCardFormData): Promise<ParkingCard> {
    const data = await this.fetchAPI(`/api/parking-cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(formData),
    })
    return data.card
  }

  static async delete(id: string): Promise<boolean> {
    await this.fetchAPI(`/api/parking-cards/${id}`, {
      method: "DELETE",
    })
    return true
  }

  static async toggleStatus(id: string): Promise<ParkingCard | null> {
    const data = await this.fetchAPI(`/api/parking-cards/${id}/toggle-status`, {
      method: "PATCH",
    })
    return data.card || null
  }

  static async search(query: string): Promise<ParkingCard[]> {
    const data = await this.fetchAPI(`/api/parking-cards?search=${encodeURIComponent(query)}`)
    return data.cards || []
  }
}
