import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.VITE_TANSTACK_DEVTOOLS === 'true' ? <TanStackRouterDevtools /> : null}
    </>
  )
}