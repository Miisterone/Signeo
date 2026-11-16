import { useEffect } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import { useAuth } from './auth/auth-context'
import { authStore } from './auth/auth-store'
import { router } from './router'

const routerContext = {
  get auth() {
    return authStore.getSnapshot()
  },
}

export function AppRouter() {
  const { isInitializing, session } = useAuth()

  // Re-run route guards when auth changes
  useEffect(() => {
    if (!isInitializing) void router.invalidate()
  }, [isInitializing, session])

  if (isInitializing) {
    return null
  }

  return <RouterProvider router={router} context={routerContext} />
}
