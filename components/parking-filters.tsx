"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, BarChart3 } from "lucide-react"
import { MILITARY_RANKS } from "@/lib/constants"
import type { ParkingCard } from "@/lib/types"

export interface FilterOptions {
  search: string
  status: "all" | "active" | "inactive"
  rank: string
  vehicleType: string // substituído vehicleColor por vehicleType
  sortBy: "name" | "date" | "rank" | "plate"
  sortOrder: "asc" | "desc"
}

interface ParkingFiltersProps {
  cards: ParkingCard[]
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
}

export function ParkingFilters({ cards, filters, onFiltersChange, onClearFilters }: ParkingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.rank !== "" ||
    filters.vehicleType !== "" || // atualizado para vehicleType
    filters.sortBy !== "name" ||
    filters.sortOrder !== "asc"

  // Estatísticas
  const stats = {
    total: cards.length,
    active: cards.filter((card) => card.status === "active").length,
    inactive: cards.filter((card) => card.status === "inactive").length,
    rankDistribution: cards.reduce(
      (acc, card) => {
        acc[card.rank] = (acc[card.rank] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  const topRanks = Object.entries(stats.rankDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Estatísticas do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
              <div className="text-sm text-muted-foreground">Inativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa Ativa</div>
            </div>
          </div>

          {topRanks.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">Postos/Graduações mais comuns:</div>
              <div className="flex flex-wrap gap-2">
                {topRanks.map(([rank, count]) => (
                  <Badge key={rank} variant="secondary" className="text-xs">
                    {rank}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Filtros e Busca</CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  Filtros ativos
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="bg-transparent"
              >
                {showAdvanced ? "Ocultar" : "Avançado"}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={onClearFilters} className="bg-transparent">
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, posto, nome de guerra, placa..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Apenas Ativos</SelectItem>
                  <SelectItem value="inactive">Apenas Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordenar por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="date">Data de Cadastro</SelectItem>
                  <SelectItem value="rank">Posto/Graduação</SelectItem>
                  <SelectItem value="plate">Placa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ordem</Label>
              <Select value={filters.sortOrder} onValueChange={(value) => updateFilter("sortOrder", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente</SelectItem>
                  <SelectItem value="desc">Decrescente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros avançados */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Posto/Graduação</Label>
                <Select value={filters.rank} onValueChange={(value) => updateFilter("rank", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os postos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os postos</SelectItem>
                    {MILITARY_RANKS.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Veículo</Label> {/* alterado de "Cor do Veículo" para "Tipo de Veículo" */}
                <Select value={filters.vehicleType} onValueChange={(value) => updateFilter("vehicleType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="Carro">Carro</SelectItem> {/* substituído cores por tipos de veículo */}
                    <SelectItem value="Moto">Moto</SelectItem>
                    <SelectItem value="Caminhonete">Caminhonete</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
