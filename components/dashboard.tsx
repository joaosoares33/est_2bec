"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ParkingStorage } from "@/lib/parking-storage"
import { Car, Bike, Users, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react"
import { useMemo } from "react"

export function Dashboard() {
  const stats = useMemo(() => {
    const cards = ParkingStorage.getAll()

    // Estatísticas básicas
    const total = cards.length
    const active = cards.filter((card) => card.status === "active").length
    const inactive = cards.filter((card) => card.status === "inactive").length

    // Por tipo de veículo
    const cars = cards.filter((card) => card.vehicleType === "Carro").length
    const motorcycles = cards.filter((card) => card.vehicleType === "Moto").length

    // Por tipo de emissão
    const provisional = cards.filter((card) => card.issueType === "provisorio").length
    const definitive = cards.filter((card) => card.issueType === "definitivo").length

    // Cartões próximos ao vencimento (próximos 30 dias)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expiringSoon = cards.filter((card) => {
      const validUntil = new Date(card.validUntil)
      return validUntil <= thirtyDaysFromNow && validUntil >= now
    }).length

    // Cartões vencidos
    const expired = cards.filter((card) => {
      const validUntil = new Date(card.validUntil)
      return validUntil < now
    }).length

    return {
      total,
      active,
      inactive,
      cars,
      motorcycles,
      provisional,
      definitive,
      expiringSoon,
      expired,
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Dashboard - Sistema de Estacionamento</h1>
        <p className="text-blue-700">2º Batalhão de Engenharia de Construção</p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Cartões</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-600 mt-1">Cartões cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Cartões Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.active}</div>
            <p className="text-xs text-green-600 mt-1">Em uso atualmente</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Cartões Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.inactive}</div>
            <p className="text-xs text-red-600 mt-1">Desativados</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Próximos ao Vencimento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.expiringSoon}</div>
            <p className="text-xs text-orange-600 mt-1">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Tipos de Veículos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">Carros</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.cars}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bike className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">Motos</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.motorcycles}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Tipos de Emissão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-blue-800">Provisórios</span>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {stats.provisional}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-blue-800">Definitivos</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.definitive}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.expiringSoon > 0 && (
              <div className="flex items-center justify-between p-2 bg-orange-100 rounded">
                <span className="text-orange-800">Cartões vencendo em 30 dias</span>
                <Badge variant="secondary" className="bg-orange-200 text-orange-900">
                  {stats.expiringSoon}
                </Badge>
              </div>
            )}
            {stats.expired > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                <span className="text-red-800">Cartões vencidos</span>
                <Badge variant="secondary" className="bg-red-200 text-red-900">
                  {stats.expired}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
