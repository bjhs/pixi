<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-center text-h4 pa-6">
            <v-icon class="mr-2" size="32">mdi-account-plus</v-icon>
            Create Account
          </v-card-title>
          
          <v-card-text>
            <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="firstName"
                    label="First Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="lastName"
                    label="Last Name"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
              </v-row>
              
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
              
              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                label="Confirm Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
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
                Create Account
              </v-btn>
              
              <v-divider class="my-4" />
              
              <div class="text-center">
                <p class="text-body-2 mb-2">Already have an account?</p>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="router.push({ name: 'Login' })"
                >
                  Sign In
                </v-btn>
              </div>
            </v-form>
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
import type { RegisterPayload } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const form = ref()
const valid = ref(false)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  (v: string) => /(?=.*[a-z])(?=.*[A-Z])/.test(v) || 'Password must contain uppercase and lowercase letters'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === password.value || 'Passwords do not match'
]

// Actions
const handleRegister = async () => {
  if (!valid.value) return
  
  try {
    const payload: RegisterPayload = {
      email: email.value,
      password: password.value,
      ...(firstName.value && { firstName: firstName.value }),
      ...(lastName.value && { lastName: lastName.value })
    }
    
    await authStore.register(payload)
    
    // Redirect to dashboard after successful registration
    router.push({ name: 'Dashboard' })
    
  } catch (error) {
    // Error is handled by the store
    console.error('Registration failed:', error)
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