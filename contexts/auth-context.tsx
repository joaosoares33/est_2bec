"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, LoginData, AuthContextType } from "@/lib/types"
import { AuthAPI } from "@/lib/auth-api"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClient(true)

      const checkAuth = async () => {
        try {
          const authenticatedUser = await AuthAPI.checkAuth()
          if (authenticatedUser) {
            setUser(authenticatedUser)
          }
        } catch (error) {
          console.error("Erro ao verificar autenticação:", error)
        } finally {
          setIsLoading(false)
        }
      }

      checkAuth()
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const login = async (loginData: LoginData): Promise<boolean> => {
    if (!isClient) return false

    try {
      const authenticatedUser = await AuthAPI.login(loginData)
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
    if (isClient) {
      localStorage.removeItem("current_user_2bec")
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
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
