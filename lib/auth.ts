"use client"

import { jwtDecode } from "jwt-decode"
import type { JWTPayload } from "@/types/idea"

export class AuthManager {
  private static readonly TOKEN_KEY = "access_token"
  private static readonly VOTED_POLLS_KEY = "voted_polls"

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.VOTED_POLLS_KEY)
    }
  }

  // ✅ MELHORADO: Métodos para gerenciar voted polls com persistência automática
  static setVotedPolls(votedPolls: string[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.VOTED_POLLS_KEY, JSON.stringify(votedPolls))
      console.log("✅ Voted polls salvos no localStorage:", votedPolls)
    }
  }

  static getVotedPolls(): string[] {
    if (typeof window !== "undefined") {
      const votedPolls = localStorage.getItem(this.VOTED_POLLS_KEY)
      const polls = votedPolls ? JSON.parse(votedPolls) : []
      console.log("📖 Voted polls recuperados do localStorage:", polls)
      return polls
    }
    return []
  }

  // ✅ MELHORADO: Adiciona voto e persiste automaticamente
  static addVotedPoll(pollId: string): void {
    const votedPolls = this.getVotedPolls()
    if (!votedPolls.includes(pollId)) {
      votedPolls.push(pollId)
      this.setVotedPolls(votedPolls)
      console.log("✅ Novo voto adicionado ao localStorage:", pollId)
    } else {
      console.log("ℹ️ Voto já existe no localStorage:", pollId)
    }
  }

  // ✅ NOVO: Remove voto específico (útil para casos de erro)
  static removeVotedPoll(pollId: string): void {
    const votedPolls = this.getVotedPolls()
    const updatedPolls = votedPolls.filter((id) => id !== pollId)
    if (updatedPolls.length !== votedPolls.length) {
      this.setVotedPolls(updatedPolls)
      console.log("🗑️ Voto removido do localStorage:", pollId)
    }
  }

  static hasVotedForPoll(pollId: string): boolean {
    const hasVoted = this.getVotedPolls().includes(pollId)
    console.log(`🔍 Verificando voto para ${pollId}:`, hasVoted)
    return hasVoted
  }

  // ✅ NOVO: Sincroniza votos com o servidor (útil para reconciliação)
  static syncVotedPolls(serverVotedPolls: string[]): void {
    const localVotedPolls = this.getVotedPolls()

    // Combina votos locais e do servidor, removendo duplicatas
    const combinedPolls = [...new Set([...localVotedPolls, ...serverVotedPolls])]

    if (combinedPolls.length !== localVotedPolls.length) {
      this.setVotedPolls(combinedPolls)
      console.log("🔄 Voted polls sincronizados:", {
        local: localVotedPolls,
        server: serverVotedPolls,
        combined: combinedPolls,
      })
    }
  }

  // ✅ NOVO: Limpa apenas os votos (mantém token)
  static clearVotedPolls(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.VOTED_POLLS_KEY)
      console.log("🧹 Voted polls limpos do localStorage")
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      return decoded.exp * 1000 > Date.now()
    } catch {
      return false
    }
  }

  static getUser(): JWTPayload | null {
    const token = this.getToken()
    if (!token) return null

    try {
      return jwtDecode<JWTPayload>(token)
    } catch {
      return null
    }
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
