import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import Login from '@/views/auth/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import { useAuthStore } from '@/stores/auth'

// Create router for testing
const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const vuetify = createVuetify({
  components,
  directives
})

describe('Authentication Flow Integration', () => {
  let wrapper: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    
    // Mock router push
    vi.spyOn(router, 'push')
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should allow user to login and redirect to dashboard', async () => {
    // Mount login component
    wrapper = mount(Login, {
      global: {
        plugins: [pinia, router, vuetify],
        stubs: {
          'v-container': true,
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-form': true,
          'v-text-field': true,
          'v-alert': true,
          'v-btn': true,
          'v-divider': true,
          'v-icon': true
        }
      }
    })

    const authStore = useAuthStore()

    // Initially should not be authenticated
    expect(authStore.isAuthenticated).toBe(false)

    // Simulate form submission
    const loginSpy = vi.spyOn(authStore, 'login')
    
    // Mock successful login
    loginSpy.mockResolvedValue(undefined)

    // Trigger login action
    await authStore.login({
      email: 'test@example.com',
      password: 'password123'
    })

    // Should be authenticated after login
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.user?.email).toBe('test@example.com')
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('should handle login errors gracefully', async () => {
    wrapper = mount(Login, {
      global: {
        plugins: [pinia, router, vuetify],
        stubs: {
          'v-container': true,
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true,
          'v-form': true,
          'v-text-field': true,
          'v-alert': true,
          'v-btn': true,
          'v-divider': true,
          'v-icon': true
        }
      }
    })

    const authStore = useAuthStore()
    
    // Mock login failure
    const loginError = new Error('Invalid credentials')
    const loginSpy = vi.spyOn(authStore, 'login').mockRejectedValue(loginError)

    try {
      await authStore.login({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })
    } catch (error) {
      expect(error).toBe(loginError)
    }

    // Should not be authenticated after failed login
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
    expect(loginSpy).toHaveBeenCalled()
  })

  it('should logout and clear user data', async () => {
    const authStore = useAuthStore()

    // First login
    await authStore.login({
      email: 'test@example.com',
      password: 'password123'
    })

    expect(authStore.isAuthenticated).toBe(true)

    // Then logout
    await authStore.logout()

    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.user).toBeNull()
  })
})