import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '../../auth/auth-context'

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setErrorMessage(undefined)

    try {
      await signOut()
      await router.invalidate()
      await navigate({ to: '/auth/login', search: { redirect: '/dashboard' } })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Déconnexion impossible')
      setIsSigningOut(false)
    }
  }

  return (
    <main>
      <header>
        <h1>Dashboard</h1>
        <button type="button" onClick={handleSignOut} disabled={isSigningOut}>
          Se déconnecter
        </button>
      </header>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <p>Connecté en tant que {user?.email}</p>
    </main>
  )
}