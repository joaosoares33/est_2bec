export interface ParkingCard {
  id: string
  militaryName: string
  rank: string
  warName: string
  vehiclePlate: string
  vehicleModel: string
  vehicleColor: string
  vehicleType: string // adicionado campo tipo de veículo
  issueType: "provisorio" | "definitivo"
  validUntil: string
  createdAt: string
  status: "active" | "inactive"
}

export interface ParkingCardFormData {
  militaryName: string
  rank: string
  warName: string
  vehiclePlate: string
  vehicleModel: string
  vehicleColor: string
  vehicleType: string // adicionado campo tipo de veículo
  issueType: "provisorio" | "definitivo"
}

export interface User {
  id: string
  username: string
  email: string
  password: string // Em produção, usar hash
  role: "admin" | "user"
  fullName: string
  createdAt: string
  updatedAt: string
  status: "active" | "inactive"
}

export interface UserFormData {
  username: string
  email: string
  password: string
  role: "admin" | "user"
  fullName: string
}

export interface LoginData {
  username: string
  password: string
}

export interface AuthContextType {
  user: User | null
  login: (loginData: LoginData) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}
