import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { AuthContextValue } from './interfaces/auth.model'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: { auth: undefined! as AuthContextValue },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}