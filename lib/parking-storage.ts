import type { ParkingCard, ParkingCardFormData } from "./types"

const STORAGE_KEY = "parking_cards_2bec"

export class ParkingStorage {
  static getAll(): ParkingCard[] {
    if (typeof window === "undefined") {
      return []
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Erro ao carregar cartões:", error)
      return []
    }
  }

  static save(cards: ParkingCard[]): void {
    if (typeof window === "undefined") {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
    } catch (error) {
      console.error("Erro ao salvar cartões:", error)
    }
  }

  static create(formData: ParkingCardFormData): ParkingCard {
    const now = new Date()
    const validUntil = new Date(now)

    // Calcular data de validade baseada no tipo
    if (formData.issueType === "provisorio") {
      validUntil.setDate(now.getDate() + 30) // 30 dias
    } else {
      validUntil.setFullYear(now.getFullYear() + 1) // 1 ano
    }

    const newCard: ParkingCard = {
      id: crypto.randomUUID(),
      ...formData,
      validUntil: validUntil.toISOString(),
      createdAt: now.toISOString(),
      status: "active",
    }

    const cards = this.getAll()
    cards.push(newCard)
    this.save(cards)

    return newCard
  }

  static update(id: string, formData: ParkingCardFormData): ParkingCard | null {
    const cards = this.getAll()
    const index = cards.findIndex((card) => card.id === id)

    if (index === -1) {
      return null
    }

    const existingCard = cards[index]
    let validUntil = existingCard.validUntil

    // Recalcular validade se o tipo de emissão mudou
    if (existingCard.issueType !== formData.issueType) {
      const now = new Date()
      const newValidUntil = new Date(now)

      if (formData.issueType === "provisorio") {
        newValidUntil.setDate(now.getDate() + 30)
      } else {
        newValidUntil.setFullYear(now.getFullYear() + 1)
      }

      validUntil = newValidUntil.toISOString()
    }

    cards[index] = {
      ...existingCard,
      ...formData,
      validUntil,
    }

    this.save(cards)
    return cards[index]
  }

  static delete(id: string): boolean {
    const cards = this.getAll()
    const filteredCards = cards.filter((card) => card.id !== id)

    if (filteredCards.length === cards.length) {
      return false
    }

    this.save(filteredCards)
    return true
  }

  static toggleStatus(id: string): ParkingCard | null {
    const cards = this.getAll()
    const index = cards.findIndex((card) => card.id === id)

    if (index === -1) {
      return null
    }

    cards[index].status = cards[index].status === "active" ? "inactive" : "active"
    this.save(cards)
    return cards[index]
  }

  static search(query: string): ParkingCard[] {
    const cards = this.getAll()
    const lowercaseQuery = query.toLowerCase()

    return cards.filter(
      (card) =>
        card.militaryName.toLowerCase().includes(lowercaseQuery) ||
        card.rank.toLowerCase().includes(lowercaseQuery) ||
        card.warName.toLowerCase().includes(lowercaseQuery) ||
        card.vehiclePlate.toLowerCase().includes(lowercaseQuery) ||
        card.vehicleModel.toLowerCase().includes(lowercaseQuery),
    )
  }
}
