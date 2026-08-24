import { useState } from 'react'
import type { FormEvent } from 'react'
import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-provider'

const routeApi = getRouteApi('/auth/register')

export function RegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const { redirect } = routeApi.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [confirmationMessage, setConfirmationMessage] = useState<string | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(undefined)
    setConfirmationMessage(undefined)
    setIsSubmitting(true)

    try {
      const { needsEmailConfirmation } = await signUp({ email, password })

      if (needsEmailConfirmation) {
        setConfirmationMessage(
          'Compte créé. Confirme ton adresse email en cliquant sur le lien reçu par mail avant de te connecter.',
        )
        return
      }

      await router.invalidate()
      await router.navigate({ to: redirect })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Inscription impossible')
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
        autoComplete="new-password"
        onChange={(event) => setPassword(event.target.value)}
      />
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      {confirmationMessage ? <p>{confirmationMessage}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        S'inscrire
      </button>
      <p>
        Déjà un compte ? 
        <Link to="/auth/login" search={{ redirect: '/dashboard' }}>Se connecter</Link>
      </p>
    </form>
  )
}
