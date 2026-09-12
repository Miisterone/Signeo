import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../../pages/login/login'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && !context.auth.mustReauth) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginPage,
})
