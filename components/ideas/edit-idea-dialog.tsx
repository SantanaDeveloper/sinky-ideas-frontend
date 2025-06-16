"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import type { Idea } from "@/types/idea"
import { AuthManager } from "@/lib/auth"

interface EditIdeaDialogProps {
  idea: Idea
  onIdeaUpdated?: () => void
}

export function EditIdeaDialog({ idea, onIdeaUpdated }: EditIdeaDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newTitle, setNewTitle] = useState(idea.title)

  const user = AuthManager.getUser()
  const isAdmin = user?.role === "admin"
  const isOwner = user?.sub === idea.creator.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTitle.trim()) {
      toast.error("Por favor, insira um título para a ideia")
      return
    }

    if (newTitle.trim() === idea.title) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)

    try {
      // Usando newTitle conforme esperado pelo controller NestJS
      await apiClient.updateIdeaTitle(idea.id, newTitle.trim())
      toast.success("Título atualizado com sucesso!")
      setIsOpen(false)
      onIdeaUpdated?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao atualizar título"

      // Tratamento específico para erros do NestJS
      if (errorMessage.includes("403") || errorMessage.includes("Somente o criador")) {
        if (isAdmin) {
          toast.error("Erro de permissão - contate o suporte técnico")
        } else {
          toast.error("Apenas o criador pode editar esta ideia")
        }
      } else if (errorMessage.includes("404") || errorMessage.includes("não encontrada")) {
        toast.error("Ideia não encontrada")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setNewTitle(idea.title) // Reset title when opening
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Edit className="h-4 w-4 mr-2" />
          Editar Título
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Título da Ideia</DialogTitle>
          <DialogDescription>
            {isAdmin && !isOwner
              ? "Como administrador, você pode editar o título desta ideia de qualquer usuário."
              : "Atualize o título da sua ideia para torná-la mais clara e atrativa. Apenas o criador pode editar a ideia."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newTitle">Novo Título</Label>
            <Input
              id="newTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Digite o novo título da ideia"
              required
              disabled={isLoading}
              maxLength={255}
            />
            <p className="text-sm text-muted-foreground">{newTitle.length}/255 caracteres</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !newTitle.trim() || newTitle.trim() === idea.title}
              className="flex-1"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
