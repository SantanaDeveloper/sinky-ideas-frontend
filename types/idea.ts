export interface User {
  id: string
  username: string
  role: "admin" | "user"
}

export interface Idea {
  id: string
  title: string
  votes: number
  creator: User
  createdAt?: string
  updatedAt?: string
}

export interface CreateIdeaDto {
  title: string
}

export interface IdeaReportDto {
  id: string
  title: string
  creator: string
  votesCount: number
  voters: string[]
}

export interface UserDto {
  id: string
  username: string
  role: "admin" | "user"
}

export interface SignupDto {
  username: string
  password: string
}

// Atualizado para corresponder ao payload real da API
export interface SignupResponse {
  id: string
  username: string
  role: "admin" | "user"
}

// Atualizado para incluir votedPolls
export interface LoginResponse {
  access_token: string
  votedPolls: string[]
}

export interface UpdateRoleDto {
  role: "admin" | "user"
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
  details?: any
}

export interface SignupError extends ApiError {
  statusCode: 409 | 422 | 500
}

// JWT Payload interface
export interface JWTPayload {
  sub: string
  username: string
  role: "admin" | "user"
  iat: number
  exp: number
}
