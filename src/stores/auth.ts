import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  User, 
  LoginCredentials, 
  RegisterPayload, 
  UserPreferences 
} from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    return user.value.firstName && user.value.lastName
      ? `${user.value.firstName} ${user.value.lastName}`
      : user.value.email
  })
  const userInitials = computed(() => {
    if (!user.value) return ''
    if (user.value.firstName && user.value.lastName) {
      return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
    }
    return user.value.email[0]?.toUpperCase() || ''
  })

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Implement Supabase authentication
      // const { data, error: authError } = await supabase.auth.signInWithPassword(credentials)
      // if (authError) throw authError
      
      // For now, mock successful login
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user data
      user.value = {
        id: '1',
        email: credentials.email,
        firstName: 'Test',
        lastName: 'User',
        preferences: getDefaultUserPreferences(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload: RegisterPayload): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Implement Supabase registration
      // const { data, error: authError } = await supabase.auth.signUp(payload)
      // if (authError) throw authError
      
      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      user.value = {
        id: '1',
        email: payload.email,
        ...(payload.firstName && { firstName: payload.firstName }),
        ...(payload.lastName && { lastName: payload.lastName }),
        preferences: getDefaultUserPreferences(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Implement Supabase logout
      // await supabase.auth.signOut()
      
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // TODO: Implement Supabase profile update
      // const { error: updateError } = await supabase
      //   .from('user_profiles')
      //   .update(updates)
      //   .eq('id', user.value.id)
      // if (updateError) throw updateError
      
      user.value = { ...user.value, ...updates, updatedAt: new Date() }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Profile update failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<void> => {
    if (!user.value) return
    
    try {
      const updatedPreferences = { ...user.value.preferences, ...preferences }
      await updateProfile({ preferences: updatedPreferences })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Preferences update failed'
      throw err
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const initializeAuth = async (): Promise<void> => {
    isLoading.value = true
    
    try {
      // TODO: Check for existing session with Supabase
      // const { data: { session } } = await supabase.auth.getSession()
      // if (session?.user) {
      //   // Load user profile
      // }
      
      // Mock initialization - check localStorage for demo purposes
      const savedUser = localStorage.getItem('pixi-user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Helper function to create default user preferences
  const getDefaultUserPreferences = (): UserPreferences => ({
    theme: 'auto',
    notifications: {
      enabled: true,
      sessionReminders: true,
      afkWarnings: true,
      goalReminders: true,
      weeklyReports: false
    },
    session: {
      defaultSessionDuration: 120, // 2 hours
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
  })

  return {
    // State
    user,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userInitials,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updatePreferences,
    clearError,
    initializeAuth
  }
})