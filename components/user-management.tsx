"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Eye, EyeOff } from "lucide-react"
import type { User, UserFormData } from "@/lib/types"
import { userStorage } from "@/lib/user-storage"
import { useAuth } from "@/contexts/auth-context"

export function UserManagement() {
  const { user: currentUser, isAdmin } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    role: "user",
    fullName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    const allUsers = userStorage.getAll()
    setUsers(allUsers)
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
      fullName: "",
    })
    setEditingUser(null)
    setIsFormOpen(false)
    setError("")
    setSuccess("")
    setShowPassword(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validações
    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setError("Todos os campos são obrigatórios")
      return
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Senha é obrigatória para novos usuários")
      return
    }

    // Verificar se username já existe (exceto para edição do próprio usuário)
    const existingUser = userStorage.findByUsername(formData.username)
    if (existingUser && (!editingUser || existingUser.id !== editingUser.id)) {
      setError("Nome de usuário já existe")
      return
    }

    try {
      if (editingUser) {
        // Atualizar usuário
        const updateData = { ...formData }
        if (!formData.password.trim()) {
          delete (updateData as any).password
        }

        const updatedUser = userStorage.update(editingUser.id, updateData)
        if (updatedUser) {
          setSuccess("Usuário atualizado com sucesso!")
          loadUsers()
          resetForm()
        } else {
          setError("Erro ao atualizar usuário")
        }
      } else {
        // Criar novo usuário
        userStorage.create(formData)
        setSuccess("Usuário criado com sucesso!")
        loadUsers()
        resetForm()
      }
    } catch (error) {
      setError("Erro ao salvar usuário")
      console.error("Erro:", error)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      fullName: user.fullName,
    })
    setIsFormOpen(true)
  }

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      setError("Você não pode excluir seu próprio usuário")
      return
    }

    if (confirm(`Tem certeza que deseja excluir o usuário "${user.fullName}"?`)) {
      const success = userStorage.delete(user.id)
      if (success) {
        setSuccess("Usuário excluído com sucesso!")
        loadUsers()
      } else {
        setError("Erro ao excluir usuário")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Acesso negado. Apenas administradores podem gerenciar usuários.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Gerenciamento de Usuários</h1>
          <p className="text-blue-700">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {(error || success) && (
        <Alert variant={error ? "destructive" : "default"}>
          <AlertDescription>{error || success}</AlertDescription>
        </Alert>
      )}

      {/* Formulário */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
            <CardDescription>
              {editingUser ? "Atualize as informações do usuário" : "Preencha os dados do novo usuário"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nome Completo *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nome completo do usuário"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Nome de Usuário *
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nome de usuário para login"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    E-mail *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@2bec.mil.br"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Perfil *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="user">Usuário Comum</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Senha {!editingUser && "*"}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={editingUser ? "Deixe em branco para manter a senha atual" : "Digite a senha"}
                      required={!editingUser}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingUser ? "Atualizar" : "Criar"} Usuário
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.fullName}</CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                </div>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role === "admin" ? "Admin" : "Usuário"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>E-mail:</strong> {user.email}
                </p>
                <p>
                  <strong>Status:</strong>
                  <Badge variant={user.status === "active" ? "default" : "destructive"} className="ml-2">
                    {user.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </p>
                <p>
                  <strong>Criado em:</strong> {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {user.id !== currentUser?.id && (
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
