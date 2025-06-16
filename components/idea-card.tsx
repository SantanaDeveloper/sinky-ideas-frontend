"use client"

import { useState, useEffect } from "react"
import { Heart, MoreVertical, Trash2, Building2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Idea } from "@/types/idea"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { EditIdeaDialog } from "./ideas/edit-idea-dialog"
import { AuthDialog } from "./auth/auth-dialog"
import { IdeaDetailModal } from "./ideas/idea-detail-modal"

interface IdeaCardProps {
  idea: Idea
  onIdeaUpdate?: () => void
}

export function IdeaCard({ idea, onIdeaUpdate }: IdeaCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [optimisticVotes, setOptimisticVotes] = useState(idea.votes)
  const [hasVoted, setHasVoted] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // ✅ ADICIONAR: Estado reativo para autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  // ✅ MELHORADO: Verificar autenticação periodicamente
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()

      setIsAuthenticated(authStatus)
      setUser(userData)

      if (authStatus) {
        setHasVoted(AuthManager.hasVotedForPoll(idea.id))
      } else {
        setHasVoted(false)
      }
    }

    // Verificação inicial
    checkAuth()

    // Verificar a cada segundo para mudanças de autenticação
    const interval = setInterval(checkAuth, 1000)

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [idea.id])

  // ✅ ADICIONAR: Atualizar quando idea.votes mudar
  useEffect(() => {
    setOptimisticVotes(idea.votes)
  }, [idea.votes])

  const isOwner = user?.sub === idea.creator.id
  const isAdmin = user?.role === "admin"

  // Verificar se o título é muito longo para mostrar o botão "Ver completo"
  const isTitleLong = idea.title.length > 120

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
        // Sincronizar estado local se servidor diz que já votou
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

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta ideia?")) return

    setIsDeleting(true)

    try {
      await apiClient.deleteIdea(idea.id)
      toast.success("Ideia excluída com sucesso!")
      onIdeaUpdate?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao excluir ideia"

      if (errorMessage.includes("403") || errorMessage.includes("Sem permissão")) {
        toast.error("Você não tem permissão para excluir esta ideia")
      } else if (errorMessage.includes("404") || errorMessage.includes("não encontrada")) {
        toast.error("Ideia não encontrada")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    // ✅ MELHORADO: Forçar atualização imediata do estado
    setTimeout(() => {
      setIsAuthenticated(AuthManager.isAuthenticated())
      setUser(AuthManager.getUser())
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
      <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
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
                <span className="text-slate-500 dark:text-slate-400 text-sm flex-shrink-0">· há 2h</span>
              </div>
            </div>
            {(isOwner || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
                    disabled={isDeleting}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {(isOwner || isAdmin) && <EditIdeaDialog idea={idea} onIdeaUpdated={onIdeaUpdate} />}
                 
                  {(isOwner || isAdmin) && (
                    <>
                      
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Excluindo..." : isAdmin && !isOwner ? "Excluir Ideia" : "Excluir Ideia"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-1 flex flex-col">
          {/* Título com altura fixa e truncamento */}
          <div className="flex-1 mb-4">
            <div
              className={`text-slate-800 dark:text-slate-100 text-base leading-relaxed h-20 overflow-hidden ${
                isTitleLong ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" : ""
              }`}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.5rem",
              }}
              onClick={isTitleLong ? () => setShowDetailModal(true) : undefined}
              title={isTitleLong ? "Clique para ver o título completo" : undefined}
            >
              {idea.title}
            </div>
            {isTitleLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(true)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-normal text-xs mt-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver completo
              </Button>
            )}
          </div>

          {/* Footer fixo na parte inferior */}
          <div className="flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>há 2h</span>
            </div>

            <Button
              onClick={handleVote}
              variant="ghost"
              size="sm"
              disabled={isVoting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                hasVoted
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-red-50 dark:bg-red-900/10"
                  : "text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              {isVoting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Heart className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
              )}
              <span className="font-medium">{optimisticVotes}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <IdeaDetailModal
        idea={idea}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onIdeaUpdate={onIdeaUpdate}
      />

      <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
