"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Lightbulb, TrendingUp, Home, Search, Users, BarChart3, Vote } from "lucide-react"
import { IdeasList } from "@/components/ideas-list"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { UserMenu } from "@/components/auth/user-menu"
import { CreateIdeaForm } from "@/components/ideas/create-idea-form"
import { TrendingIdeas } from "@/components/trending-ideas"
import { MobileMenu } from "@/components/mobile-menu"
import { AuthManager } from "@/lib/auth"
import Link from "next/link"

// Atualizar a função AuthSection para reagir a mudanças de autenticação
function AuthSection() {
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsAuthenticated(AuthManager.isAuthenticated())

    // Listener para mudanças no localStorage (logout)
    const handleStorageChange = () => {
      setIsAuthenticated(AuthManager.isAuthenticated())
    }

    window.addEventListener("storage", handleStorageChange)

    // Verificar periodicamente se o token ainda é válido
    const interval = setInterval(() => {
      const currentAuth = AuthManager.isAuthenticated()
      if (currentAuth !== isAuthenticated) {
        setIsAuthenticated(currentAuth)
      }
    }, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!mounted) {
    return <div className="w-20 h-8" /> // Placeholder para evitar layout shift
  }

  return <div className="flex items-center gap-3">{isAuthenticated ? <UserMenu /> : <AuthDialog />}</div>
}

function Sidebar() {
  const user = AuthManager.getUser()
  const isAuthenticated = AuthManager.isAuthenticated()
  const isAdmin = user?.role === "admin"

  const menuItems = [
    { icon: Home, label: "Início", href: "/", active: true },
    { icon: TrendingUp, label: "Tendências", href: "/trending" },
    { icon: Search, label: "Explorar", href: "/explore" },
    ...(isAuthenticated ? [{ icon: Vote, label: "Meus Votos", href: "/my-votes" }] : []),
    ...(isAdmin
      ? [
          { icon: Users, label: "Usuários", href: "/admin/users", highlight: true },
          { icon: BarChart3, label: "Dashboard", href: "/admin" },
        ]
      : []),
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 p-6 hidden lg:block z-30">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
            <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sinky Ideias
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inovação Empresarial</p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              item.active
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : item.highlight
                  ? "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
            {item.count && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.count}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default function HomePage() {
  const ideasListRef = useRef<{ refreshIdeas: () => void }>(null)

  const handleIdeaCreated = () => {
    ideasListRef.current?.refreshIdeas()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu + Logo */}
              <div className="flex items-center gap-3">
                <MobileMenu />
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Sinky Ideias
                  </h1>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="hidden sm:block">
                  <AuthSection />
                </div>
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="sm:hidden mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
              <AuthSection />
            </div>
          </div>
        </header>

        {/* Create Idea - Responsivo */}
        <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              Compartilhe sua Ideia
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Sua próxima grande ideia pode estar a um clique de distância
            </p>
          </div>
          <CreateIdeaForm onIdeaCreated={handleIdeaCreated} />
        </div>

        {/* Trending Ideas - Responsivo */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <TrendingIdeas onIdeaUpdate={handleIdeaCreated} />
        </div>

        {/* Ideas Feed - Responsivo */}
        <main className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Todas as Ideias</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Explore todas as propostas da comunidade</p>
          </div>

          <Suspense fallback={<LoadingSkeleton />}>
            <IdeasList ref={ideasListRef} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
