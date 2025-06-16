"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Heart, User, Calendar } from "lucide-react"
import type { Idea } from "@/types/idea"

interface RecentActivityProps {
  ideas: Idea[]
}

interface ActivityItem {
  id: string
  type: "idea_created" | "high_votes"
  title: string
  description: string
  timestamp: string
  metadata?: any
}

export function RecentActivity({ ideas }: RecentActivityProps) {
  // Generate mock recent activities based on ideas
  const activities: ActivityItem[] = [
    ...ideas.slice(0, 3).map((idea) => ({
      id: `idea_${idea.id}`,
      type: "idea_created" as const,
      title: "Nova ideia criada",
      description: `${idea.creator.username} criou "${idea.title}"`,
      timestamp: "2 horas atrás",
      metadata: { votes: idea.votes },
    })),
    ...ideas
      .filter((idea) => idea.votes > 30)
      .slice(0, 2)
      .map((idea) => ({
        id: `votes_${idea.id}`,
        type: "high_votes" as const,
        title: "Ideia em destaque",
        description: `"${idea.title}" atingiu ${idea.votes} votos`,
        timestamp: "1 dia atrás",
        metadata: { votes: idea.votes },
      })),
  ]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "idea_created":
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      case "high_votes":
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "idea_created":
        return "bg-blue-50 dark:bg-blue-950"
      case "high_votes":
        return "bg-red-50 dark:bg-red-950"
      default:
        return "bg-gray-50 dark:bg-gray-950"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas atividades na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                  {activity.metadata?.votes && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.votes} votos
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
