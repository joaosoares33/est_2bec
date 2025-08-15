"use client"

import { jsPDF } from "jspdf"
import type { ParkingCard } from "@/lib/types"
import { ORGANIZATION_NAME } from "@/lib/constants"

export class PDFGenerator {
  static generateParkingCard(card: ParkingCard): void {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [85.6, 53.98], // Tamanho padrão de cartão de crédito
    })

    // Configurações de cores
    const primaryBlue = [0, 51, 102] // Azul escuro
    const white = [255, 255, 255]

    // Background
    pdf.setFillColor(...white)
    pdf.rect(0, 0, 85.6, 53.98, "F")

    // Header com fundo azul
    pdf.setFillColor(...primaryBlue)
    pdf.rect(0, 0, 85.6, 15, "F")

    Promise.all([
      this.addPNGLogo(pdf, 2, 2, 11, 11), // Logo 2º BEC esquerda
      this.addBrasaoNacional(pdf, 72, 2, 11, 11), // Brasão nacional direita
    ])
      .then(() => {
        this.finalizePDF(pdf, card)
      })
      .catch(() => {
        // Fallback para logos vetoriais se PNG falhar
        this.drawVectorLogo(pdf, 2, 2, 11, 11)
        this.drawBrasaoVetorial(pdf, 72, 2, 11, 11)
        this.finalizePDF(pdf, card)
      })
  }

  private static async addBrasaoNacional(
    pdf: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Canvas context not available"))
            return
          }

          canvas.width = width * 10
          canvas.height = height * 10

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL("image/png")

          pdf.addImage(dataUrl, "PNG", x, y, width, height)
          resolve()
        } catch (error) {
          console.error("Erro ao processar brasão nacional:", error)
          reject(error)
        }
      }

      img.onerror = () => {
        console.error("Erro ao carregar brasão nacional")
        reject(new Error("Failed to load brasao nacional"))
      }

      img.src = "/images/brasao-nacional.png"
    })
  }

  private static drawBrasaoVetorial(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
    const green = [0, 156, 59]
    const yellow = [255, 223, 0]
    const blue = [0, 39, 118]
    const white = [255, 255, 255]
    const silver = [192, 192, 192]

    // Raios prateados (simplificado)
    pdf.setFillColor(...silver)
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180
      const x1 = x + width / 2 + (Math.cos(angle) * width) / 3
      const y1 = y + height / 2 + (Math.sin(angle) * height) / 3
      const x2 = x + width / 2 + (Math.cos(angle) * width) / 2.2
      const y2 = y + height / 2 + (Math.sin(angle) * height) / 2.2
      pdf.line(x1, y1, x2, y2)
    }

    // Escudo verde
    pdf.setFillColor(...green)
    pdf.ellipse(x + width / 2, y + height / 2, width / 3, height / 2.5, "F")

    // Anel amarelo
    pdf.setFillColor(...yellow)
    pdf.ellipse(x + width / 2, y + height / 2, width / 3.5, height / 3, "F")

    // Centro azul
    pdf.setFillColor(...blue)
    pdf.ellipse(x + width / 2, y + height / 2, width / 4.5, height / 4, "F")

    // Estrelas brancas (simplificadas como pontos)
    pdf.setFillColor(...white)
    const stars = [
      { x: x + width / 2, y: y + height / 2 - 1 },
      { x: x + width / 2 - 1.5, y: y + height / 2 + 0.5 },
      { x: x + width / 2 + 1.5, y: y + height / 2 + 0.5 },
      { x: x + width / 2 - 0.8, y: y + height / 2 + 1.8 },
      { x: x + width / 2 + 0.8, y: y + height / 2 + 1.8 },
    ]

    stars.forEach((star) => {
      pdf.circle(star.x, star.y, 0.3, "F")
    })
  }

  private static async addPNGLogo(pdf: jsPDF, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Canvas context not available"))
            return
          }

          canvas.width = width * 10
          canvas.height = height * 10

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL("image/png")

          pdf.addImage(dataUrl, "PNG", x, y, width, height)
          resolve()
        } catch (error) {
          console.error("Erro ao processar logo PNG:", error)
          reject(error)
        }
      }

      img.onerror = () => {
        console.error("Erro ao carregar logo PNG")
        reject(new Error("Failed to load PNG logo"))
      }

      img.src = "/images/2bec-logo-final.png"
    })
  }

  private static drawVectorLogo(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
    const logoBlue = [0, 174, 239]
    const logoRed = [237, 28, 36]
    const logoGold = [255, 193, 7]
    const white = [255, 255, 255]

    pdf.setFillColor(...logoGold)
    pdf.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, "F")

    pdf.setFillColor(...logoBlue)
    pdf.ellipse(x + width / 2, y + height / 2, width / 2 - 0.3, height / 2 - 0.3, "F")

    pdf.setFillColor(...logoRed)
    pdf.rect(x + 0.5, y + 0.5, width - 1, height * 0.25, "F")

    pdf.setTextColor(...white)
    pdf.setFontSize(4)
    pdf.setFont("helvetica", "bold")
    pdf.text("2º BEC", x + width / 2, y + height * 0.15, { align: "center" })

    pdf.setFillColor(...white)
    const triangleY = y + height * 0.35
    const triangleHeight = height * 0.15
    const triangleWidth = width * 0.4

    pdf.triangle(
      x + width / 2,
      triangleY,
      x + width / 2 - triangleWidth / 2,
      triangleY + triangleHeight,
      x + width / 2 + triangleWidth / 2,
      triangleY + triangleHeight,
      "F",
    )

    pdf.setDrawColor(...logoBlue)
    pdf.setLineWidth(0.2)
    pdf.line(
      x + width / 2,
      triangleY + triangleHeight / 3,
      x + width / 2 - triangleWidth / 4,
      triangleY + triangleHeight,
    )
    pdf.line(
      x + width / 2,
      triangleY + triangleHeight / 3,
      x + width / 2 + triangleWidth / 4,
      triangleY + triangleHeight,
    )

    const towerY = y + height * 0.55
    const towerWidth = width * 0.35
    const towerHeight = height * 0.3

    pdf.setFillColor(...white)
    pdf.rect(x + width / 2 - towerWidth / 2, towerY, towerWidth, towerHeight, "F")

    const merlonWidth = towerWidth / 5
    for (let i = 0; i < 3; i++) {
      if (i % 2 === 0) {
        pdf.rect(
          x + width / 2 - towerWidth / 2 + i * merlonWidth + merlonWidth / 2,
          towerY - towerHeight * 0.15,
          merlonWidth,
          towerHeight * 0.15,
          "F",
        )
      }
    }

    pdf.setFillColor(...logoBlue)
    const doorWidth = towerWidth * 0.3
    const doorHeight = towerHeight * 0.4
    pdf.rect(x + width / 2 - doorWidth / 2, towerY + towerHeight - doorHeight, doorWidth, doorHeight, "F")
  }

  private static async finalizePDF(pdf: jsPDF, card: ParkingCard): Promise<void> {
    const primaryBlue = [0, 51, 102]
    const white = [255, 255, 255]
    const black = [0, 0, 0]

    pdf.setTextColor(...white)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("CARTÃO DE ESTACIONAMENTO", 42.8, 6, { align: "center" }) // Centralizado entre as logos

    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(ORGANIZATION_NAME, 42.8, 11, { align: "center" }) // Centralizado entre as logos

    pdf.setTextColor(...black)
    pdf.setFontSize(7)

    const leftColumn = 5
    const rightColumn = 45
    let leftY = 22
    let rightY = 22

    // Coluna esquerda
    pdf.setFont("helvetica", "bold")
    pdf.text("NOME DE GUERRA:", leftColumn, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.warName.toUpperCase(), leftColumn, leftY + 3)

    leftY += 8
    pdf.setFont("helvetica", "bold")
    pdf.text("POSTO/GRADUAÇÃO:", leftColumn, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.rank.toUpperCase(), leftColumn, leftY + 3)

    leftY += 8
    pdf.setFont("helvetica", "bold")
    pdf.text("PLACA:", leftColumn, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.vehiclePlate.toUpperCase(), leftColumn, leftY + 3)

    leftY += 8
    const statusText = card.status === "active" ? "ATIVO" : "INATIVO"
    const statusColor = card.status === "active" ? [0, 128, 0] : [128, 128, 128]

    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(...black)
    pdf.text("STATUS:", leftColumn, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...statusColor)
    pdf.text(statusText, leftColumn, leftY + 3)

    // Resetar cor para preto para os próximos campos
    pdf.setTextColor(...black)

    // Coluna direita
    if (card.vehicleModel) {
      pdf.setFont("helvetica", "bold")
      pdf.text("MODELO:", rightColumn, rightY)
      pdf.setFont("helvetica", "normal")
      pdf.text(card.vehicleModel.toUpperCase(), rightColumn, rightY + 3)
      rightY += 8
    }

    if (card.vehicleColor) {
      pdf.setFont("helvetica", "bold")
      pdf.text("COR:", rightColumn, rightY)
      pdf.setFont("helvetica", "normal")
      pdf.text(card.vehicleColor.toUpperCase(), rightColumn, rightY + 3)
      rightY += 8
    }

    pdf.setFont("helvetica", "bold")
    pdf.text("TIPO:", rightColumn, rightY)
    pdf.setFont("helvetica", "normal")
    const tipoText = card.issueType === "provisorio" ? "PROVISÓRIO" : "DEFINITIVO"
    pdf.text(tipoText, rightColumn, rightY + 3)

    rightY += 8
    pdf.setFont("helvetica", "bold")
    pdf.text("VÁLIDO ATÉ:", rightColumn, rightY)
    pdf.setFont("helvetica", "normal")
    const validDate = new Date(card.validUntil).toLocaleDateString("pt-BR")
    pdf.text(validDate, rightColumn, rightY + 3)

    // Borda do cartão
    pdf.setDrawColor(...primaryBlue)
    pdf.setLineWidth(0.5)
    pdf.rect(1, 1, 83.6, 51.98, "S")

    // Download do PDF
    const fileName = `cartao_estacionamento_${card.warName.replace(/\s+/g, "_")}_${card.vehiclePlate}.pdf`
    pdf.save(fileName)
  }

  static generateMultipleCards(cards: ParkingCard[]): void {
    if (cards.length === 0) return

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const cardsPerPage = 8
    const cardWidth = 85.6
    const cardHeight = 53.98
    const margin = 10
    const spacingX = (210 - 2 * margin - 2 * cardWidth) / 1
    const spacingY = (297 - 2 * margin - 4 * cardHeight) / 3

    this.processCardsSequentially(pdf, cards, 0, cardsPerPage, cardWidth, cardHeight, margin, spacingX, spacingY)
  }

  private static async processCardsSequentially(
    pdf: jsPDF,
    cards: ParkingCard[],
    startIndex: number,
    cardsPerPage: number,
    cardWidth: number,
    cardHeight: number,
    margin: number,
    spacingX: number,
    spacingY: number,
  ): Promise<void> {
    const endIndex = Math.min(startIndex + cardsPerPage, cards.length)

    for (let i = startIndex; i < endIndex; i++) {
      if (i > 0 && i % cardsPerPage === 0) {
        pdf.addPage()
      }

      const pageIndex = i % cardsPerPage
      const row = Math.floor(pageIndex / 2)
      const col = pageIndex % 2

      const x = margin + col * (cardWidth + spacingX)
      const y = margin + row * (cardHeight + spacingY)

      await this.renderCardOnPageAsync(pdf, cards[i], x, y, cardWidth, cardHeight)
    }

    if (endIndex < cards.length) {
      pdf.addPage()
      await this.processCardsSequentially(
        pdf,
        cards,
        endIndex,
        cardsPerPage,
        cardWidth,
        cardHeight,
        margin,
        spacingX,
        spacingY,
      )
    } else {
      const fileName = `cartoes_estacionamento_${cards.length}_cartoes.pdf`
      pdf.save(fileName)
    }
  }

  private static async renderCardOnPageAsync(
    pdf: jsPDF,
    card: ParkingCard,
    x: number,
    y: number,
    width: number,
    height: number,
  ): Promise<void> {
    const primaryBlue = [0, 51, 102]
    const white = [255, 255, 255]
    const black = [0, 0, 0]

    pdf.setFillColor(...white)
    pdf.rect(x, y, width, height, "F")

    pdf.setFillColor(...primaryBlue)
    pdf.rect(x, y, width, 12, "F")

    try {
      await Promise.all([
        this.addPNGLogo(pdf, x + 1, y + 1, 8, 8),
        this.addBrasaoNacional(pdf, x + width - 9, y + 1, 8, 8),
      ])
    } catch {
      this.drawVectorLogo(pdf, x + 1, y + 1, 8, 8)
      this.drawBrasaoVetorial(pdf, x + width - 9, y + 1, 8, 8)
    }

    pdf.setTextColor(...white)
    pdf.setFontSize(6)
    pdf.setFont("helvetica", "bold")
    pdf.text("CARTÃO DE ESTACIONAMENTO", x + width / 2, y + 4, { align: "center" })

    pdf.setFontSize(5)
    pdf.text(ORGANIZATION_NAME, x + width / 2, y + 7, { align: "center" })

    pdf.setTextColor(...black)
    pdf.setFontSize(5)

    const leftCol = x + 2
    const rightCol = x + width / 2 + 2
    let leftY = y + 16
    let rightY = y + 16

    pdf.setFont("helvetica", "bold")
    pdf.text("NOME DE GUERRA:", leftCol, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.warName.toUpperCase(), leftCol, leftY + 2)

    leftY += 6
    pdf.setFont("helvetica", "bold")
    pdf.text("POSTO:", leftCol, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.rank, leftCol, leftY + 2)

    leftY += 6
    pdf.setFont("helvetica", "bold")
    pdf.text("PLACA:", leftCol, leftY)
    pdf.setFont("helvetica", "normal")
    pdf.text(card.vehiclePlate, leftCol, leftY + 2)

    if (card.vehicleModel) {
      pdf.setFont("helvetica", "bold")
      pdf.text("MODELO:", rightCol, rightY)
      pdf.setFont("helvetica", "normal")
      pdf.text(card.vehicleModel.substring(0, 15), rightCol, rightY + 2)
      rightY += 6
    }

    pdf.setFont("helvetica", "bold")
    pdf.text("TIPO:", rightCol, rightY)
    pdf.setFont("helvetica", "normal")
    const tipoText = card.issueType === "provisorio" ? "PROV." : "DEF."
    pdf.text(tipoText, rightCol, rightY + 2)

    rightY += 6
    pdf.setFont("helvetica", "bold")
    pdf.text("VÁLIDO ATÉ:", rightCol, rightY)
    pdf.setFont("helvetica", "normal")
    const validDate = new Date(card.validUntil).toLocaleDateString("pt-BR")
    pdf.text(validDate, rightCol, rightY + 2)

    pdf.setDrawColor(...primaryBlue)
    pdf.setLineWidth(0.3)
    pdf.rect(x, y, width, height, "S")
  }
}
