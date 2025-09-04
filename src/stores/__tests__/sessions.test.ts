import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionsStore } from '../sessions'
import { useAuthStore } from '../auth'
import { SessionState, SessionEventType } from '@/types'
import type { CreateSessionPayload } from '@/types'

describe('Sessions Store', () => {
  let sessionsStore: ReturnType<typeof useSessionsStore>
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    sessionsStore = useSessionsStore()
    authStore = useAuthStore()
    
    // Mock authenticated user
    authStore.$patch({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
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
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(sessionsStore.sessions).toEqual([])
      expect(sessionsStore.currentSession).toBeNull()
      expect(sessionsStore.isLoading).toBe(false)
      expect(sessionsStore.error).toBeNull()
      expect(sessionsStore.hasActiveSession).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('should calculate session duration correctly', () => {
      const startTime = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      
      sessionsStore.$patch({
        currentSession: {
          id: 'session-1',
          userId: 'user-1',
          state: SessionState.ACTIVE,
          startTime,
          totalDuration: 0,
          pausedDuration: 0,
          isAfk: false,
          createdAt: startTime,
          updatedAt: startTime
        }
      })
      
      // Duration should be approximately 5 minutes (300,000 ms)
      expect(sessionsStore.currentSessionDuration).toBeGreaterThan(290000)
      expect(sessionsStore.currentSessionDuration).toBeLessThan(310000)
    })

    it('should format session time correctly', () => {
      const startTime = new Date(Date.now() - 90 * 60 * 1000) // 90 minutes ago
      
      sessionsStore.$patch({
        currentSession: {
          id: 'session-1',
          userId: 'user-1',
          state: SessionState.ACTIVE,
          startTime,
          totalDuration: 0,
          pausedDuration: 0,
          isAfk: false,
          createdAt: startTime,
          updatedAt: startTime
        }
      })
      
      const formatted = sessionsStore.formattedSessionTime
      expect(formatted.hours).toBe('01')
      expect(formatted.minutes).toBe('30')
      expect(formatted.formatted).toBe('01:30:00')
    })

    it('should calculate session stats correctly', () => {
      const completedSessions = [
        {
          id: 'session-1',
          userId: 'user-1',
          state: SessionState.COMPLETED,
          startTime: new Date(),
          totalDuration: 1800000, // 30 minutes
          pausedDuration: 0,
          isAfk: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'session-2',
          userId: 'user-1',
          state: SessionState.COMPLETED,
          startTime: new Date(),
          totalDuration: 3600000, // 60 minutes
          pausedDuration: 0,
          isAfk: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      
      sessionsStore.$patch({ sessions: completedSessions })
      
      const stats = sessionsStore.sessionStats
      expect(stats.totalSessions).toBe(2)
      expect(stats.totalTime).toBe(5400000) // 90 minutes
      expect(stats.averageSessionTime).toBe(2700000) // 45 minutes
      expect(stats.longestSession).toBe(3600000) // 60 minutes
      expect(stats.shortestSession).toBe(1800000) // 30 minutes
    })
  })

  describe('Actions', () => {
    it('should start session successfully', async () => {
      const payload: CreateSessionPayload = {
        goal: 'Complete feature implementation',
        userId: 'user-1'
      }
      
      await sessionsStore.startSession(payload)
      
      expect(sessionsStore.currentSession).toBeDefined()
      expect(sessionsStore.currentSession?.state).toBe(SessionState.ACTIVE)
      expect(sessionsStore.currentSession?.goal).toBe(payload.goal)
      expect(sessionsStore.hasActiveSession).toBe(true)
      expect(sessionsStore.sessions).toHaveLength(1)
    })

    it('should not allow starting session when user is not authenticated', async () => {
      // Clear user authentication
      authStore.$patch({ user: null })
      
      const payload: CreateSessionPayload = {
        goal: 'Test goal',
        userId: 'user-1'
      }
      
      await expect(sessionsStore.startSession(payload)).rejects.toThrow(
        'User must be authenticated to start a session'
      )
    })

    it('should not allow starting session when another is active', async () => {
      // Start first session
      await sessionsStore.startSession({
        goal: 'First session',
        userId: 'user-1'
      })
      
      // Try to start second session
      await expect(sessionsStore.startSession({
        goal: 'Second session',
        userId: 'user-1'
      })).rejects.toThrow('A session is already active')
    })

    it('should pause session successfully', async () => {
      // Start a session first
      await sessionsStore.startSession({
        goal: 'Test session',
        userId: 'user-1'
      })
      
      expect(sessionsStore.currentSession?.state).toBe(SessionState.ACTIVE)
      
      // Pause the session
      await sessionsStore.pauseSession()
      
      expect(sessionsStore.currentSession?.state).toBe(SessionState.PAUSED)
    })

    it('should resume session successfully', async () => {
      // Start and pause a session
      await sessionsStore.startSession({
        goal: 'Test session',
        userId: 'user-1'
      })
      await sessionsStore.pauseSession()
      
      expect(sessionsStore.currentSession?.state).toBe(SessionState.PAUSED)
      
      // Resume the session
      await sessionsStore.resumeSession()
      
      expect(sessionsStore.currentSession?.state).toBe(SessionState.ACTIVE)
    })

    it('should stop session successfully', async () => {
      // Start a session first
      await sessionsStore.startSession({
        goal: 'Test session',
        userId: 'user-1'
      })
      
      expect(sessionsStore.hasActiveSession).toBe(true)
      
      // Stop the session with reflection
      const reflection = {
        rating: 4,
        notes: 'Good progress made',
        accomplishments: ['Completed authentication'],
        mood: 'good' as const
      }
      
      await sessionsStore.stopSession(reflection)
      
      expect(sessionsStore.currentSession).toBeNull()
      expect(sessionsStore.hasActiveSession).toBe(false)
      expect(sessionsStore.sessions[0].state).toBe(SessionState.COMPLETED)
      expect(sessionsStore.sessions[0].reflection).toEqual(reflection)
    })

    it('should clear error', () => {
      sessionsStore.$patch({ error: 'Some error' })
      expect(sessionsStore.error).toBe('Some error')
      
      sessionsStore.clearError()
      expect(sessionsStore.error).toBeNull()
    })

    it('should cleanup properly', () => {
      // Mock timer interval
      const mockInterval = 123
      sessionsStore.$patch({ timerInterval: mockInterval })
      
      vi.spyOn(window, 'clearInterval')
      
      sessionsStore.cleanup()
      
      expect(clearInterval).toHaveBeenCalledWith(mockInterval)
    })
  })
})