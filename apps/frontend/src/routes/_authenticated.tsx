import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../layouts/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AuthenticatedLayout,
})
