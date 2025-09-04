/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T | null
  error: ApiError | null
  success: boolean
}

/**
 * API error interface
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Database table types based on expected Supabase schema
 */
export interface DatabaseSession {
  id: string
  user_id: string
  state: string
  goal: string | null
  start_time: string
  end_time: string | null
  total_duration: number
  paused_duration: number
  is_afk: boolean
  afk_start_time: string | null
  reflection_rating: number | null
  reflection_notes: string | null
  reflection_accomplishments: string[] | null
  reflection_blockers: string[] | null
  reflection_mood: string | null
  created_at: string
  updated_at: string
}

/**
 * Database session event type
 */
export interface DatabaseSessionEvent {
  id: string
  session_id: string
  event_type: string
  timestamp: string
  metadata: Record<string, any> | null
  created_at: string
}

/**
 * Database user profile type
 */
export interface DatabaseUserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Supabase real-time payload types
 */
export interface RealtimePayload<T = any> {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
}

/**
 * Query filters for API requests
 */
export interface SessionFilters {
  userId?: string
  state?: string
  dateFrom?: Date
  dateTo?: Date
  hasGoal?: boolean
  hasReflection?: boolean
}

/**
 * Bulk operations
 */
export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete'
  data: T[]
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: Date
  services: {
    database: 'up' | 'down'
    auth: 'up' | 'down'
    realtime: 'up' | 'down'
  }
}