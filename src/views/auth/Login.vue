<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center text-h4 pa-6">
            <v-icon class="mr-2" size="32">mdi-login</v-icon>
            Sign In
          </v-card-title>
          
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                required
                class="mb-4"
              />
              
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                required
                class="mb-4"
              />
              
              <v-alert
                v-if="authStore.error"
                type="error"
                class="mb-4"
                closable
                @click:close="authStore.clearError"
              >
                {{ authStore.error }}
              </v-alert>
              
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.isLoading"
                :disabled="!valid"
                class="mb-4"
              >
                Sign In
              </v-btn>
              
              <v-divider class="my-4" />
              
              <div class="text-center">
                <p class="text-body-2 mb-2">Don't have an account?</p>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="router.push({ name: 'Register' })"
                >
                  Create Account
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
        
        <!-- Demo credentials info -->
        <v-card class="mt-4" variant="outlined">
          <v-card-title class="text-body-1">
            <v-icon class="mr-2">mdi-information</v-icon>
            Demo Mode
          </v-card-title>
          <v-card-text class="text-body-2">
            This is currently running in demo mode. Use any email and password to continue.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type { LoginCredentials } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = ref()
const valid = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

// Actions
const handleLogin = async () => {
  if (!valid.value) return
  
  try {
    const credentials: LoginCredentials = {
      email: email.value,
      password: password.value
    }
    
    await authStore.login(credentials)
    
    // Redirect to intended page or dashboard
    const redirect = router.currentRoute.value.query['redirect'] as string
    router.push(redirect || { name: 'Dashboard' })
    
  } catch (error) {
    // Error is handled by the store
    console.error('Login failed:', error)
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.v-card {
  border-radius: 12px;
}
</style>