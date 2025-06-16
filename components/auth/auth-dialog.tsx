"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { LogIn, UserPlus } from "lucide-react"
import { AuthManager } from "@/lib/auth"

interface AuthDialogProps {
  children?: React.ReactNode
  mode?: "login" | "signup"
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AuthDialog({
  children,
  mode = "login",
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AuthDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<"login" | "signup">(mode)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Usar estado controlado se fornecido, senão usar estado interno
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = controlledOnOpenChange || setInternalOpen

  useEffect(() => {
    setIsAuthenticated(AuthManager.isAuthenticated())
  }, [])

  // Reset mode when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode)
    }
  }, [isOpen, mode])

  const handleSuccess = () => {
    setIsOpen(false)
    setIsAuthenticated(true)
    onSuccess?.()
  }

  const toggleMode = () => {
    setCurrentMode((prev) => (prev === "login" ? "signup" : "login"))
  }

  // Don't show the trigger button if user is already authenticated and no custom children
  if (isAuthenticated && !children && controlledOpen === undefined) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      {!children && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4">
          {currentMode === "login" ? <LoginForm onSuccess={handleSuccess} /> : <SignupForm onSuccess={handleSuccess} />}

          <div className="text-center">
            <Button variant="link" onClick={toggleMode} className="text-sm">
              {currentMode === "login" ? (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Não tem conta? Criar uma
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Já tem conta? Fazer login
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
