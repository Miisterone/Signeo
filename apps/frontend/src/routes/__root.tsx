import { createRootRouteWithContext } from '@tanstack/react-router'
import type { RouterContext } from '../interfaces/router-context.model'
import { RootLayout } from '../layouts/-root-layout.tsx'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})