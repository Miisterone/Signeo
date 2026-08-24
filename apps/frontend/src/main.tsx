import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from './auth/auth-provider'
import { router } from './router'
import './index.css'

function AppRouter() {
  const auth = useAuth()

  if (auth.isInitializing) {
    return null
  }

  return <RouterProvider router={router} context={{ auth }} />
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Element racine #root introuvable')
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
)