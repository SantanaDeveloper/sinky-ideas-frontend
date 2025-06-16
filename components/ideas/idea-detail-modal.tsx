"use client"

import { useState } from "react"
import { Heart, User, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import type { Idea } from "@/types/idea"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { AuthDialog } from "../auth/auth-dialog"

interface IdeaDetailModalProps {
  idea: Idea
  isOpen: boolean
  onClose: () => void
  onIdeaUpdate?: () => void
}

export function IdeaDetailModal({ idea, isOpen, onClose, onIdeaUpdate }: IdeaDetailModalProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [optimisticVotes, setOptimisticVotes] = useState(idea.votes)
  const [hasVoted, setHasVoted] = useState(AuthManager.hasVotedForPoll(idea.id))
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const isAuthenticated = AuthManager.isAuthenticated()

  const handleVote = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    if (hasVoted) {
      toast.error("Você já votou nesta ideia")
      return
    }

    if (isVoting) return

    setIsVoting(true)

    // Optimistic update
    const previousVotes = optimisticVotes
    setOptimisticVotes((prev) => prev + 1)
    setHasVoted(true)

    try {
      const updatedIdea = await apiClient.voteForIdea(idea.id)
      setOptimisticVotes(updatedIdea.votes)

      // Salvar voto no localStorage
      AuthManager.addVotedPoll(idea.id)

      toast.success("Voto registrado com sucesso!")
      onIdeaUpdate?.()
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticVotes(previousVotes)
      setHasVoted(false)
      const errorMessage = error instanceof Error ? error.message : "Erro ao votar"

      if (errorMessage.includes("409") || errorMessage.includes("Já votou")) {
        toast.error("Você já votou nesta ideia")
        AuthManager.addVotedPoll(idea.id)
        setHasVoted(true)
      } else if (errorMessage.includes("404")) {
        toast.error("Ideia não encontrada")
      } else {
        toast.error("Erro ao registrar voto. Tente novamente.")
      }
    } finally {
      setIsVoting(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    setTimeout(() => {
      setHasVoted(AuthManager.hasVotedForPoll(idea.id))
    }, 100)
  }

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
          {/* Header fixo */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Detalhes da Ideia
            </DialogTitle>
          </DialogHeader>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Header com autor */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {getInitials(idea.creator.username)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {idea.creator.username}
                    </span>
                    {idea.creator.role === "admin" && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        <Building2 className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <User className="h-3 w-3" />
                    <span>Criado há 2h</span>
                  </div>
                </div>
              </div>

              {/* Título completo com altura controlada */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Título da Ideia:</h3>
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed text-base max-h-40 overflow-y-auto"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {idea.title}
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className={`h-5 w-5 ${hasVoted ? "text-red-500 fill-current" : "text-red-500"}`} />
                    <span className="text-2xl font-bold text-red-600">{optimisticVotes}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total de Votos</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <User className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Criador</p>
                </div>
              </div>

              {/* Status do voto */}
              {hasVoted && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="font-medium">Você já votou nesta ideia!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Obrigado por participar e apoiar esta inovação.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo */}
          <div className="flex-shrink-0 p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button
                onClick={handleVote}
                disabled={isVoting || hasVoted}
                className={`px-6 ${
                  hasVoted
                    ? "bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                }`}
              >
                {isVoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Votando...
                  </>
                ) : hasVoted ? (
                  <>
                    <Heart className="h-4 w-4 mr-2 fill-current" />
                    Já Votou
                  </>
                ) : !isAuthenticated ? (
                  "Login para Votar"
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Votar nesta Ideia
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
