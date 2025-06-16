"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Heart, User, Eye } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import type { Idea } from "@/types/idea"
import { AuthManager } from "@/lib/auth"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { IdeaDetailModal } from "@/components/ideas/idea-detail-modal"

export default function ExplorePage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>({})
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const router = useRouter()

  const isAuthenticated = AuthManager.isAuthenticated()

  useEffect(() => {
    fetchIdeas()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.creator.username.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredIdeas(filtered)
    } else {
      setFilteredIdeas(ideas)
    }
  }, [searchTerm, ideas])

  const fetchIdeas = async () => {
    try {
      const fetchedIdeas = await apiClient.getIdeas()
      setIdeas(fetchedIdeas)
      setFilteredIdeas(fetchedIdeas)
    } catch (error) {
      toast.error("Erro ao carregar ideias")
      console.error("Error fetching ideas:", error)
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

      // ✅ ADICIONAR: Salvar voto no localStorage
      AuthManager.addVotedPoll(idea.id)

      toast.success("Voto registrado com sucesso!")
      fetchIdeas() // Refresh the list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao votar"
      if (errorMessage.includes("409") || errorMessage.includes("já votou")) {
        toast.error("Você já votou nesta ideia")
        // ✅ ADICIONAR: Sincronizar estado local se servidor diz que já votou
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
    window.location.reload()
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
    fetchIdeas()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Explorar Ideias</h1>
                <p className="text-slate-600 dark:text-slate-400">Descubra todas as ideias da plataforma</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar ideias ou usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {searchTerm
                  ? `${filteredIdeas.length} resultados para "${searchTerm}"`
                  : `${ideas.length} ideias encontradas`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredIdeas.map((idea) => {
              const isTitleLong = idea.title.length > 120

              return (
                <Card
                  key={idea.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow h-64 flex flex-col"
                >
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Título com altura fixa e truncamento */}
                        <div
                          className={`text-base sm:text-lg leading-tight mb-3 text-slate-800 dark:text-slate-100 h-14 overflow-hidden ${
                            isTitleLong
                              ? "cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              : ""
                          }`}
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            lineHeight: "1.2rem",
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
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-normal text-xs mb-2"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver completo
                          </Button>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <User className="h-3 w-3" />
                          <span>{idea.creator.username}</span>
                          {idea.creator.role === "admin" && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>há 2h</span>
                      </div>
                      <Button
                        onClick={() => handleVote(idea)}
                        variant="ghost"
                        size="sm"
                        disabled={votingStates[idea.id]}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all w-full sm:w-auto ${
                          AuthManager.hasVotedForPoll(idea.id)
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 bg-red-50 dark:bg-red-900/10"
                            : "text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        {votingStates[idea.id] ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                          <Heart className={`h-4 w-4 ${AuthManager.hasVotedForPoll(idea.id) ? "fill-current" : ""}`} />
                        )}
                        <span className="font-medium">{idea.votes}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredIdeas.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Tente buscar com outros termos ou explore todas as ideias.
              </p>
            </div>
          )}
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
