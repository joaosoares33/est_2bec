"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, LoginData, AuthContextType } from "@/lib/types"
import { userStorage } from "@/lib/user-storage"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Inicializar usuários padrão
    userStorage.initializeDefaultUsers()

    // Verificar se há usuário logado
    const savedUser = localStorage.getItem("current_user_2bec")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        const currentUser = userStorage.findById(userData.id)
        if (currentUser && currentUser.status === "active") {
          setUser(currentUser)
        } else {
          localStorage.removeItem("current_user_2bec")
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("current_user_2bec")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      const authenticatedUser = userStorage.authenticate(loginData.username, loginData.password)

      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem("current_user_2bec", JSON.stringify(authenticatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("current_user_2bec")
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
