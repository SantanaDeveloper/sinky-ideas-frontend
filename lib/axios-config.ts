import axios, { type AxiosInstance, type AxiosResponse, type AxiosError, type AxiosRequestConfig } from "axios"
import { AuthManager } from "./auth"
import { toast } from "sonner"

// Configure your backend URL here
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          AuthManager.removeToken()
          toast.error("Sessão expirada. Faça login novamente.")
          // Optionally redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/"
          }
          break
        case 403:
          toast.error("Acesso negado. Você não tem permissão para esta ação.")
          break
        case 404:
          toast.error("Recurso não encontrado.")
          break
        case 409:
          // Conflict - usually for duplicate actions like voting twice
          const message = (data as any)?.message || "Você já votou nesta ideia."
          toast.error(message)
          break
        case 422:
          // Validation error
          const validationMessage = (data as any)?.message || "Dados inválidos."
          toast.error(validationMessage)
          break
        case 429:
          toast.error("Muitas tentativas. Tente novamente em alguns minutos.")
          break
        case 500:
          // Verificar se é erro de usuário já existente
          const serverMessage = (data as any)?.message || ""
          if (
            serverMessage.toLowerCase().includes("already exists") ||
            serverMessage.toLowerCase().includes("já existe") ||
            serverMessage.toLowerCase().includes("conflict") ||
            serverMessage.toLowerCase().includes("duplicate")
          ) {
            toast.error("Este usuário já existe. Tente fazer login ou use outro nome de usuário.")
          } else {
            toast.error("Erro interno do servidor. Tente novamente mais tarde.")
          }
          break
        default:
          const errorMessage = (data as any)?.message || `Erro HTTP ${status}`
          toast.error(errorMessage)
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.request)
      toast.error("Erro de conexão. Verifique sua internet e se o backend está rodando.")
    } else {
      // Something else happened
      console.error("Error:", error.message)
      toast.error("Erro inesperado. Tente novamente.")
    }

    return Promise.reject(error)
  },
)

// Generic request wrapper with better error handling
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance(config)
    return response.data
  } catch (error) {
    // Error is already handled by interceptor
    throw error
  }
}

// Export configured axios instance
export { axiosInstance }
export default axiosInstance
