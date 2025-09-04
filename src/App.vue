<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useSessionsStore } from '@/stores'
import { SessionState } from '@/types'
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'
import PwaInstallPrompt from '@/components/PwaInstallPrompt.vue'
import OfflineIndicator from '@/components/OfflineIndicator.vue'

const router = useRouter()
const authStore = useAuthStore()
const sessionsStore = useSessionsStore()

// Navigation state
const drawer = ref(false)

// Navigation items
const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', route: 'Dashboard' },
  { title: 'Sessions', icon: 'mdi-history', route: 'Sessions' },
  { title: 'Settings', icon: 'mdi-cog', route: 'Settings' },
  { title: 'Profile', icon: 'mdi-account', route: 'Profile' }
]

// Helper functions
const getSessionStateColor = (state: string | undefined) => {
  switch (state) {
    case SessionState.ACTIVE: return 'success'
    case SessionState.PAUSED: return 'warning'
    case SessionState.COMPLETED: return 'primary'
    default: return 'grey'
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}

// Initialize app
onMounted(async () => {
  await authStore.initializeAuth()
  if (authStore.isAuthenticated) {
    await sessionsStore.loadSessions()
  }
})
</script>

<template>
  <v-app>
    <!-- Navigation drawer -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      temporary
    >
      <v-list>
        <v-list-item 
          prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
          :title="authStore.userDisplayName"
          :subtitle="authStore.user?.email || ''"
        />
      </v-list>
      
      <v-divider />
      
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="{ name: item.route }"
          color="primary"
        />
      </v-list>
      
      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            color="error"
            variant="outlined"
            @click="handleLogout"
          >
            <v-icon class="mr-2">mdi-logout</v-icon>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar>
      <v-app-bar-nav-icon
        v-if="authStore.isAuthenticated"
        @click="drawer = !drawer"
      />
      
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-timer-sand</v-icon>
        Pixi
      </v-app-bar-title>
      
      <v-spacer />
      
      <template v-if="authStore.isAuthenticated">
        <!-- Current session indicator -->
        <v-chip
          v-if="sessionsStore.hasActiveSession"
          :color="getSessionStateColor(sessionsStore.currentSession?.state)"
          class="mr-4"
        >
          <v-icon class="mr-1" size="small">mdi-clock</v-icon>
          {{ sessionsStore.formattedSessionTime.formatted }}
        </v-chip>
        
        <!-- User menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="32">
                {{ authStore.userInitials }}
              </v-avatar>
            </v-btn>
          </template>
          
          <v-list>
            <v-list-item
              prepend-icon="mdi-account"
              title="Profile"
              @click="router.push({ name: 'Profile' })"
            />
            <v-list-item
              prepend-icon="mdi-cog"
              title="Settings"
              @click="router.push({ name: 'Settings' })"
            />
            <v-divider />
            <v-list-item
              prepend-icon="mdi-logout"
              title="Logout"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </template>
      
      <template v-else>
        <v-btn
          color="primary"
          variant="outlined"
          @click="router.push({ name: 'Login' })"
        >
          Login
        </v-btn>
      </template>
    </v-app-bar>
    
    <!-- Main content -->
    <v-main>
      <OfflineIndicator />
      <router-view />
    </v-main>
    
    <!-- PWA Components -->
    <PwaUpdatePrompt />
    <PwaInstallPrompt />
  </v-app>
</template>

<style scoped>
/* Component-specific styles will be added here */
</style>
