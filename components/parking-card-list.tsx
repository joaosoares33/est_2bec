"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ParkingFilters, type FilterOptions } from "@/components/parking-filters"
import { ParkingStorage } from "@/lib/parking-storage"
import type { ParkingCard } from "@/lib/types"
import {
  Car,
  User,
  Calendar,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Trash,
  Power,
  FileText,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PDFGenerator } from "@/components/pdf-generator"

interface ParkingCardListProps {
  onEdit?: (card: ParkingCard) => void
  onAdd?: () => void
}

interface ConfirmationState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  variant?: "default" | "destructive"
}

const defaultFilters: FilterOptions = {
  search: "",
  status: "all",
  rank: "",
  vehicleColor: "",
  sortBy: "name",
  sortOrder: "asc",
}

const ITEMS_PER_PAGE = 12
const LOAD_MORE_INCREMENT = 8

export function ParkingCardList({ onEdit, onAdd }: ParkingCardListProps) {
  const [cards, setCards] = useState<ParkingCard[]>([])
  const [filteredCards, setFilteredCards] = useState<ParkingCard[]>([])
  const [displayedCards, setDisplayedCards] = useState<ParkingCard[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE)
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })
  const { toast } = useToast()

  // ... existing useEffect hooks ...

  useEffect(() => {
    console.log("=== CARREGANDO CARTÕES NA LISTAGEM ===")
    loadCards()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, cards])

  useEffect(() => {
    const cardsToShow = filteredCards.slice(0, itemsToShow)
    setDisplayedCards(cardsToShow)
  }, [filteredCards, itemsToShow])

  useEffect(() => {
    setShowBulkActions(selectedCards.size > 0)
  }, [selectedCards])

  // ... existing functions ...

  const loadCards = () => {
    console.log("Carregando cartões do storage...")
    const allCards = ParkingStorage.getAll()
    console.log("Cartões carregados:", allCards.length)
    console.log("Dados dos cartões:", allCards)
    setCards(allCards)
    setSelectedCards(new Set())
    setItemsToShow(ITEMS_PER_PAGE)
    setCurrentPage(1)
  }

  const applyFilters = () => {
    let filtered = [...cards]

    // Aplicar busca
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(
        (card) =>
          card.militaryName.toLowerCase().includes(searchTerm) ||
          card.rank.toLowerCase().includes(searchTerm) ||
          card.warName.toLowerCase().includes(searchTerm) ||
          card.vehiclePlate.toLowerCase().includes(searchTerm) ||
          card.vehicleModel.toLowerCase().includes(searchTerm),
      )
    }

    // Aplicar filtro de status
    if (filters.status !== "all") {
      filtered = filtered.filter((card) => card.status === filters.status)
    }

    // Aplicar filtro de posto
    if (filters.rank) {
      filtered = filtered.filter((card) => card.rank === filters.rank)
    }

    // Aplicar filtro de cor
    if (filters.vehicleColor) {
      filtered = filtered.filter((card) => card.vehicleColor === filters.vehicleColor)
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.militaryName.localeCompare(b.militaryName)
          break
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "rank":
          comparison = a.rank.localeCompare(b.rank)
          break
        case "plate":
          comparison = a.vehiclePlate.localeCompare(b.vehiclePlate)
          break
      }

      return filters.sortOrder === "desc" ? -comparison : comparison
    })

    console.log("Cartões filtrados:", filtered.length)
    setFilteredCards(filtered)
    setItemsToShow(ITEMS_PER_PAGE)
    setCurrentPage(1)
  }

  // ... existing handler functions ...

  const handleDelete = (id: string, militaryName: string) => {
    setConfirmation({
      open: true,
      title: "⚠️ Confirmar Exclusão",
      description: `Tem certeza que deseja excluir o cartão de ${militaryName}? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      onConfirm: () => {
        console.log("Excluindo cartão ID:", id)
        const success = ParkingStorage.delete(id)
        if (success) {
          toast({
            title: "✅ Cartão Excluído",
            description: `Cartão de ${militaryName} foi excluído com sucesso`,
          })
          loadCards()
        } else {
          toast({
            title: "❌ Erro na Exclusão",
            description: "Não foi possível excluir o cartão",
            variant: "destructive",
          })
        }
        setConfirmation((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleBulkDelete = () => {
    const selectedCount = selectedCards.size
    setConfirmation({
      open: true,
      title: "Confirmar Exclusão em Lote",
      description: `Tem certeza que deseja excluir ${selectedCount} cartão${selectedCount > 1 ? "s" : ""}? Esta ação não pode ser desfeita.`,
      variant: "destructive",
      onConfirm: () => {
        let successCount = 0
        selectedCards.forEach((id) => {
          if (ParkingStorage.delete(id)) {
            successCount++
          }
        })

        toast({
          title: "Sucesso",
          description: `${successCount} cartão${successCount > 1 ? "s" : ""} excluído${successCount > 1 ? "s" : ""} com sucesso`,
        })

        loadCards()
        setConfirmation((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleBulkStatusToggle = (newStatus: "active" | "inactive") => {
    const selectedCount = selectedCards.size
    const statusText = newStatus === "active" ? "ativar" : "desativar"

    setConfirmation({
      open: true,
      title: `⚠️ Confirmar ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} em Lote`,
      description: `Tem certeza que deseja ${statusText} ${selectedCount} cartão${selectedCount > 1 ? "s" : ""}? Esta operação pode ser revertida a qualquer momento.`,
      onConfirm: () => {
        let successCount = 0
        selectedCards.forEach((id) => {
          const card = cards.find((c) => c.id === id)
          if (card && card.status !== newStatus) {
            if (ParkingStorage.toggleStatus(id)) {
              successCount++
            }
          }
        })

        toast({
          title: "🎯 Operação realizada com sucesso!",
          description: `${successCount} cartão${successCount > 1 ? "s" : ""} ${newStatus === "active" ? "ativado" : "desativado"}${successCount > 1 ? "s" : ""} com sucesso`,
        })

        loadCards()
        setConfirmation((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleToggleStatus = (id: string) => {
    const card = cards.find((c) => c.id === id)
    if (!card) return

    const actionText = card.status === "active" ? "desativar" : "ativar"
    const statusText = card.status === "active" ? "desativado" : "ativado"

    setConfirmation({
      open: true,
      title: `⚠️ Confirmar ${card.status === "active" ? "Desativação" : "Ativação"}`,
      description: `Tem certeza que deseja ${actionText} o cartão de ${card.warName}? Esta operação pode ser revertida a qualquer momento.`,
      onConfirm: () => {
        console.log("Alterando status do cartão ID:", id)
        const updatedCard = ParkingStorage.toggleStatus(id)
        if (updatedCard) {
          toast({
            title: `🎯 Operação realizada com sucesso!`,
            description: `Cartão de ${card.warName} foi ${statusText} com sucesso`,
          })
          loadCards()
        }
        setConfirmation((prev) => ({ ...prev, open: false }))
      },
    })
  }

  const handleSelectCard = (cardId: string, checked: boolean) => {
    const newSelected = new Set(selectedCards)
    if (checked) {
      newSelected.add(cardId)
    } else {
      newSelected.delete(cardId)
    }
    setSelectedCards(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCards(new Set(filteredCards.map((card) => card.id)))
    } else {
      setSelectedCards(new Set())
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const handleGeneratePDF = (card: ParkingCard) => {
    try {
      PDFGenerator.generateParkingCard(card)
      toast({
        title: "Sucesso",
        description: "Cartão PDF gerado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do cartão",
        variant: "destructive",
      })
    }
  }

  const handleBulkPDFGeneration = () => {
    const selectedCardsList = cards.filter((card) => selectedCards.has(card.id))
    if (selectedCardsList.length === 0) return

    try {
      PDFGenerator.generateMultipleCards(selectedCardsList)
      toast({
        title: "Sucesso",
        description: `PDF com ${selectedCardsList.length} cartão${selectedCardsList.length > 1 ? "s" : ""} gerado com sucesso`,
      })
    } catch (error) {
      console.error("Erro ao gerar PDF em lote:", error)
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF dos cartões",
        variant: "destructive",
      })
    }
  }

  const handleLoadMore = () => {
    const newItemsToShow = itemsToShow + LOAD_MORE_INCREMENT
    setItemsToShow(newItemsToShow)
    setCurrentPage(Math.ceil(newItemsToShow / ITEMS_PER_PAGE))

    toast({
      title: "📄 Carregando mais cartões",
      description: `Exibindo ${Math.min(newItemsToShow, filteredCards.length)} de ${filteredCards.length} cartões`,
    })
  }

  const handleShowAll = () => {
    setItemsToShow(filteredCards.length)
    setCurrentPage(Math.ceil(filteredCards.length / ITEMS_PER_PAGE))

    toast({
      title: "📋 Todos os cartões carregados",
      description: `Exibindo todos os ${filteredCards.length} cartões encontrados`,
    })
  }

  const allSelected = displayedCards.length > 0 && selectedCards.size === displayedCards.length
  const someSelected = selectedCards.size > 0 && selectedCards.size < displayedCards.length

  const hasMoreCards = displayedCards.length < filteredCards.length
  const remainingCards = filteredCards.length - displayedCards.length

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Filtros e Estatísticas */}
      <ParkingFilters
        cards={cards}
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(defaultFilters)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 sm:items-center sm:justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 card-enhanced">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Resultados da Busca</h2>
          <p className="text-sm sm:text-base text-blue-700">
            Exibindo {displayedCards.length} de {filteredCards.length} cartão{filteredCards.length !== 1 ? "s" : ""}{" "}
            encontrado
            {filteredCards.length !== 1 ? "s" : ""} ({cards.length} total)
            {selectedCards.size > 0 && (
              <span className="ml-2 text-blue-800 font-semibold">
                ({selectedCards.size} selecionado{selectedCards.size > 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>

        {onAdd && (
          <Button onClick={onAdd} className="btn-gradient-primary w-full sm:w-auto">
            Novo Cartão
          </Button>
        )}
      </div>

      {showBulkActions && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 card-enhanced animate-slide-up">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="text-sm font-semibold text-primary">
                {selectedCards.size} item{selectedCards.size > 1 ? "s" : ""} selecionado
                {selectedCards.size > 1 ? "s" : ""}:
              </span>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkPDFGeneration}
                  className="btn-gradient-primary flex-1 sm:flex-none bg-transparent"
                >
                  <Download className="h-4 w-4 mr-1" />
                  <span className="hidden xs:inline">Gerar </span>PDFs
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusToggle("active")}
                  className="btn-gradient-secondary flex-1 sm:flex-none"
                >
                  <Power className="h-4 w-4 mr-1" />
                  Ativar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusToggle("inactive")}
                  className="btn-gradient-secondary flex-1 sm:flex-none"
                >
                  <Power className="h-4 w-4 mr-1" />
                  Desativar
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200 flex-1 sm:flex-none"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCards(new Set())}
                className="sm:ml-auto hover:bg-primary/10"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controle de seleção */}
      {displayedCards.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            ref={(el) => {
              if (el) {
                el.indeterminate = someSelected
              }
            }}
          />
          <span className="text-sm text-muted-foreground">
            {allSelected ? "Desmarcar todos" : someSelected ? "Selecionar todos" : "Selecionar todos"}
            {displayedCards.length < filteredCards.length && (
              <span className="text-xs text-muted-foreground ml-1">(dos {displayedCards.length} exibidos)</span>
            )}
          </span>
        </div>
      )}

      {/* Lista de cartões */}
      {filteredCards.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center card-enhanced">
          <div className="flex flex-col items-center gap-4">
            <Car className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <div>
              <h3 className="text-base sm:text-lg font-medium text-foreground">
                {cards.length === 0 ? "Nenhum cartão cadastrado" : "Nenhum cartão encontrado"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {cards.length === 0
                  ? "Comece cadastrando o primeiro cartão de estacionamento"
                  : "Tente ajustar os filtros ou termos de busca"}
              </p>
            </div>
            {cards.length === 0 && onAdd && (
              <Button onClick={onAdd} className="btn-gradient-primary w-full sm:w-auto">
                Cadastrar Primeiro Cartão
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {displayedCards.map((card, index) => (
              <Card
                key={card.id}
                className={`card-enhanced transition-all duration-300 animate-slide-up ${
                  selectedCards.has(card.id) ? "ring-2 ring-primary bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/50 to-blue-100/50 rounded-t-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Checkbox
                        checked={selectedCards.has(card.id)}
                        onCheckedChange={(checked) => handleSelectCard(card.id, checked as boolean)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary flex-shrink-0"
                      />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <CardTitle className="text-sm sm:text-lg truncate text-blue-900">{card.militaryName}</CardTitle>
                      </div>
                    </div>
                    <Badge
                      variant={card.status === "active" ? "default" : "secondary"}
                      className={`text-xs flex-shrink-0 ${
                        card.status === "active"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {card.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 ml-6 sm:ml-8 truncate font-medium">{card.rank}</p>
                </CardHeader>

                <CardContent className="space-y-3 sm:space-y-4">
                  {/* Informações do militar */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 bg-blue-50/50 rounded-lg">
                      <span className="font-semibold text-blue-700 flex-shrink-0">Nome de Guerra:</span>
                      <span className="text-blue-900 truncate font-medium">{card.warName}</span>
                    </div>
                  </div>

                  {/* Informações do veículo */}
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Car className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-xs sm:text-sm text-blue-800">Veículo</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                      <div className="min-w-0 p-2 bg-gray-50 rounded">
                        <span className="font-medium text-muted-foreground block">Placa:</span>
                        <p className="text-foreground font-mono text-xs sm:text-sm truncate font-bold">
                          {card.vehiclePlate}
                        </p>
                      </div>
                      {card.vehicleColor && (
                        <div className="min-w-0 p-2 bg-gray-50 rounded">
                          <span className="font-medium text-muted-foreground block">Cor:</span>
                          <p className="text-foreground text-xs sm:text-sm truncate">{card.vehicleColor}</p>
                        </div>
                      )}
                    </div>

                    {card.vehicleModel && (
                      <div className="text-xs sm:text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium text-muted-foreground">Modelo:</span>
                        <p className="text-foreground truncate">{card.vehicleModel}</p>
                      </div>
                    )}

                    {card.vehicleType && (
                      <div className="text-xs sm:text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium text-muted-foreground">Tipo:</span>
                        <p className="text-foreground">{card.vehicleType}</p>
                      </div>
                    )}
                  </div>

                  {/* Data de cadastro */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Cadastrado em {formatDate(card.createdAt)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGeneratePDF(card)}
                      className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border-green-200 text-xs sm:text-sm p-1 sm:p-2"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>

                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(card)}
                        className="bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white border-orange-200 text-xs sm:text-sm p-1 sm:p-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(card.id)}
                      className={`text-xs sm:text-sm p-1 sm:p-2 col-span-1 ${
                        card.status === "active"
                          ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-600 hover:text-white border-yellow-200"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border-blue-200"
                      }`}
                    >
                      {card.status === "active" ? (
                        <>
                          <ToggleRight className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Desativar</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Ativar</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(card.id, card.militaryName)}
                      className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200 text-xs sm:text-sm p-1 sm:p-2"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMoreCards && (
            <div className="flex flex-col items-center gap-4 pt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50/50 to-blue-100/50 card-enhanced">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium">
                  Mostrando {displayedCards.length} de {filteredCards.length} cartões
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {remainingCards} cartão{remainingCards > 1 ? "s" : ""} restante{remainingCards > 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="btn-gradient-primary w-full sm:w-auto bg-transparent"
                >
                  Carregar Mais ({Math.min(LOAD_MORE_INCREMENT, remainingCards)})
                </Button>

                {remainingCards > LOAD_MORE_INCREMENT && (
                  <Button
                    onClick={handleShowAll}
                    variant="ghost"
                    className="text-primary hover:bg-primary/10 w-full sm:w-auto"
                  >
                    Mostrar Todos ({remainingCards})
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog de confirmação */}
      <ConfirmationDialog
        open={confirmation.open}
        onOpenChange={(open) => setConfirmation((prev) => ({ ...prev, open }))}
        title={confirmation.title}
        description={confirmation.description}
        onConfirm={confirmation.onConfirm}
        variant={confirmation.variant}
        confirmText={confirmation.variant === "destructive" ? "Excluir" : "Confirmar"}
      />
    </div>
  )
}
