/**
 * Session state enumeration
 */
export const SessionState = {
  IDLE: 'idle',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
} as const

export type SessionState = typeof SessionState[keyof typeof SessionState]

/**
 * Session event types for tracking state changes
 */
export const SessionEventType = {
  START: 'start',
  PAUSE: 'pause',
  RESUME: 'resume',
  STOP: 'stop',
  AFK_DETECTED: 'afk_detected',
  AFK_RESUMED: 'afk_resumed'
} as const

export type SessionEventType = typeof SessionEventType[keyof typeof SessionEventType]

/**
 * Core session interface
 */
export interface Session {
  id: string
  userId: string
  state: SessionState
  goal?: string
  startTime: Date
  endTime?: Date
  totalDuration: number // in milliseconds
  pausedDuration: number // in milliseconds
  isAfk: boolean
  afkStartTime?: Date
  reflection?: SessionReflection
  createdAt: Date
  updatedAt: Date
}

/**
 * Session reflection captured at session completion
 */
export interface SessionReflection {
  rating: number // 1-5 scale
  notes?: string
  accomplishments?: string[]
  blockers?: string[]
  mood?: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'
}

/**
 * Session event for tracking state changes and history
 */
export interface SessionEvent {
  id: string
  sessionId: string
  type: SessionEventType
  timestamp: Date
  metadata?: Record<string, any>
}

/**
 * Session creation payload
 */
export interface CreateSessionPayload {
  goal?: string
  userId: string
}

/**
 * Session update payload
 */
export interface UpdateSessionPayload {
  goal?: string
  reflection?: SessionReflection
}

/**
 * Session statistics interface
 */
export interface SessionStats {
  totalSessions: number
  totalTime: number // in milliseconds
  averageSessionTime: number // in milliseconds
  longestSession: number // in milliseconds
  shortestSession: number // in milliseconds
  mostProductiveTimeOfDay: string
  weeklyStats: {
    sessionsThisWeek: number
    timeThisWeek: number
  }
  monthlyStats: {
    sessionsThisMonth: number
    timeThisMonth: number
  }
}

/**
 * Timer display format
 */
export interface TimerDisplay {
  hours: string
  minutes: string
  seconds: string
  formatted: string // "HH:MM:SS" or "MM:SS"
}