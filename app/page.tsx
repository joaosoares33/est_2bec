"use client"

import { useState } from "react"
import { ParkingCardForm } from "@/components/parking-card-form"
import { ParkingCardList } from "@/components/parking-card-list"
import { UserManagement } from "@/components/user-management"
import { LoginForm } from "@/components/login-form"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, List, ArrowLeft, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { ParkingCard } from "@/lib/types"

type ViewMode = "home" | "list" | "form" | "edit" | "users"

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("home")
  const [editingCard, setEditingCard] = useState<ParkingCard | undefined>()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const handleEdit = (card: ParkingCard) => {
    setEditingCard(card)
    setViewMode("edit")
  }

  const handleFormSuccess = () => {
    setEditingCard(undefined)
    setViewMode("list")
  }

  const handleFormCancel = () => {
    setEditingCard(undefined)
    setViewMode("list")
  }

  const handleViewChange = (view: string) => {
    if (view === "users" && !isAdmin) {
      return // Não permite acesso se não for admin
    }
    setViewMode(view as ViewMode)
    setEditingCard(undefined)
  }

  const renderContent = () => {
    switch (viewMode) {
      case "home":
        return (
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-900">Bem-vindo ao Sistema</CardTitle>
                <p className="text-blue-700">Gerencie os cartões de estacionamento do 2º BEC</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={() => setViewMode("form")} className="bg-blue-600 hover:bg-blue-700" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Cadastrar Novo Cartão
                  </Button>

                  <Button
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50 bg-transparent"
                    size="lg"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="mr-2 h-5 w-5" />
                    Ver Cartões Cadastrados
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50 sm:col-span-2 bg-transparent"
                      size="lg"
                      onClick={() => setViewMode("users")}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Gerenciar Usuários
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "list":
        return <ParkingCardList onEdit={handleEdit} onAdd={() => setViewMode("form")} />

      case "form":
      case "edit":
        return (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setViewMode("list")}
                className="mb-4 border-blue-200 hover:bg-blue-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à Lista
              </Button>
            </div>

            <ParkingCardForm card={editingCard} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
          </div>
        )

      case "users":
        if (!isAdmin) {
          return (
            <div className="text-center py-8">
              <p className="text-red-600">Acesso negado. Apenas administradores podem acessar esta área.</p>
            </div>
          )
        }
        return <UserManagement />

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation currentView={viewMode} onViewChange={handleViewChange} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        {viewMode !== "home" && (
          <div className="flex items-center gap-2 mb-6 text-sm text-blue-600">
            <Button
              variant="link"
              onClick={() => setViewMode("home")}
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
            >
              Início
            </Button>
            <span>/</span>
            <span className="text-blue-800">
              {viewMode === "list" && "Lista de Cartões"}
              {viewMode === "form" && "Novo Cartão"}
              {viewMode === "edit" && "Editar Cartão"}
              {viewMode === "users" && "Gerenciar Usuários"}
            </span>
          </div>
        )}

        {renderContent()}
      </main>
    </div>
  )
}
