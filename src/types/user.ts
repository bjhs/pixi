/**
 * User interface for authentication and profile management
 */
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  session: SessionPreferences
  privacy: PrivacySettings
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  enabled: boolean
  sessionReminders: boolean
  afkWarnings: boolean
  goalReminders: boolean
  weeklyReports: boolean
}

/**
 * Session-related preferences
 */
export interface SessionPreferences {
  defaultSessionDuration: number // in minutes
  afkTimeoutMinutes: number // default 5 minutes
  autoSaveInterval: number // in seconds
  showTimerInTitle: boolean
  pauseTimeoutMinutes: number // default 120 minutes (2 hours)
  maxSessionHours: number // default 4 hours
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  shareStats: boolean
  allowAnalytics: boolean
  dataRetentionDays: number // default 365 days
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Registration payload
 */
export interface RegisterPayload {
  email: string
  password: string
  firstName?: string
  lastName?: string
}