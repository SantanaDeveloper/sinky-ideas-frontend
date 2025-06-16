"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import { AuthManager } from "@/lib/auth"

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    setIsLoading(true)

    try {
      // 1. Criar a conta
      const signupResponse = await apiClient.signup({
        username: formData.username,
        password: formData.password,
      })

      toast.success(`Conta criada com sucesso! Bem-vindo(a), ${signupResponse.username}!`)

      // 2. Fazer login automático
      try {
        const loginResponse = await apiClient.login({
          username: formData.username,
          password: formData.password,
        })

        // Salvar token
        AuthManager.setToken(loginResponse.access_token)

        // Sincronizar voted polls com a resposta da API
        if (loginResponse.votedPolls && Array.isArray(loginResponse.votedPolls)) {
          AuthManager.setVotedPolls(loginResponse.votedPolls)
        }

        toast.success("Login realizado automaticamente!")
        onSuccess?.()
      } catch (loginError) {
        // Se o login automático falhar, ainda consideramos o cadastro bem-sucedido
        console.warn("Login automático falhou:", loginError)
        toast.info("Conta criada! Faça login para continuar.")
        onSuccess?.()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"

      // Tratamento específico para diferentes tipos de erro
      if (errorMessage.includes("500")) {
        // O interceptor já tratou o toast, não precisamos fazer nada
      } else if (errorMessage.includes("409") || errorMessage.includes("conflict")) {
        toast.error("Este usuário já existe. Tente fazer login ou use outro nome de usuário.")
      } else if (errorMessage.includes("422") || errorMessage.includes("validation")) {
        toast.error("Dados inválidos. Verifique as informações e tente novamente.")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Conta</CardTitle>
        <CardDescription>Crie uma nova conta para começar a votar em ideias</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="ex: jane_doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
