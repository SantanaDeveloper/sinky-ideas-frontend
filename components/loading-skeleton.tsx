import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className="h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-professional"
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <Skeleton className="h-7 w-16 rounded-full bg-gradient-to-r from-red-200 to-pink-200 dark:from-red-800 dark:to-pink-800" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
