"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { IdeaCard } from "./idea-card"
import { LoadingSkeleton } from "./loading-skeleton"
import type { Idea } from "@/types/idea"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface IdeasListProps {
  initialIdeas?: Idea[]
}

export interface IdeasListRef {
  refreshIdeas: () => void
}

export const IdeasList = forwardRef<IdeasListRef, IdeasListProps>(({ initialIdeas = [] }, ref) => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [isLoading, setIsLoading] = useState(!initialIdeas.length)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchIdeas = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const fetchedIdeas = await apiClient.getIdeas()
      setIdeas(fetchedIdeas)

      if (showRefreshingState) {
        toast.success("Lista de ideias atualizada!")
      }
    } catch (error) {
      toast.error("Erro ao carregar ideias")
      console.error("Error fetching ideas:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Expõe o método refreshIdeas para o componente pai
  useImperativeHandle(ref, () => ({
    refreshIdeas: () => fetchIdeas(true),
  }))

  useEffect(() => {
    if (!initialIdeas.length) {
      fetchIdeas()
    }
  }, [])

  const handleIdeaUpdate = () => {
    fetchIdeas(true)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="relative">
      {/* Indicador de refresh */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-primary/10 backdrop-blur-sm rounded-lg p-2 mb-4">
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            Atualizando lista de ideias...
          </div>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhuma ideia encontrada. Seja o primeiro a compartilhar uma ideia!
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-200 ${
            isRefreshing ? "opacity-75" : "opacity-100"
          }`}
        >
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onIdeaUpdate={handleIdeaUpdate} />
          ))}
        </div>
      )}
    </div>
  )
})

IdeasList.displayName = "IdeasList"
