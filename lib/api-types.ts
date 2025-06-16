// Extended types for better API error handling
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Request/Response types for specific endpoints
export interface VoteRequest {
  ideaId: string
}

export interface VoteResponse {
  success: boolean
  newVoteCount: number
  message?: string
}

export interface CreateIdeaRequest {
  title: string
  description?: string
  category?: string
}

export interface UpdateIdeaRequest {
  newTitle?: string
  description?: string
  category?: string
}

export interface UpdateUserRoleRequest {
  role: "admin" | "user"
}

export interface LoginRequest {
  username: string
  password: string
}

export interface SignupRequest {
  username: string
  password: string
  email?: string
}
