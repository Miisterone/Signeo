import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../../pages/login/login'

const DEFAULT_REDIRECT = '/dashboard'

interface LoginSearch {
  readonly redirect: string
}

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : DEFAULT_REDIRECT,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ href: search.redirect })
    }
  },
  component: LoginPage,
})