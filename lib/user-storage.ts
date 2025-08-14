import type { User, UserFormData } from "./types"

const STORAGE_KEY = "parking_users_2bec"

export const userStorage = {
  // Obter todos os usuários
  getAll: (): User[] => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    return users[index]
  },

  // Excluir usuário
  delete: (id: string): boolean => {
    const users = userStorage.getAll()
    const filteredUsers = users.filter((user) => user.id !== id)

    if (filteredUsers.length === users.length) return false

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredUsers))
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
    const user = userStorage.findByUsername(username)
    if (user && user.password === password && user.status === "active") {
      return user
    }
    return null
  },

  // Inicializar com usuário admin padrão
  initializeDefaultUsers: () => {
    const users = userStorage.getAll()
    if (users.length === 0) {
      const adminUser: UserFormData = {
        username: "admin",
        email: "admin@2bec.mil.br",
        password: "123456",
        role: "admin",
        fullName: "Administrador do Sistema",
      }

      const commonUser: UserFormData = {
        username: "usuario",
        email: "usuario@2bec.mil.br",
        password: "123456",
        role: "user",
        fullName: "Usuário Comum",
      }

      userStorage.create(adminUser)
      userStorage.create(commonUser)
    }
  },
}
