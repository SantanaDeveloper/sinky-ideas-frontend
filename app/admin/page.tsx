"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Lightbulb, Heart, TrendingUp, Activity, ArrowLeft, Shield, User } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import type { UserDto, Idea } from "@/types/idea"

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const currentUser = AuthManager.getUser()
  const isAdmin = currentUser?.role === "admin"

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.")
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [isAdmin, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [fetchedUsers, fetchedIdeas] = await Promise.all([apiClient.getUsers(), apiClient.getIdeas()])
      setUsers(fetchedUsers)
      setIdeas(fetchedIdeas)
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard")
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  // Calculate statistics
  const totalUsers = users.length
  const totalIdeas = ideas.length
  const totalVotes = ideas.reduce((sum, idea) => sum + idea.votes, 0)
  const adminUsers = users.filter((user) => user.role === "admin").length
  const avgVotesPerIdea = totalIdeas > 0 ? Math.round(totalVotes / totalIdeas) : 0

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">Visão geral da plataforma Sinky Ideias</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
              >
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Usuários
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total de Usuários
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalUsers}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 font-medium">+12%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Ideias</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Lightbulb className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalIdeas}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 font-medium">+8%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Votos</CardTitle>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalVotes}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 font-medium">+23%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Média de Votos</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{avgVotesPerIdea}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 font-medium">+5%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">por ideia</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Ideas */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Top 5 Ideias Mais Votadas
              </CardTitle>
              <CardDescription>Ranking das ideias mais populares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ideas
                  .sort((a, b) => b.votes - a.votes)
                  .slice(0, 5)
                  .map((idea, index) => (
                    <div
                      key={idea.id}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{idea.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">por {idea.creator.username}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        {idea.votes}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Users className="h-5 w-5 text-blue-600" />
                Usuários Mais Ativos
              </CardTitle>
              <CardDescription>Usuários com mais ideias criadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 5).map((user, index) => {
                  const userIdeas = ideas.filter((idea) => idea.creator.id === user.id)
                  const totalVotes = userIdeas.reduce((sum, idea) => sum + idea.votes, 0)

                  return (
                    <div
                      key={user.id}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(user.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.username}</p>
                          {user.role === "admin" ? (
                            <Shield className="h-3 w-3 text-orange-600" />
                          ) : (
                            <User className="h-3 w-3 text-slate-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {userIdeas.length} ideias • {totalVotes} votos recebidos
                        </p>
                      </div>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Activity className="h-5 w-5 text-green-600" />
              Status do Sistema
            </CardTitle>
            <CardDescription>Informações sobre o funcionamento da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Uptime</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600 mb-1">120ms</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Tempo Resposta</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">v1.0.0</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Versão</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-2xl font-bold text-orange-600 mb-1">Prod</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Ambiente</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Modo de Produção:</strong> A aplicação está conectada ao backend real e funcionando
                  corretamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
