import { createFileRoute, redirect } from '@tanstack/react-router'
import { RegisterPage } from '../../pages/register/register'

const DEFAULT_REDIRECT = '/dashboard'

interface RegisterSearch {
  readonly redirect: string
}

export const Route = createFileRoute('/auth/register')({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : DEFAULT_REDIRECT,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ href: search.redirect })
    }
  },
  component: RegisterPage,
})
