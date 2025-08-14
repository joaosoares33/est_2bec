import type { ParkingCard, ParkingCardFormData } from "./types"

const STORAGE_KEY = "parking_cards_2bec"

export class ParkingStorage {
  static getAll(): ParkingCard[] {
    console.log("🔍 ParkingStorage.getAll() chamado")
    if (typeof window === "undefined") {
      console.log("❌ Window undefined - retornando array vazio")
      return []
    }

    const data = localStorage.getItem(STORAGE_KEY)
    console.log("📦 Dados do localStorage:", data ? "ENCONTRADOS" : "VAZIOS")

    const result = data ? JSON.parse(data) : []
    console.log("📊 Total de cartões encontrados:", result.length)

    return result
  }

  static save(cards: ParkingCard[]): void {
    console.log("💾 ParkingStorage.save() chamado com", cards.length, "cartões")
    if (typeof window === "undefined") {
      console.log("❌ Window undefined - não salvando")
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
      console.log("✅ Dados salvos no localStorage com sucesso")

      // Verificar se realmente salvou
      const verification = localStorage.getItem(STORAGE_KEY)
      if (verification) {
        const parsed = JSON.parse(verification)
        console.log("✅ Verificação: salvou", parsed.length, "cartões")
      } else {
        console.log("❌ Verificação: dados não encontrados após salvar")
      }
    } catch (error) {
      console.error("❌ Erro ao salvar no localStorage:", error)
    }
  }

  static create(formData: ParkingCardFormData): ParkingCard {
    console.log("🆕 ParkingStorage.create() chamado")
    console.log("📝 Dados recebidos:", formData)

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

    console.log("🎫 Novo cartão criado:", newCard)

    const cards = this.getAll()
    console.log("📋 Cartões existentes antes de adicionar:", cards.length)

    cards.push(newCard)
    console.log("📋 Total de cartões após adicionar:", cards.length)

    this.save(cards)

    // Verificar se realmente foi salvo
    const verification = this.getAll()
    console.log("🔍 Verificação final: total de cartões após salvar:", verification.length)

    const foundCard = verification.find((c) => c.id === newCard.id)
    if (foundCard) {
      console.log("✅ Cartão encontrado na verificação:", foundCard.id)
    } else {
      console.log("❌ Cartão NÃO encontrado na verificação!")
    }

    return newCard
  }

  static update(id: string, formData: ParkingCardFormData): ParkingCard | null {
    console.log("🔄 ParkingStorage.update() chamado para o cartão com ID:", id)
    console.log("📝 Dados recebidos:", formData)

    const cards = this.getAll()
    const index = cards.findIndex((card) => card.id === id)

    if (index === -1) {
      console.log("❌ Cartão com ID", id, "não encontrado")
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

    console.log("🔄 Cartão atualizado:", cards[index])

    this.save(cards)

    // Verificar se realmente foi atualizado
    const verification = this.getAll()
    const updatedCard = verification.find((c) => c.id === id)
    if (updatedCard) {
      console.log("✅ Verificação final: cartão com ID", id, "atualizado com sucesso")
    } else {
      console.log("❌ Verificação final: cartão com ID", id, "NÃO encontrado após atualização")
    }

    return cards[index]
  }

  static delete(id: string): boolean {
    console.log("🗑️ ParkingStorage.delete() chamado para o cartão com ID:", id)

    const cards = this.getAll()
    const filteredCards = cards.filter((card) => card.id !== id)

    if (filteredCards.length === cards.length) {
      console.log("❌ Cartão com ID", id, "não encontrado")
      return false
    }

    console.log("🗑️ Cartão com ID", id, "removido")

    this.save(filteredCards)

    // Verificar se realmente foi removido
    const verification = this.getAll()
    const deletedCard = verification.find((c) => c.id === id)
    if (!deletedCard) {
      console.log("✅ Verificação final: cartão com ID", id, "removido com sucesso")
    } else {
      console.log("❌ Verificação final: cartão com ID", id, "ainda encontrado após remoção")
    }

    return true
  }

  static toggleStatus(id: string): ParkingCard | null {
    console.log("🔄 ParkingStorage.toggleStatus() chamado para o cartão com ID:", id)

    const cards = this.getAll()
    const index = cards.findIndex((card) => card.id === id)

    if (index === -1) {
      console.log("❌ Cartão com ID", id, "não encontrado")
      return null
    }

    cards[index].status = cards[index].status === "active" ? "inactive" : "active"
    console.log("🔄 Status do cartão com ID", id, "alterado para:", cards[index].status)

    this.save(cards)

    // Verificar se realmente foi alterado
    const verification = this.getAll()
    const toggledCard = verification.find((c) => c.id === id)
    if (toggledCard) {
      console.log("✅ Verificação final: status do cartão com ID", id, "alterado com sucesso para:", toggledCard.status)
    } else {
      console.log("❌ Verificação final: cartão com ID", id, "NÃO encontrado após alteração de status")
    }

    return cards[index]
  }

  static search(query: string): ParkingCard[] {
    console.log("🔍 ParkingStorage.search() chamado com query:", query)

    const cards = this.getAll()
    const lowercaseQuery = query.toLowerCase()

    const result = cards.filter(
      (card) =>
        card.militaryName.toLowerCase().includes(lowercaseQuery) ||
        card.rank.toLowerCase().includes(lowercaseQuery) ||
        card.warName.toLowerCase().includes(lowercaseQuery) ||
        card.vehiclePlate.toLowerCase().includes(lowercaseQuery) ||
        card.vehicleModel.toLowerCase().includes(lowercaseQuery),
    )

    console.log("🔍 Total de cartões encontrados na pesquisa:", result.length)

    return result
  }
}
