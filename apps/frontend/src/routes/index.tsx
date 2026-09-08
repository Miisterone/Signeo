import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    const needsLogin = !context.auth.isAuthenticated || context.auth.mustReauth
    throw redirect({ to: needsLogin ? '/auth/login' : '/dashboard' })
  },
})