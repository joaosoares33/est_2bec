import type { User, UserFormData } from "./types"

const STORAGE_KEY = "parking_users_2bec"

export const userStorage = {
  isClient: () => typeof window !== "undefined" && typeof localStorage !== "undefined",

  // Obter todos os usuários
  getAll: (): User[] => {
    if (!userStorage.isClient()) return []

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      return []
    }
  },

  // Criar usuário
  create: (userData: UserFormData): User => {
    const users = userStorage.getAll()
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    }

    users.push(newUser)
    if (userStorage.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      } catch (error) {
        console.error("Erro ao salvar usuário:", error)
      }
    }
    return newUser
  },

  // Atualizar usuário
  update: (id: string, userData: Partial<UserFormData>): User | null => {
    const users = userStorage.getAll()
    const index = users.findIndex((user) => user.id === id)

    if (index === -1) return null

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    }

    if (userStorage.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error)
      }
    }
    return users[index]
  },

  // Excluir usuário
  delete: (id: string): boolean => {
    const users = userStorage.getAll()
    const filteredUsers = users.filter((user) => user.id !== id)

    if (filteredUsers.length === users.length) return false

    if (userStorage.isClient()) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers))
      } catch (error) {
        console.error("Erro ao excluir usuário:", error)
      }
    }
    return true
  },

  // Buscar usuário por username
  findByUsername: (username: string): User | null => {
    const users = userStorage.getAll()
    return users.find((user) => user.username === username) || null
  },

  // Buscar usuário por ID
  findById: (id: string): User | null => {
    const users = userStorage.getAll()
    return users.find((user) => user.id === id) || null
  },

  // Autenticar usuário
  authenticate: (username: string, password: string): User | null => {
    console.log("Tentativa de login:", { username, password })
    const users = userStorage.getAll()
    console.log(
      "Usuários disponíveis:",
      users.map((u) => ({ username: u.username, password: u.password, status: u.status })),
    )

    const user = users.find((user) => user.username === username)
    console.log("Usuário encontrado:", user)

    if (user && user.password === password && user.status === "active") {
      console.log("Login bem-sucedido")
      return user
    }
    console.log("Login falhou")
    return null
  },

  // Inicializar com usuário admin padrão
  initializeDefaultUsers: () => {
    if (!userStorage.isClient()) return

    try {
      const existingUsers = userStorage.getAll()

      // Sempre recriar usuários padrão para garantir consistência
      const filteredUsers = existingUsers.filter((user) => user.username !== "admin" && user.username !== "user")

      const adminUser: User = {
        id: "admin-default",
        username: "admin",
        email: "admin@2bec.mil.br",
        password: "123",
        role: "admin",
        fullName: "Administrador do Sistema",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      }

      const commonUser: User = {
        id: "user-default",
        username: "user",
        email: "user@2bec.mil.br",
        password: "123",
        role: "user",
        fullName: "Usuário Comum",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      }

      const allUsers = [...filteredUsers, adminUser, commonUser]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers))
    } catch (error) {
      console.error("Erro ao inicializar usuários:", error)
    }
  },
}
