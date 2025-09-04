// Export all stores for easy importing
export { useAuthStore } from './auth'
export { useSessionsStore } from './sessions'

// Store types
export type { StoreAction, StoreGetter } from '@/types'

// Utility functions for stores
export const resetAllStores = (): void => {
  // This would reset all stores to their initial state
  // Useful for logout or testing scenarios
}