"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Idea } from "@/types/idea"

interface IdeasChartProps {
  ideas: Idea[]
}

export function IdeasChart({ ideas }: IdeasChartProps) {
  // Sort ideas by votes and take top 10
  const topIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 10)

  const maxVotes = Math.max(...topIdeas.map((idea) => idea.votes))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Ideias por Votos</CardTitle>
        <CardDescription>Ranking das ideias mais votadas na plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topIdeas.map((idea, index) => (
            <div key={idea.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{idea.title}</p>
                <p className="text-xs text-muted-foreground">por {idea.creator.username}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(idea.votes / maxVotes) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">{idea.votes}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
