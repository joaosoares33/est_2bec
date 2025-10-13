import type { User, LoginData } from "./types"

export const AuthAPI = {
  // Autenticar usuário
  login: async (loginData: LoginData): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Erro no login:", error)
        return null
      }

      const data = await response.json()
      return data.user
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      return null
    }
  },

  // Verificar se usuário está autenticado (verifica sessão)
  checkAuth: async (): Promise<User | null> => {
    try {
      // Por enquanto, verifica localStorage
      // Em produção, isso seria uma chamada à API para verificar token/sessão
      if (typeof window === "undefined") return null

      const savedUser = localStorage.getItem("current_user_2bec")
      if (savedUser) {
        return JSON.parse(savedUser)
      }
      return null
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      return null
    }
  },
}
