"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Car, Users, LogOut, Menu, X, Home, Plus, List } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface NavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, logout, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: "home", label: "Início", icon: Home, adminOnly: false },
    { id: "form", label: "Novo Cartão", icon: Plus, adminOnly: false },
    { id: "list", label: "Lista de Cartões", icon: List, adminOnly: false },
    ...(isAdmin ? [{ id: "users", label: "Usuários", icon: Users, adminOnly: true }] : []),
  ]

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const handleMenuClick = (viewId: string) => {
    onViewChange(viewId)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 text-blue-600" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-blue-900">Sistema de Estacionamento</h1>
                <p className="text-sm text-blue-700">2º Batalhão de Engenharia de Construção</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-blue-900">2º BEC</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMenuClick(item.id)}
                  className={currentView === item.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* User Info e Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {isAdmin ? "Admin" : "Usuário"}
                  </Badge>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              {/* Desktop Logout */}
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-blue-100 bg-white">
            <div className="container mx-auto px-4 py-4">
              {/* User Info Mobile */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">{user?.fullName}</p>
                <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs mt-1">
                  {isAdmin ? "Administrador" : "Usuário"}
                </Badge>
              </div>

              {/* Menu Items Mobile */}
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${currentView === item.id ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                ))}

                <Button variant="outline" className="w-full justify-start mt-4 bg-transparent" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-3" />
                  Sair
                </Button>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
