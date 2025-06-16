"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, Home, TrendingUp, Search, Vote, Users, BarChart3, Lightbulb, User, LogOut } from "lucide-react"
import { AuthManager } from "@/lib/auth"
import { AuthDialog } from "./auth/auth-dialog"
import { toast } from "sonner"

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    const checkAuth = () => {
      const authStatus = AuthManager.isAuthenticated()
      const userData = AuthManager.getUser()
      setIsAuthenticated(authStatus)
      setUser(userData)
    }

    checkAuth()
    const interval = setInterval(checkAuth, 1000)
    window.addEventListener("storage", checkAuth)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Menu className="h-4 w-4" />
      </Button>
    )
  }

  const isAdmin = user?.role === "admin"

  const menuItems = [
    { icon: Home, label: "Início", href: "/", active: pathname === "/" },
    { icon: TrendingUp, label: "Tendências", href: "/trending", active: pathname === "/trending" },
    { icon: Search, label: "Explorar", href: "/explore", active: pathname === "/explore" },
    ...(isAuthenticated
      ? [{ icon: Vote, label: "Meus Votos", href: "/my-votes", active: pathname === "/my-votes" }]
      : []),
    ...(isAdmin
      ? [
          {
            icon: Users,
            label: "Usuários",
            href: "/admin/users",
            active: pathname === "/admin/users",
            highlight: true,
          },
          { icon: BarChart3, label: "Dashboard", href: "/admin", active: pathname === "/admin" },
        ]
      : []),
  ]

  const handleLogout = () => {
    AuthManager.removeToken()
    setUser(null)
    setIsAuthenticated(false)
    toast.success("Logout realizado com sucesso!")
    setIsOpen(false)
    window.location.reload()
  }

  const handleAuthSuccess = () => {
    setShowAuthDialog(false)
    setIsOpen(false)
    setTimeout(() => {
      setIsAuthenticated(AuthManager.isAuthenticated())
      setUser(AuthManager.getUser())
    }, 100)
  }

  const getInitials = (username: string) => {
    return username
      .split("_")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sinky Ideias
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">Inovação Empresarial</p>
                </div>
              </div>
            </SheetHeader>

            <Separator />

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="p-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.role === "admin" ? "Administrador" : "Usuário"}
                    </p>
                  </div>
                  {user.role === "admin" && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <Button onClick={() => setShowAuthDialog(true)} className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Fazer Login
                </Button>
              </div>
            )}

            <Separator />

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : item.highlight
                        ? "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.count && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            {isAuthenticated && (
              <>
                <Separator />
                <div className="p-4">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AuthDialog mode="login" onSuccess={handleAuthSuccess} open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  )
}
