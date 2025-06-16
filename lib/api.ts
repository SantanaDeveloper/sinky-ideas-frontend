import type {
  Idea,
  CreateIdeaDto,
  SignupDto,
  LoginResponse,
  IdeaReportDto,
  UserDto,
  SignupResponse,
} from "@/types/idea"
import { apiRequest } from "./axios-config"

class ApiClient {
  // Auth endpoints
  async signup(data: SignupDto): Promise<SignupResponse> {
    return apiRequest({
      url: "/auth/signup",
      method: "POST",
      data,
    })
  }

  async login(data: SignupDto): Promise<LoginResponse> {
    return apiRequest({
      url: "/auth/login",
      method: "POST",
      data,
    })
  }

  // Ideas endpoints
  async getIdeas(): Promise<Idea[]> {
    return apiRequest({
      url: "/ideas",
      method: "GET",
    })
  }

  async createIdea(data: CreateIdeaDto): Promise<Idea> {
    return apiRequest({
      url: "/ideas",
      method: "POST",
      data,
    })
  }

  async voteForIdea(ideaId: string): Promise<Idea> {
    return apiRequest({
      url: `/ideas/${ideaId}/vote`,
      method: "POST",
    })
  }

  async getIdeaReport(ideaId: string): Promise<IdeaReportDto> {
    return apiRequest({
      url: `/ideas/${ideaId}/report`,
      method: "GET",
    })
  }

  async updateIdeaTitle(ideaId: string, newTitle: string): Promise<Idea> {
    return apiRequest({
      url: `/ideas/${ideaId}`,
      method: "PATCH",
      data: { newTitle },
    })
  }

  async deleteIdea(ideaId: string): Promise<void> {
    return apiRequest({
      url: `/ideas/${ideaId}`,
      method: "DELETE",
    })
  }

  // Users endpoints
  async getUsers(): Promise<UserDto[]> {
    return apiRequest({
      url: "/users",
      method: "GET",
    })
  }

  async updateUserRole(userId: string, role: "admin" | "user"): Promise<{ message: string }> {
    return apiRequest({
      url: `/users/${userId}/role`,
      method: "PATCH",
      data: { role },
    })
  }

  async getMyVotedIdeas(): Promise<Idea[]> {
    return apiRequest({
      url: "/users/me/votes",
      method: "GET",
    })
  }
}

export const apiClient = new ApiClient()
