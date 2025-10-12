import { query } from "./db-config"
import type { ParkingCard, ParkingCardFormData } from "./types"

export class ParkingDB {
  // Buscar todos os cartões
  static async getAll(): Promise<ParkingCard[]> {
    const sql = `
      SELECT 
        id,
        military_name as militaryName,
        rank,
        war_name as warName,
        vehicle_plate as vehiclePlate,
        vehicle_model as vehicleModel,
        vehicle_color as vehicleColor,
        vehicle_type as vehicleType,
        issue_type as issueType,
        valid_until as validUntil,
        status,
        created_at as createdAt
      FROM parking_cards
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `

    const results = await query<any[]>(sql)
    return results.map((row) => ({
      ...row,
      validUntil: row.validUntil.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }))
  }

  // Criar novo cartão
  static async create(formData: ParkingCardFormData, userId: string): Promise<ParkingCard> {
    const now = new Date()
    const validUntil = new Date(now)

    // Calcular data de validade baseada no tipo
    if (formData.issueType === "provisorio") {
      validUntil.setDate(now.getDate() + 30) // 30 dias
    } else {
      validUntil.setFullYear(now.getFullYear() + 1) // 1 ano
    }

    const id = crypto.randomUUID()

    const sql = `
      INSERT INTO parking_cards (
        id, military_name, rank, war_name, vehicle_plate, 
        vehicle_model, vehicle_color, vehicle_type, issue_type, 
        valid_until, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `

    await query(sql, [
      id,
      formData.militaryName,
      formData.rank,
      formData.warName,
      formData.vehiclePlate,
      formData.vehicleModel,
      formData.vehicleColor,
      formData.vehicleType,
      formData.issueType,
      validUntil,
      userId,
    ])

    return {
      id,
      ...formData,
      validUntil: validUntil.toISOString(),
      createdAt: now.toISOString(),
      status: "active",
    }
  }

  // Atualizar cartão
  static async update(id: string, formData: ParkingCardFormData, userId: string): Promise<ParkingCard | null> {
    // Buscar cartão existente
    const existingCard = await this.getById(id)
    if (!existingCard) {
      return null
    }

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

    const sql = `
      UPDATE parking_cards 
      SET 
        military_name = ?,
        rank = ?,
        war_name = ?,
        vehicle_plate = ?,
        vehicle_model = ?,
        vehicle_color = ?,
        vehicle_type = ?,
        issue_type = ?,
        valid_until = ?,
        updated_at = NOW(),
        updated_by = ?
      WHERE id = ? AND deleted_at IS NULL
    `

    await query(sql, [
      formData.militaryName,
      formData.rank,
      formData.warName,
      formData.vehiclePlate,
      formData.vehicleModel,
      formData.vehicleColor,
      formData.vehicleType,
      formData.issueType,
      validUntil,
      userId,
      id,
    ])

    return {
      ...existingCard,
      ...formData,
      validUntil,
    }
  }

  // Buscar cartão por ID
  static async getById(id: string): Promise<ParkingCard | null> {
    const sql = `
      SELECT 
        id,
        military_name as militaryName,
        rank,
        war_name as warName,
        vehicle_plate as vehiclePlate,
        vehicle_model as vehicleModel,
        vehicle_color as vehicleColor,
        vehicle_type as vehicleType,
        issue_type as issueType,
        valid_until as validUntil,
        status,
        created_at as createdAt
      FROM parking_cards
      WHERE id = ? AND deleted_at IS NULL
    `

    const results = await query<any[]>(sql, [id])

    if (results.length === 0) {
      return null
    }

    const row = results[0]
    return {
      ...row,
      validUntil: row.validUntil.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }
  }

  // Deletar cartão (soft delete)
  static async delete(id: string, userId: string): Promise<boolean> {
    const sql = `
      UPDATE parking_cards 
      SET deleted_at = NOW(), updated_by = ?
      WHERE id = ? AND deleted_at IS NULL
    `

    const result = await query<any>(sql, [userId, id])
    return result.affectedRows > 0
  }

  // Alternar status do cartão
  static async toggleStatus(id: string, userId: string): Promise<ParkingCard | null> {
    const card = await this.getById(id)
    if (!card) {
      return null
    }

    const newStatus = card.status === "active" ? "inactive" : "active"

    const sql = `
      UPDATE parking_cards 
      SET status = ?, updated_at = NOW(), updated_by = ?
      WHERE id = ? AND deleted_at IS NULL
    `

    await query(sql, [newStatus, userId, id])

    return {
      ...card,
      status: newStatus,
    }
  }

  // Buscar cartões
  static async search(searchQuery: string): Promise<ParkingCard[]> {
    const sql = `
      SELECT 
        id,
        military_name as militaryName,
        rank,
        war_name as warName,
        vehicle_plate as vehiclePlate,
        vehicle_model as vehicleModel,
        vehicle_color as vehicleColor,
        vehicle_type as vehicleType,
        issue_type as issueType,
        valid_until as validUntil,
        status,
        created_at as createdAt
      FROM parking_cards
      WHERE deleted_at IS NULL
        AND (
          military_name LIKE ? OR
          rank LIKE ? OR
          war_name LIKE ? OR
          vehicle_plate LIKE ? OR
          vehicle_model LIKE ?
        )
      ORDER BY created_at DESC
    `

    const searchPattern = `%${searchQuery}%`
    const results = await query<any[]>(sql, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern])

    return results.map((row) => ({
      ...row,
      validUntil: row.validUntil.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }))
  }
}
