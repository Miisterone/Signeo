import { useSyncExternalStore } from "react"
import type { AuthContextValue } from "../interfaces/auth"
import { authStore } from "./auth-store"

export function useAuth(): AuthContextValue {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot)
}
