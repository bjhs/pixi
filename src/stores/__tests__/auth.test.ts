import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import type { LoginCredentials, RegisterPayload } from '@/types'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const authStore = useAuthStore()
      
      expect(authStore.user).toBeNull()
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('should return correct userDisplayName when user is authenticated', async () => {
      const authStore = useAuthStore()
      
      // Mock user data
      authStore.$patch({
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          preferences: {
            theme: 'light',
            notifications: {
              enabled: true,
              sessionReminders: true,
              afkWarnings: true,
              goalReminders: true,
              weeklyReports: false
            },
            session: {
              defaultSessionDuration: 120,
              afkTimeoutMinutes: 5,
              autoSaveInterval: 30,
              showTimerInTitle: true,
              pauseTimeoutMinutes: 120,
              maxSessionHours: 4
            },
            privacy: {
              shareStats: false,
              allowAnalytics: false,
              dataRetentionDays: 365
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      expect(authStore.userDisplayName).toBe('John Doe')
      expect(authStore.userInitials).toBe('JD')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should return email when user has no first/last name', async () => {
      const authStore = useAuthStore()
      
      authStore.$patch({
        user: {
          id: '1',
          email: 'test@example.com',
          preferences: {
            theme: 'light',
            notifications: {
              enabled: true,
              sessionReminders: true,
              afkWarnings: true,
              goalReminders: true,
              weeklyReports: false
            },
            session: {
              defaultSessionDuration: 120,
              afkTimeoutMinutes: 5,
              autoSaveInterval: 30,
              showTimerInTitle: true,
              pauseTimeoutMinutes: 120,
              maxSessionHours: 4
            },
            privacy: {
              shareStats: false,
              allowAnalytics: false,
              dataRetentionDays: 365
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      expect(authStore.userDisplayName).toBe('test@example.com')
      expect(authStore.userInitials).toBe('T')
    })
  })

  describe('Actions', () => {
    it('should login successfully with valid credentials', async () => {
      const authStore = useAuthStore()
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      await authStore.login(credentials)
      
      expect(authStore.user).toBeDefined()
      expect(authStore.user?.email).toBe(credentials.email)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
      expect(authStore.isLoading).toBe(false)
    })

    it('should register successfully with valid payload', async () => {
      const authStore = useAuthStore()
      const payload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith'
      }
      
      await authStore.register(payload)
      
      expect(authStore.user).toBeDefined()
      expect(authStore.user?.email).toBe(payload.email)
      expect(authStore.user?.firstName).toBe(payload.firstName)
      expect(authStore.user?.lastName).toBe(payload.lastName)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.error).toBeNull()
      expect(authStore.isLoading).toBe(false)
    })

    it('should logout successfully', async () => {
      const authStore = useAuthStore()
      
      // First login
      await authStore.login({
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(authStore.isAuthenticated).toBe(true)
      
      // Then logout
      await authStore.logout()
      
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.error).toBeNull()
      expect(authStore.isLoading).toBe(false)
    })

    it('should clear error', () => {
      const authStore = useAuthStore()
      
      authStore.$patch({ error: 'Some error' })
      expect(authStore.error).toBe('Some error')
      
      authStore.clearError()
      expect(authStore.error).toBeNull()
    })

    it('should initialize auth from localStorage', async () => {
      const mockUserData = {
        id: '1',
        email: 'stored@example.com',
        firstName: 'Stored',
        lastName: 'User',
        preferences: {
          theme: 'dark' as const,
          notifications: {
            enabled: true,
            sessionReminders: true,
            afkWarnings: true,
            goalReminders: true,
            weeklyReports: false
          },
          session: {
            defaultSessionDuration: 120,
            afkTimeoutMinutes: 5,
            autoSaveInterval: 30,
            showTimerInTitle: true,
            pauseTimeoutMinutes: 120,
            maxSessionHours: 4
          },
          privacy: {
            shareStats: false,
            allowAnalytics: false,
            dataRetentionDays: 365
          }
        },
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
      
      // Mock localStorage
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockUserData))
      
      const authStore = useAuthStore()
      await authStore.initializeAuth()
      
      expect(authStore.user).toEqual(mockUserData)
      expect(authStore.isAuthenticated).toBe(true)
      expect(localStorage.getItem).toHaveBeenCalledWith('pixi-user')
    })
  })
})