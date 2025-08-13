"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ParkingStorage } from "@/lib/parking-storage"
import { MILITARY_RANKS, VEHICLE_COLORS } from "@/lib/constants"
import type { ParkingCard, ParkingCardFormData } from "@/lib/types"

interface ParkingCardFormProps {
  card?: ParkingCard
  onSuccess?: () => void
  onCancel?: () => void
}

export function ParkingCardForm({ card, onSuccess, onCancel }: ParkingCardFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ParkingCardFormData>({
    militaryName: card?.militaryName || "",
    rank: card?.rank || "",
    warName: card?.warName || "",
    vehiclePlate: card?.vehiclePlate || "",
    vehicleModel: card?.vehicleModel || "",
    vehicleColor: card?.vehicleColor || "",
    vehicleType: card?.vehicleType || "",
    issueType: card?.issueType || "definitivo",
  })

  const formatPlate = (value: string) => {
    // Remove todos os caracteres que não são letras ou números
    const cleanValue = value.replace(/[^A-Z0-9]/g, "")

    // Aplica a máscara XXX-XXXX
    if (cleanValue.length <= 3) {
      return cleanValue
    } else if (cleanValue.length <= 7) {
      return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3)}`
    } else {
      return `${cleanValue.slice(0, 3)}-${cleanValue.slice(3, 7)}`
    }
  }

  const handlePlateChange = (value: string) => {
    const upperValue = value.toUpperCase()
    const formattedValue = formatPlate(upperValue)
    handleInputChange("vehiclePlate", formattedValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("=== INÍCIO DO SUBMIT ===")
      console.log("Dados do formulário:", formData)
      console.log("Editando cartão:", card ? "SIM" : "NÃO")

      const validationErrors = []

      if (!formData.militaryName?.trim()) {
        validationErrors.push("Nome do militar é obrigatório")
      }

      if (!formData.rank?.trim()) {
        validationErrors.push("Posto/Graduação é obrigatório")
      }

      if (!formData.warName?.trim()) {
        validationErrors.push("Nome de guerra é obrigatório")
      }

      if (!formData.vehiclePlate?.trim()) {
        validationErrors.push("Placa do veículo é obrigatória")
      } else {
        const plateRegex = /^[A-Z]{3}-[0-9]{4}$/
        if (!plateRegex.test(formData.vehiclePlate)) {
          validationErrors.push("Formato de placa inválido (ex: ABC-1234)")
        }
      }

      if (!formData.vehicleColor?.trim()) {
        validationErrors.push("Cor do veículo é obrigatória")
      }

      if (!formData.vehicleModel?.trim()) {
        validationErrors.push("Modelo do veículo é obrigatório")
      }

      if (!formData.vehicleType?.trim()) {
        validationErrors.push("Tipo de veículo é obrigatório")
      }

      if (!formData.issueType?.trim()) {
        validationErrors.push("Tipo de emissão é obrigatório")
      }

      if (validationErrors.length > 0) {
        console.log("Erros de validação:", validationErrors)
        toast({
          title: "Erro de Validação",
          description: validationErrors.join(", "),
          variant: "destructive",
        })
        return
      }

      console.log("Validação passou, salvando...")

      let result
      if (card) {
        console.log("Atualizando cartão ID:", card.id)
        result = ParkingStorage.update(card.id, formData)
        if (!result) {
          throw new Error("Cartão não encontrado para atualização")
        }
        console.log("Cartão atualizado:", result)
        toast({
          title: "Sucesso",
          description: "Cartão atualizado com sucesso",
        })
      } else {
        console.log("Criando novo cartão...")
        result = ParkingStorage.create(formData)
        console.log("Cartão criado:", result)
        toast({
          title: "Sucesso",
          description: "Cartão cadastrado com sucesso",
        })
      }

      const allCards = ParkingStorage.getAll()
      console.log("Total de cartões após salvamento:", allCards.length)
      console.log("Último cartão salvo:", allCards[allCards.length - 1])

      if (!card) {
        console.log("Resetando formulário...")
        setFormData({
          militaryName: "",
          rank: "",
          warName: "",
          vehiclePlate: "",
          vehicleModel: "",
          vehicleColor: "",
          vehicleType: "",
          issueType: "definitivo",
        })
      }

      console.log("Chamando onSuccess callback...")
      onSuccess?.()
      console.log("=== FIM DO SUBMIT ===")
    } catch (error) {
      console.error("=== ERRO NO SUBMIT ===", error)
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao salvar o cartão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ParkingCardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-center text-xl font-semibold">
          {card ? "Editar Cartão de Estacionamento" : "Novo Cartão de Estacionamento"}
        </CardTitle>
        <p className="text-center text-sm opacity-90">2º Batalhão de Engenharia de Construção</p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Militar */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Dados do Militar</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="militaryName">Nome Completo *</Label>
                <Input
                  id="militaryName"
                  value={formData.militaryName}
                  onChange={(e) => handleInputChange("militaryName", e.target.value)}
                  placeholder="Digite o nome completo"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rank">Posto/Graduação *</Label>
                <Select value={formData.rank} onValueChange={(value) => handleInputChange("rank", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o posto/graduação" />
                  </SelectTrigger>
                  <SelectContent>
                    {MILITARY_RANKS.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warName">Nome de Guerra *</Label>
              <Input
                id="warName"
                value={formData.warName}
                onChange={(e) => handleInputChange("warName", e.target.value)}
                placeholder="Digite o nome de guerra"
                className="w-full"
              />
            </div>
          </div>

          {/* Dados do Veículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Dados do Veículo</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate">Placa do Veículo *</Label>
                <Input
                  id="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={(e) => handlePlateChange(e.target.value)}
                  placeholder="ABC-1234"
                  className="w-full"
                  maxLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleColor">Cor do Veículo *</Label>
                <Select
                  value={formData.vehicleColor}
                  onValueChange={(value) => handleInputChange("vehicleColor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_COLORS.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carro">Carro</SelectItem>
                    <SelectItem value="Moto">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modelo do Veículo *</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                  placeholder="Ex: Honda Civic, Yamaha Fazer"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Tipo de Emissão */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Tipo de Emissão</h3>

            <div className="space-y-2">
              <Label htmlFor="issueType">Tipo de Cartão *</Label>
              <Select
                value={formData.issueType}
                onValueChange={(value) => handleInputChange("issueType", value as "provisorio" | "definitivo")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de emissão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="definitivo">Definitivo (válido por 1 ano)</SelectItem>
                  <SelectItem value="provisorio">Provisório (válido por 30 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary/90">
              {isSubmitting ? "Salvando..." : card ? "Atualizar Cartão" : "Cadastrar Cartão"}
            </Button>

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
