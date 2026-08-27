import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/auth-provider'
import { AppRouter } from './app-router'
import './index.css'

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