"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, User } from "lucide-react"
import type { UserDto, Idea } from "@/types/idea"

interface UsersActivityProps {
  users: UserDto[]
  ideas: Idea[]
}

export function UsersActivity({ users, ideas }: UsersActivityProps) {
  // Calculate user statistics
  const userStats = users
    .map((user) => {
      const userIdeas = ideas.filter((idea) => idea.creator.id === user.id)
      const totalVotes = userIdeas.reduce((sum, idea) => sum + idea.votes, 0)

      return {
        ...user,
        ideasCount: userIdeas.length,
        totalVotes,
        avgVotes: userIdeas.length > 0 ? Math.round(totalVotes / userIdeas.length) : 0,
      }
    })
    .sort((a, b) => b.totalVotes - a.totalVotes)

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade dos Usuários</CardTitle>
        <CardDescription>Usuários mais ativos por ideias criadas e votos recebidos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userStats.slice(0, 8).map((user, index) => (
            <div key={user.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10">{getInitials(user.username)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{user.username}</p>
                  {user.role === "admin" ? (
                    <Shield className="h-3 w-3 text-primary" />
                  ) : (
                    <User className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{user.ideasCount} ideias</span>
                  <span>{user.totalVotes} votos recebidos</span>
                  {user.avgVotes > 0 && <span>{user.avgVotes} média/ideia</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
                {index < 3 && (
                  <Badge variant="outline" className="text-xs">
                    Top {index + 1}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
