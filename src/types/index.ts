// Re-export all types for easy importing
export * from './session'
export * from './user'
export * from './api'

// Vue-specific type extensions
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // Add any global properties here if needed
  }
}

// Environment variables type safety
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Event handler types
export type EventHandler<T = Event> = (event: T) => void
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

// Component prop types
export interface BaseComponentProps {
  class?: string
  style?: string | Record<string, string>
}

// Store action types
export type StoreAction<T = any> = (...args: any[]) => T | Promise<T>
export type StoreGetter<T = any> = () => T

// Router types
export interface RouteMetadata {
  title?: string
  requiresAuth?: boolean
  roles?: string[]
  layout?: string
}

declare module 'vue-router' {
  interface RouteMeta extends RouteMetadata {}
}