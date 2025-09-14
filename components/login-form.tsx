"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import type { LoginData } from "@/lib/types"

export function LoginForm() {
  const { login } = useAuth()
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(formData)
      if (!success) {
        setError("Usuário ou senha inválidos")
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url(/images/fundo-geometrico-militar.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <Card className="w-full max-w-md relative z-10 bg-white/95 border-2 border-white/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/2bec-logo-limpa.jpeg" alt="Logo do 2º BEC" className="h-20 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Sistema de Estacionamento</CardTitle>
          <CardDescription className="text-blue-700 font-medium">
            2º Batalhão de Engenharia de Construção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                Usuário
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
                className="bg-white/90"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
                className="bg-white/90"
              />
            </div>

            <Button type="submit" className="w-full btn-gradient-primary" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
