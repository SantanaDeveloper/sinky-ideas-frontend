"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Vote, Heart, User, Eye } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { IdeaDetailModal } from "@/components/ideas/idea-detail-modal"
import type { Idea } from "@/types/idea"

export default function MyVotesPage() {
  const [votedIdeas, setVotedIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const router = useRouter()

  const currentUser = AuthManager.getUser()
  const isAuthenticated = AuthManager.isAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para ver seus votos")
      router.push("/")
      return
    }

    fetchMyVotes()
  }, [isAuthenticated, router])

  const fetchMyVotes = async () => {
    try {
      setIsLoading(true)
      const ideas = await apiClient.getMyVotedIdeas()
      setVotedIdeas(ideas)
    } catch (error) {
      toast.error("Erro ao carregar suas ideias votadas")
      console.error("Error fetching voted ideas:", error)
    } finally {
      setIsLoading(false)
    }
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
    fetchMyVotes()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Meus Votos</h1>
                <p className="text-muted-foreground">Ideias nas quais você votou</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : votedIdeas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum voto ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não votou em nenhuma ideia. Que tal começar agora?
                </p>
                <Button onClick={() => router.push("/")}>Ver Ideias Disponíveis</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {votedIdeas.map((idea) => {
                const isTitleLong = idea.title.length > 120

                return (
                  <Card key={idea.id} className="h-64 flex flex-col transition-all duration-200 hover:shadow-lg">
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Título com altura fixa e truncamento */}
                          <div
                            className={`text-base sm:text-lg leading-tight mb-2 h-14 overflow-hidden ${
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

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {idea.creator.username}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 flex-shrink-0">
                          <Heart className="h-3 w-3" />
                          {idea.votes}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 px-3 py-2 rounded-md">
                        <Heart className="h-4 w-4 fill-current" />
                        <span>Você votou nesta ideia</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {votedIdeas.length > 0 && (
            <div className="mt-8 text-center">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas dos seus votos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{votedIdeas.length}</div>
                      <div className="text-sm text-muted-foreground">Ideias votadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(votedIdeas.reduce((acc, idea) => acc + idea.votes, 0) / votedIdeas.length)}
                      </div>
                      <div className="text-sm text-muted-foreground">Média de votos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.max(...votedIdeas.map((idea) => idea.votes))}
                      </div>
                      <div className="text-sm text-muted-foreground">Maior pontuação</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
    </>
  )
}
