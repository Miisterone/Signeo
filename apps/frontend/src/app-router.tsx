import { RouterProvider } from '@tanstack/react-router'
import { useAuth } from './auth/auth-context'
import { router } from './router'

export function AppRouter() {
  const auth = useAuth()

  if (auth.isInitializing) {
    return null
  }

  return <RouterProvider router={router} context={{ auth }} />
}