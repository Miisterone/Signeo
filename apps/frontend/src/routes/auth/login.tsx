import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../../pages/login/login'

interface LoginSearch {
  reason?: 'password-changed'
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    reason: search.reason === 'password-changed' ? 'password-changed' : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})
