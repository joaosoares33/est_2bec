"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ParkingAPI } from "@/lib/parking-api"
import { Car, Bike, Users, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Eye } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import type { ParkingCard } from "@/lib/types"

function ExpiringCardsModal({ isOpen, onClose, cards }: { isOpen: boolean; onClose: () => void; cards: any[] }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden card-enhanced animate-scale-in">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Cartões Próximos ao Vencimento
            </h2>
            <Button variant="outline" onClick={onClose} className="hover:bg-blue-50 bg-transparent">
              Fechar
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {cards.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum cartão próximo ao vencimento</p>
          ) : (
            <div className="grid gap-4">
              {cards.map((card) => {
                const validUntil = new Date(card.validUntil)
                const now = new Date()
                const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                const isExpired = daysUntilExpiry < 0

                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-lg border card-enhanced ${isExpired ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{card.warName}</h3>
                            <p className="text-sm text-gray-600">
                              {card.rank} - {card.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{card.licensePlate}</p>
                            <p className="text-xs text-gray-600">
                              {card.vehicleModel} - {card.vehicleColor}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Válido até: {validUntil.toLocaleDateString("pt-BR")}</p>
                        <Badge
                          variant="secondary"
                          className={isExpired ? "bg-red-200 text-red-900" : "bg-orange-200 text-orange-900"}
                        >
                          {isExpired
                            ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                            : `${daysUntilExpiry} dias restantes`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const [showExpiringCards, setShowExpiringCards] = useState(false)
  const [cards, setCards] = useState<ParkingCard[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCards = async () => {
      try {
        setIsLoading(true)
        const loadedCards = await ParkingAPI.getAll()
        setCards(loadedCards)
      } catch (error) {
        console.error("Erro ao carregar cartões:", error)
        setCards([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCards()
  }, [])

  const stats = useMemo(() => {
    const total = cards.length
    const active = cards.filter((card) => card.status === "active").length
    const inactive = cards.filter((card) => card.status === "inactive").length

    const cars = cards.filter((card) => card.vehicleType === "Carro").length
    const motorcycles = cards.filter((card) => card.vehicleType === "Moto").length

    const provisional = cards.filter((card) => card.issueType === "provisorio").length
    const definitive = cards.filter((card) => card.issueType === "definitivo").length

    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringSoonCards = cards.filter((card) => {
      const validUntil = new Date(card.validUntil)
      return validUntil <= thirtyDaysFromNow && validUntil >= now
    })

    const expiredCards = cards.filter((card) => {
      const validUntil = new Date(card.validUntil)
      return validUntil < now
    })

    const allExpiringCards = [...expiringSoonCards, ...expiredCards].sort((a, b) => {
      return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime()
    })

    return {
      total,
      active,
      inactive,
      cars,
      motorcycles,
      provisional,
      definitive,
      expiringSoon: expiringSoonCards.length,
      expired: expiredCards.length,
      allExpiringCards,
    }
  }, [cards])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 card-enhanced">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
          Dashboard - Sistema de Estacionamento
        </h1>
        <p className="text-blue-700 font-medium">2º Batalhão de Engenharia de Construção</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200 card-enhanced animate-slide-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Cartões</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-600 mt-1">Cartões cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 card-enhanced animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-700">Cartões Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-900">{stats.active}</div>
            <p className="text-xs text-green-600 mt-1">Em uso atualmente</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 card-enhanced animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-red-700">Cartões Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-900">{stats.inactive}</div>
            <p className="text-xs text-red-600 mt-1">Desativados</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 card-enhanced animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-orange-700">Próximos ao Vencimento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-900">{stats.expiringSoon}</div>
            <p className="text-xs text-orange-600 mt-1">Próximos 30 dias</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full btn-gradient-secondary text-xs bg-transparent hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white transition-all duration-300"
              onClick={() => setShowExpiringCards(true)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Visualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200 card-enhanced animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-lg text-blue-900">Tipos de Veículos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Carros</span>
              </div>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800 font-semibold">
                {stats.cars}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-2">
                <Bike className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Motos</span>
              </div>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800 font-semibold">
                {stats.motorcycles}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 card-enhanced animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-lg text-blue-900">Tipos de Emissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-blue-800 font-medium">Provisórios</span>
              </div>
              <Badge variant="secondary" className="bg-orange-200 text-orange-800 font-semibold">
                {stats.provisional}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-blue-800 font-medium">Definitivos</span>
              </div>
              <Badge variant="secondary" className="bg-green-200 text-green-800 font-semibold">
                {stats.definitive}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card
        className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 card-enhanced animate-slide-up"
        style={{ animationDelay: "0.6s" }}
      >
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900 flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Vencimento
            </div>
            <Button
              variant="outline"
              size="sm"
              className="btn-gradient-secondary bg-transparent hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-600 hover:text-white transition-all duration-300"
              onClick={() => setShowExpiringCards(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.expiringSoon > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg card-enhanced">
              <span className="text-orange-800 font-medium">Cartões vencendo em 30 dias</span>
              <Badge variant="secondary" className="bg-orange-200 text-orange-900 font-semibold">
                {stats.expiringSoon}
              </Badge>
            </div>
          )}
          {stats.expired > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg card-enhanced">
              <span className="text-red-800 font-medium">Cartões vencidos</span>
              <Badge variant="secondary" className="bg-red-200 text-red-900 font-semibold">
                {stats.expired}
              </Badge>
            </div>
          )}
          {stats.expiringSoon === 0 && stats.expired === 0 && (
            <div className="flex items-center justify-center p-6 bg-green-100 rounded-lg card-enhanced">
              <span className="text-green-800 font-medium">✅ Nenhum cartão próximo ao vencimento</span>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpiringCardsModal
        isOpen={showExpiringCards}
        onClose={() => setShowExpiringCards(false)}
        cards={stats.allExpiringCards}
      />
    </div>
  )
}
