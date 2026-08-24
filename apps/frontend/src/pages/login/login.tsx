import { useState } from 'react'
import type { FormEvent } from 'react'
import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-provider'

const routeApi = getRouteApi('/auth/login')

export function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const { redirect } = routeApi.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(undefined)
    setIsSubmitting(true)

    try {
      await signIn({ email, password })
      await router.invalidate()
      await router.navigate({ to: redirect })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Connexion impossible')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        value={password}
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
      />
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        Se connecter
      </button>
      <p>
        Pas de compte ? 
        <Link to="/auth/register" search={{ redirect: '/dashboard' }}>S'inscrire</Link>
      </p>
    </form>
  )
}