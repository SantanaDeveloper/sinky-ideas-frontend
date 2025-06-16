import { Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AdminBadge() {
  return (
    <Badge
      variant="outline"
      className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
    >
      <Shield className="h-3 w-3 mr-1" />
      Admin
    </Badge>
  )
}
