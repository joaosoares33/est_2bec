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

    this.addPNGLogo(pdf, 2, 2, 11, 11)
      .then(() => {
        this.finalizePDF(pdf, card)
      })
      .catch(() => {
        // Fallback para logo vetorial se PNG falhar
        this.drawVectorLogo(pdf, 2, 2, 11, 11)
        this.finalizePDF(pdf, card)
      })
  }

  private static async addPNGLogo(pdf: jsPDF, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Converte para canvas para garantir compatibilidade
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Canvas context not available"))
            return
          }

          canvas.width = width * 10 // Alta resolução
          canvas.height = height * 10

          // Desenha a imagem no canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Converte para base64
          const dataUrl = canvas.toDataURL("image/png")

          // Adiciona ao PDF
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

      // Carrega a nova logo PNG
      img.src = "/images/2bec-logo-final.png"
    })
  }

  private static drawVectorLogo(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
    // Cores da logo
    const logoBlue = [0, 174, 239] // Azul ciano da logo
    const logoRed = [237, 28, 36] // Vermelho da faixa superior
    const logoGold = [255, 193, 7] // Dourado da borda
    const white = [255, 255, 255]

    // Borda dourada do escudo
    pdf.setFillColor(...logoGold)
    pdf.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, "F")

    // Fundo azul do escudo
    pdf.setFillColor(...logoBlue)
    pdf.ellipse(x + width / 2, y + height / 2, width / 2 - 0.3, height / 2 - 0.3, "F")

    // Faixa vermelha superior
    pdf.setFillColor(...logoRed)
    pdf.rect(x + 0.5, y + 0.5, width - 1, height * 0.25, "F")

    // Texto "2º BEC" na faixa vermelha
    pdf.setTextColor(...white)
    pdf.setFontSize(4)
    pdf.setFont("helvetica", "bold")
    pdf.text("2º BEC", x + width / 2, y + height * 0.15, { align: "center" })

    // Triângulo da engenharia (parte superior)
    pdf.setFillColor(...white)
    const triangleY = y + height * 0.35
    const triangleHeight = height * 0.15
    const triangleWidth = width * 0.4

    // Triângulo principal
    pdf.triangle(
      x + width / 2,
      triangleY,
      x + width / 2 - triangleWidth / 2,
      triangleY + triangleHeight,
      x + width / 2 + triangleWidth / 2,
      triangleY + triangleHeight,
      "F",
    )

    // Linhas internas do triângulo
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

    // Torre/castelo (parte inferior)
    const towerY = y + height * 0.55
    const towerWidth = width * 0.35
    const towerHeight = height * 0.3

    // Base da torre
    pdf.setFillColor(...white)
    pdf.rect(x + width / 2 - towerWidth / 2, towerY, towerWidth, towerHeight, "F")

    // Merlões (ameias) da torre
    const merlonWidth = towerWidth / 5
    for (let i = 0; i < 3; i++) {
      if (i % 2 === 0) {
        // Merlões alternados
        pdf.rect(
          x + width / 2 - towerWidth / 2 + i * merlonWidth + merlonWidth / 2,
          towerY - towerHeight * 0.15,
          merlonWidth,
          towerHeight * 0.15,
          "F",
        )
      }
    }

    // Porta da torre
    pdf.setFillColor(...logoBlue)
    const doorWidth = towerWidth * 0.3
    const doorHeight = towerHeight * 0.4
    pdf.rect(x + width / 2 - doorWidth / 2, towerY + towerHeight - doorHeight, doorWidth, doorHeight, "F")
  }

  private static finalizePDF(pdf: jsPDF, card: ParkingCard): void {
    const primaryBlue = [0, 51, 102]
    const white = [255, 255, 255]
    const black = [0, 0, 0]

    pdf.setTextColor(...white)
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "bold")
    pdf.text("CARTÃO DE ESTACIONAMENTO", 50, 6, { align: "center" })

    pdf.setFontSize(8)
    pdf.setFont("helvetica", "normal")
    pdf.text(ORGANIZATION_NAME, 50, 11, { align: "center" })

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

    // Status na parte inferior
    const statusY = 48
    const statusText = card.status === "active" ? "ATIVO" : "INATIVO"
    const statusColor = card.status === "active" ? [0, 128, 0] : [128, 128, 128]

    pdf.setTextColor(...statusColor)
    pdf.setFont("helvetica", "bold")
    pdf.text("STATUS:", leftColumn, statusY)
    pdf.text(statusText, leftColumn + 15, statusY)

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

    const cardsPerPage = 8 // 4x2 cards per page
    const cardWidth = 85.6
    const cardHeight = 53.98
    const margin = 10
    const spacingX = (210 - 2 * margin - 2 * cardWidth) / 1 // A4 width spacing
    const spacingY = (297 - 2 * margin - 4 * cardHeight) / 3 // A4 height spacing

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
      // Finaliza e salva o PDF
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

    // Background
    pdf.setFillColor(...white)
    pdf.rect(x, y, width, height, "F")

    // Header
    pdf.setFillColor(...primaryBlue)
    pdf.rect(x, y, width, 12, "F")

    try {
      await this.addPNGLogo(pdf, x + 1, y + 1, 8, 8)
    } catch {
      this.drawVectorLogo(pdf, x + 1, y + 1, 8, 8)
    }

    pdf.setTextColor(...white)
    pdf.setFontSize(6)
    pdf.setFont("helvetica", "bold")
    pdf.text("CARTÃO DE ESTACIONAMENTO", x + width / 2 + 5, y + 4, { align: "center" })

    pdf.setFontSize(5)
    pdf.text(ORGANIZATION_NAME, x + width / 2 + 5, y + 7, { align: "center" })

    pdf.setTextColor(...black)
    pdf.setFontSize(5)

    const leftCol = x + 2
    const rightCol = x + width / 2 + 2
    let leftY = y + 16
    let rightY = y + 16

    // Coluna esquerda
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

    // Coluna direita
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

    // Border
    pdf.setDrawColor(...primaryBlue)
    pdf.setLineWidth(0.3)
    pdf.rect(x, y, width, height, "S")
  }
}
