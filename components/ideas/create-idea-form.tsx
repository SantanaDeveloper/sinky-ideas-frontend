"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sparkles, Send, Lightbulb, User } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import { AuthDialog } from "../auth/auth-dialog"

interface CreateIdeaFormProps {
  onIdeaCreated?: () => void
}

export function CreateIdeaForm({ onIdeaCreated }: CreateIdeaFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  // ✅ ADICIONAR: Estado reativo para autenticação
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  // ✅ MELHORADO: Verificar autenticação periodicamente
  useEffect(() => {
    setMounted(true)

    const checkAuth = () => {
      const authStatus = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()

      setIsAuthenticated(authStatus)
      setUser(userData)
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

  if (!mounted) {
    return <div className="w-full h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    // ✅ MELHORADO: Forçar atualização imediata do estado
    setTimeout(() => {
      setIsAuthenticated(AuthManager.isAuthenticated())
      setUser(AuthManager.getUser())
    }, 100)
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    setIsOpen(true)
  }

  // Renderização condicional do botão
  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={handleClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group border-0 h-auto"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xl font-bold mb-1">Fazer Login e Compartilhar Ideia</div>
              <div className="text-blue-100 text-sm font-normal">Entre para transformar sua inspiração em inovação</div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
              <span className="text-sm">Entrar</span>
            </div>
          </div>
        </Button>

        <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Por favor, insira um título para a ideia")
      return
    }

    setIsLoading(true)

    try {
      await apiClient.createIdea({ title: title.trim() })
      toast.success("Ideia criada com sucesso!")
      setTitle("")
      setIsOpen(false)
      onIdeaCreated?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar ideia")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatUsername = (username: string) => {
    return username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group border-0 h-auto">
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xl font-bold mb-1">Compartilhar Nova Ideia</div>
                <div className="text-blue-100 text-sm font-normal flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Olá, {user ? formatUsername(user.username) : "Usuário"}! Transforme sua inspiração em inovação
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
                <span className="text-sm">Criar</span>
              </div>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              Criar Nova Ideia
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400 text-lg">
              Olá, <strong>{user ? formatUsername(user.username) : "Usuário"}</strong>! Compartilhe sua visão inovadora
              com toda a empresa. Detalhe sua ideia para que outros possam entender e apoiar sua proposta.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {user ? getInitials(user.username) : "U"}
              </div>
              <div className="flex-1 space-y-4">
                <div className="relative">
                  <Textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Descreva sua ideia inovadora em detalhes... 

Exemplo: 'App de delivery sustentável que conecta restaurantes locais com foco em embalagens biodegradáveis e entregas de bicicleta, reduzindo o impacto ambiental e promovendo a economia local.'"
                    required
                    disabled={isLoading}
                    maxLength={500}
                    className="min-h-[200px] border-2 border-slate-200 dark:border-slate-700 resize-none text-lg placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-slate-50 dark:bg-slate-800 rounded-xl p-4"
                  />
                  <div className="absolute bottom-3 right-3 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md">
                    {title.length}/500
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                💡 <strong>Dica:</strong> Ideias detalhadas e bem explicadas recebem mais votos!
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="px-6 py-3">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Publicar Ideia
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
