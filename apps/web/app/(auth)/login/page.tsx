'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'
import { AlertMessage } from '@/components/molecules/AlertMessage'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Credenciais inválidas')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">CityHero</h1>
          <p className="text-sm text-zinc-500 mt-1">Painel de Gestão Municipal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="E-mail" htmlFor="email" required>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField label="Senha" htmlFor="password" required>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </FormField>

          {error && <AlertMessage variant="error">{error}</AlertMessage>}

          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
