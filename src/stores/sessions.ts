import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Session, 
  SessionEvent, 
  CreateSessionPayload,
  SessionReflection,
  SessionStats,
  TimerDisplay 
} from '@/types'
import { 
  SessionState, 
  SessionEventType 
} from '@/types'
import { useAuthStore } from './auth'

export const useSessionsStore = defineStore('sessions', () => {
  // State
  const sessions = ref<Session[]>([])
  const currentSession = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const timerInterval = ref<number | null>(null)
  const currentTime = ref(Date.now())

  // Getters
  const activeSessions = computed(() => 
    sessions.value.filter(session => session.state === SessionState.ACTIVE)
  )
  
  const hasActiveSession = computed(() => currentSession.value !== null)
  
  const currentSessionDuration = computed(() => {
    if (!currentSession.value) return 0
    
    const now = currentTime.value
    const startTime = new Date(currentSession.value.startTime).getTime()
    const pausedDuration = currentSession.value.pausedDuration
    
    return Math.max(0, now - startTime - pausedDuration)
  })
  
  const formattedSessionTime = computed((): TimerDisplay => {
    const duration = currentSessionDuration.value
    const totalSeconds = Math.floor(duration / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    const formatNumber = (num: number) => num.toString().padStart(2, '0')
    
    return {
      hours: formatNumber(hours),
      minutes: formatNumber(minutes),
      seconds: formatNumber(seconds),
      formatted: hours > 0 
        ? `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`
        : `${formatNumber(minutes)}:${formatNumber(seconds)}`
    }
  })
  
  const recentSessions = computed(() => 
    sessions.value
      .filter(session => session.state === SessionState.COMPLETED)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  )
  
  const sessionStats = computed((): SessionStats => {
    const completedSessions = sessions.value.filter(s => s.state === SessionState.COMPLETED)
    const totalSessions = completedSessions.length
    
    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSessionTime: 0,
        longestSession: 0,
        shortestSession: 0,
        mostProductiveTimeOfDay: '09:00',
        weeklyStats: { sessionsThisWeek: 0, timeThisWeek: 0 },
        monthlyStats: { sessionsThisMonth: 0, timeThisMonth: 0 }
      }
    }
    
    const totalTime = completedSessions.reduce((sum, s) => sum + s.totalDuration, 0)
    const durations = completedSessions.map(s => s.totalDuration)
    
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const thisWeekSessions = completedSessions.filter(s => new Date(s.createdAt) >= weekStart)
    const thisMonthSessions = completedSessions.filter(s => new Date(s.createdAt) >= monthStart)
    
    return {
      totalSessions,
      totalTime,
      averageSessionTime: totalTime / totalSessions,
      longestSession: Math.max(...durations),
      shortestSession: Math.min(...durations),
      mostProductiveTimeOfDay: '09:00', // TODO: Calculate from session start times
      weeklyStats: {
        sessionsThisWeek: thisWeekSessions.length,
        timeThisWeek: thisWeekSessions.reduce((sum, s) => sum + s.totalDuration, 0)
      },
      monthlyStats: {
        sessionsThisMonth: thisMonthSessions.length,
        timeThisMonth: thisMonthSessions.reduce((sum, s) => sum + s.totalDuration, 0)
      }
    }
  })

  // Actions
  const startSession = async (payload: CreateSessionPayload): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('User must be authenticated to start a session')
    }
    
    if (hasActiveSession.value) {
      throw new Error('A session is already active')
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const newSession: Session = {
        id: crypto.randomUUID(),
        userId: authStore.user.id,
        state: SessionState.ACTIVE,
        ...(payload.goal && { goal: payload.goal }),
        startTime: new Date(),
        totalDuration: 0,
        pausedDuration: 0,
        isAfk: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // TODO: Save to Supabase
      // const { error: dbError } = await supabase.from('sessions').insert([newSession])
      // if (dbError) throw dbError
      
      sessions.value.push(newSession)
      currentSession.value = newSession
      
      await addSessionEvent(newSession.id, SessionEventType.START)
      startTimer()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const pauseSession = async (): Promise<void> => {
    if (!currentSession.value || currentSession.value.state !== SessionState.ACTIVE) {
      throw new Error('No active session to pause')
    }
    
    try {
      const updatedSession = {
        ...currentSession.value,
        state: SessionState.PAUSED,
        updatedAt: new Date()
      }
      
      await updateSession(updatedSession)
      await addSessionEvent(currentSession.value.id, SessionEventType.PAUSE)
      stopTimer()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to pause session'
      throw err
    }
  }

  const resumeSession = async (): Promise<void> => {
    if (!currentSession.value || currentSession.value.state !== SessionState.PAUSED) {
      throw new Error('No paused session to resume')
    }
    
    try {
      const pauseDuration = Date.now() - new Date(currentSession.value.updatedAt).getTime()
      const updatedSession = {
        ...currentSession.value,
        state: SessionState.ACTIVE,
        pausedDuration: currentSession.value.pausedDuration + pauseDuration,
        isAfk: false,
        updatedAt: new Date()
      }
      
      await updateSession(updatedSession)
      await addSessionEvent(currentSession.value.id, SessionEventType.RESUME)
      startTimer()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to resume session'
      throw err
    }
  }

  const stopSession = async (reflection?: SessionReflection): Promise<void> => {
    if (!currentSession.value) {
      throw new Error('No active session to stop')
    }
    
    try {
      const now = new Date()
      const totalDuration = now.getTime() - new Date(currentSession.value.startTime).getTime() - currentSession.value.pausedDuration
      
      const updatedSession = {
        ...currentSession.value,
        state: SessionState.COMPLETED,
        endTime: now,
        totalDuration,
        ...(reflection && { reflection }),
        updatedAt: now
      }
      
      await updateSession(updatedSession)
      await addSessionEvent(currentSession.value.id, SessionEventType.STOP)
      stopTimer()
      
      currentSession.value = null
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to stop session'
      throw err
    }
  }

  const updateSession = async (session: Session): Promise<void> => {
    try {
      // TODO: Update in Supabase
      // const { error: dbError } = await supabase
      //   .from('sessions')
      //   .update(session)
      //   .eq('id', session.id)
      // if (dbError) throw dbError
      
      const index = sessions.value.findIndex(s => s.id === session.id)
      if (index !== -1) {
        sessions.value[index] = session
      }
      
      if (currentSession.value?.id === session.id) {
        currentSession.value = session
      }
      
    } catch (err) {
      throw new Error(`Failed to update session: ${err}`)
    }
  }

  const addSessionEvent = async (sessionId: string, eventType: SessionEventType, metadata?: Record<string, any>): Promise<void> => {
    try {
      const event: SessionEvent = {
        id: crypto.randomUUID(),
        sessionId,
        type: eventType,
        timestamp: new Date(),
        ...(metadata && { metadata })
      }
      
      // TODO: Save event to Supabase
      // const { error: dbError } = await supabase.from('session_events').insert([event])
      // if (dbError) throw dbError
      
      console.log('Session event added:', event)
      
    } catch (err) {
      console.error('Failed to add session event:', err)
    }
  }

  const loadSessions = async (): Promise<void> => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || !authStore.user) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Load from Supabase
      // const { data, error: dbError } = await supabase
      //   .from('sessions')
      //   .select('*')
      //   .eq('user_id', authStore.user.id)
      //   .order('created_at', { ascending: false })
      // if (dbError) throw dbError
      
      // Mock data for testing - remove when Supabase is integrated
      const mockSessions: Session[] = [
        {
          id: '1',
          userId: authStore.user.id,
          state: SessionState.COMPLETED,
          goal: 'Implement user authentication system',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
          totalDuration: 2 * 60 * 60 * 1000, // 2 hours
          pausedDuration: 15 * 60 * 1000, // 15 minutes paused
          isAfk: false,
          reflection: {
            rating: 5,
            notes: 'Great session! Completed OAuth integration and tested all flows.',
            accomplishments: ['OAuth setup', 'Login flow', 'Registration'],
            mood: 'excellent'
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          userId: authStore.user.id,
          state: SessionState.COMPLETED,
          goal: 'Fix bug in session timer',
          startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes
          totalDuration: 90 * 60 * 1000, // 1.5 hours
          pausedDuration: 5 * 60 * 1000, // 5 minutes paused
          isAfk: false,
          reflection: {
            rating: 3,
            notes: 'Found the issue but took longer than expected. Need to review timer logic.',
            mood: 'neutral'
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000)
        },
        {
          id: '3',
          userId: authStore.user.id,
          state: SessionState.COMPLETED,
          goal: 'Write unit tests for user components',
          startTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          endTime: new Date(Date.now() - 12 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours
          totalDuration: 3 * 60 * 60 * 1000, // 3 hours
          pausedDuration: 30 * 60 * 1000, // 30 minutes paused
          isAfk: false,
          reflection: {
            rating: 4,
            notes: 'Productive session. Wrote comprehensive tests for all auth components.',
            accomplishments: ['Login tests', 'Registration tests', 'Profile tests'],
            mood: 'good'
          },
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
        },
        {
          id: '4',
          userId: authStore.user.id,
          state: SessionState.COMPLETED,
          goal: 'Research Vue 3 best practices',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          endTime: new Date(Date.now() - 6 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes
          totalDuration: 45 * 60 * 1000, // 45 minutes
          pausedDuration: 0,
          isAfk: false,
          reflection: {
            rating: 5,
            notes: 'Quick but effective research session. Found great patterns for our codebase.',
            mood: 'excellent'
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 45 * 60 * 1000)
        },
        {
          id: '5',
          userId: authStore.user.id,
          state: SessionState.COMPLETED,
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 minutes
          totalDuration: 30 * 60 * 1000, // 30 minutes
          pausedDuration: 0,
          isAfk: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 60 * 1000)
        }
      ]
      
      sessions.value = mockSessions
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sessions'
    } finally {
      isLoading.value = false
    }
  }

  const startTimer = (): void => {
    if (timerInterval.value) return
    
    timerInterval.value = window.setInterval(() => {
      currentTime.value = Date.now()
    }, 1000)
  }

  const stopTimer = (): void => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  // Cleanup on store disposal
  const cleanup = (): void => {
    stopTimer()
  }

  return {
    // State
    sessions,
    currentSession,
    isLoading,
    error,
    
    // Getters
    activeSessions,
    hasActiveSession,
    currentSessionDuration,
    formattedSessionTime,
    recentSessions,
    sessionStats,
    
    // Actions
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    updateSession,
    loadSessions,
    clearError,
    cleanup
  }
})