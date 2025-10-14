// Adapter que decide entre MySQL e localStorage
export class StorageAdapter {
  private static useMySql = false
  private static initialized = false

  static async initialize() {
    if (this.initialized) return

    try {
      // Tenta fazer uma requisição de teste para verificar se a API está disponível
      const response = await fetch("/api/health", { method: "GET" })
      this.useMySql = response.ok
      console.log("[v0] Storage mode:", this.useMySql ? "MySQL" : "localStorage")
    } catch (error) {
      console.log("[v0] MySQL não disponível, usando localStorage como fallback")
      this.useMySql = false
    }

    this.initialized = true
  }

  static isUsingMySql(): boolean {
    return this.useMySql
  }

  // Funções de localStorage como fallback
  static getFromLocalStorage(key: string): any {
    if (typeof window === "undefined") return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("[v0] Erro ao ler localStorage:", error)
      return null
    }
  }

  static saveToLocalStorage(key: string, data: any): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("[v0] Erro ao salvar no localStorage:", error)
    }
  }
}
