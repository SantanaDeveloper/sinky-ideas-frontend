"use client"

import { useState, useEffect } from "react"
import { Heart, User, TrendingUp, Flame, Clock, ArrowRight, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Idea } from "@/types/idea"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { AuthDialog } from "./auth/auth-dialog"
import { IdeaDetailModal } from "./ideas/idea-detail-modal"

interface TrendingIdeasProps {
  onIdeaUpdate?: () => void
}

export function TrendingIdeas({ onIdeaUpdate }: TrendingIdeasProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({})
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // ✅ ADICIONAR: Estado reativo para autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ✅ MELHORADO: Verificar autenticação periodicamente
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(AuthManager.isAuthenticated())
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
  }, [])

  useEffect(() => {
    fetchTrendingIdeas()
  }, [])

  // Auto-rotate trending ideas
  useEffect(() => {
    if (ideas.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(ideas.length, 3))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [ideas.length])

  const fetchTrendingIdeas = async () => {
    try {
      const fetchedIdeas = await apiClient.getIdeas()
      // Get top 3 most voted ideas
      const trending = fetchedIdeas.sort((a, b) => b.votes - a.votes).slice(0, 3)
      setIdeas(trending)
    } catch (error) {
      console.error("Error fetching trending ideas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (idea: Idea) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    if (AuthManager.hasVotedForPoll(idea.id)) {
      toast.error("Você já votou nesta ideia")
      return
    }

    setVotingStates((prev) => ({ ...prev, [idea.id]: true }))

    try {
      await apiClient.voteForIdea(idea.id)

      // Salvar voto no localStorage
      AuthManager.addVotedPoll(idea.id)

      toast.success("Voto registrado com sucesso!")
      fetchTrendingIdeas()
      onIdeaUpdate?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao votar"
      if (errorMessage.includes("409") || errorMessage.includes("já votou")) {
        toast.error("Você já votou nesta ideia")
        // Sincronizar estado local se o servidor diz que já votou
        AuthManager.addVotedPoll(idea.id)
      } else {
        toast.error("Erro ao registrar voto. Tente novamente.")
      }
    } finally {
      setVotingStates((prev) => ({ ...prev, [idea.id]: false }))
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    // ✅ MELHORADO: Forçar atualização imediata do estado
    setTimeout(() => {
      setIsAuthenticated(AuthManager.isAuthenticated())
    }, 100)
  }

  const handleTitleClick = (idea: Idea) => {
    setSelectedIdea(idea)
    setShowDetailModal(true)
  }

  const handleModalClose = () => {
    setShowDetailModal(false)
    setSelectedIdea(null)
  }

  const handleModalUpdate = () => {
    fetchTrendingIdeas()
    onIdeaUpdate?.()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ideias em Destaque</h3>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (ideas.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ideias em Destaque</h3>
            <Badge variant="secondary" className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            Atualizado agora
          </div>
        </div>

        {/* Featured Idea Carousel - Responsivo */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {ideas.map((idea, index) => {
                const hasVoted = isAuthenticated && AuthManager.hasVotedForPoll(idea.id)
                const isTitleLong = idea.title.length > 100 // Reduzido para mobile

                return (
                  <div key={idea.id} className="w-full flex-shrink-0">
                    <Card
                      className={`border-blue-200/50 dark:border-blue-800/50 shadow-lg h-auto min-h-[280px] sm:h-80 flex flex-col ${
                        hasVoted
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50"
                          : "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50"
                      }`}
                    >
                      <CardContent className="p-4 sm:p-8 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4 flex-shrink-0">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge
                                className={
                                  hasVoted
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                    : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                }
                              >
                                {hasVoted ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Já Votada
                                  </>
                                ) : (
                                  `#${index + 1} Trending`
                                )}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {idea.creator.username}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Título com altura responsiva */}
                        <div className="flex-1 mb-4 sm:mb-6">
                          <div
                            className={`text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight h-16 sm:h-20 overflow-hidden mb-3 ${
                              isTitleLong
                                ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                : ""
                            }`}
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              lineHeight: "1.4rem",
                            }}
                            onClick={isTitleLong ? () => handleTitleClick(idea) : undefined}
                            title={isTitleLong ? "Clique para ver o título completo" : undefined}
                          >
                            {idea.title}
                          </div>

                          {isTitleLong && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTitleClick(idea)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-normal text-sm mb-2"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver título completo
                            </Button>
                          )}

                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {hasVoted
                              ? "Você já apoiou esta ideia! Obrigado por participar da inovação."
                              : "Esta ideia está ganhando destaque na comunidade com alto engajamento e votos."}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-2 rounded-full ${
                                  hasVoted ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                                }`}
                              >
                                <Heart
                                  className={`h-4 w-4 ${hasVoted ? "text-green-500 fill-current" : "text-red-500"}`}
                                />
                              </div>
                              <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{idea.votes}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">votos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className={hasVoted ? "h-4 w-4 text-green-500" : "h-4 w-4 text-green-500"} />
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                +{Math.floor(Math.random() * 20) + 5} hoje
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleVote(idea)}
                            disabled={votingStates[idea.id] || hasVoted}
                            className={`w-full sm:w-auto ${
                              hasVoted
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            }`}
                          >
                            {votingStates[idea.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Votando...
                              </>
                            ) : hasVoted ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Já Votou
                              </>
                            ) : !isAuthenticated ? (
                              "Login para Votar"
                            ) : (
                              <>
                                Votar Agora
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Carousel Indicators */}
          {ideas.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {ideas.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-blue-600 w-6"
                      : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats - Responsivo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {ideas.reduce((sum, idea) => sum + idea.votes, 0)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total de Votos</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{ideas.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Em Destaque</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {Math.max(...ideas.map((idea) => idea.votes))}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Mais Votada</div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes */}
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          isOpen={showDetailModal}
          onClose={handleModalClose}
          onIdeaUpdate={handleModalUpdate}
        />
      )}

      <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
