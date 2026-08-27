import { createContext, useContext } from "react"
import type { AuthContextValue } from "../interfaces/auth.model"

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('Error useAuth()')
  }

  return context
}