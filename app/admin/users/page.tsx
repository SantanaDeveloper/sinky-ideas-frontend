"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, Shield, User } from "lucide-react"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"
import type { UserDto } from "@/types/idea"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())
  const router = useRouter()

  const currentUser = AuthManager.getUser()
  const isAdmin = currentUser?.role === "admin"

  useEffect(() => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.")
      router.push("/")
      return
    }

    fetchUsers()
  }, [isAdmin, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const fetchedUsers = await apiClient.getUsers()
      setUsers(fetchedUsers)
    } catch (error) {
      toast.error("Erro ao carregar usuários")
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "user") => {
    if (userId === currentUser?.sub) {
      toast.error("Você não pode alterar sua própria role")
      return
    }

    setUpdatingUsers((prev) => new Set(prev).add(userId))

    try {
      await apiClient.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      toast.success("Role atualizada com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar role")
    } finally {
      setUpdatingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
              <p className="text-muted-foreground">Administre roles e permissões dos usuários</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>Visualize e gerencie as roles dos usuários cadastrados na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Role Atual</TableHead>
                    <TableHead>Alterar Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.role === "admin" ? (
                              <Shield className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{user.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Administrador" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: "admin" | "user") => handleRoleChange(user.id, value)}
                          disabled={user.id === currentUser?.sub || updatingUsers.has(user.id)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {updatingUsers.has(user.id) ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary" />
                            Atualizando...
                          </div>
                        ) : user.id === currentUser?.sub ? (
                          <span className="text-sm text-muted-foreground">Você</span>
                        ) : (
                          <span className="text-sm text-green-600">Ativo</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
