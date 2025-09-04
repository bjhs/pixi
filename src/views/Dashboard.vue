<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon class="mr-2">mdi-view-dashboard</v-icon>
            Dashboard
          </v-card-title>
          <v-card-text>
            <v-alert 
              v-if="!authStore.isAuthenticated"
              type="warning"
              class="mb-4"
            >
              You are not authenticated. Please log in to access your dashboard.
            </v-alert>
            
            <div v-else>
              <p class="text-h6 mb-4">
                Welcome back, {{ authStore.userDisplayName }}!
              </p>
              
              <!-- Current Session Status -->
              <v-row class="mb-6">
                <v-col cols="12" md="6">
                  <v-card class="h-100">
                    <v-card-title>
                      <v-icon class="mr-2">mdi-clock-outline</v-icon>
                      Current Session
                    </v-card-title>
                    <v-card-text>
                      <div v-if="sessionsStore.hasActiveSession">
                        <div class="text-h3 mb-2">
                          {{ sessionsStore.formattedSessionTime.formatted }}
                        </div>
                        <v-chip 
                          :color="getSessionStateColor(sessionsStore.currentSession?.state)"
                          class="mb-2"
                        >
                          {{ sessionsStore.currentSession?.state }}
                        </v-chip>
                        <div v-if="sessionsStore.currentSession?.goal" class="text-body-2">
                          Goal: {{ sessionsStore.currentSession.goal }}
                        </div>
                      </div>
                      <div v-else class="text-center py-4">
                        <v-icon size="64" class="mb-2 text-grey">mdi-timer-off</v-icon>
                        <div class="text-h6">No active session</div>
                        <div class="text-body-2 text-grey">Start a new session to begin tracking your work</div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card class="h-100">
                    <v-card-title>
                      <v-icon class="mr-2">mdi-chart-line</v-icon>
                      Quick Stats
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="6">
                          <div class="text-center">
                            <div class="text-h4">{{ sessionsStore.sessionStats.totalSessions }}</div>
                            <div class="text-body-2">Total Sessions</div>
                          </div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-center">
                            <div class="text-h4">{{ formatDuration(sessionsStore.sessionStats.totalTime) }}</div>
                            <div class="text-body-2">Total Time</div>
                          </div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-center">
                            <div class="text-h4">{{ sessionsStore.sessionStats.weeklyStats.sessionsThisWeek }}</div>
                            <div class="text-body-2">This Week</div>
                          </div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-center">
                            <div class="text-h4">{{ formatDuration(sessionsStore.sessionStats.averageSessionTime) }}</div>
                            <div class="text-body-2">Average</div>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Quick Actions -->
              <v-row class="mb-6">
                <v-col cols="12">
                  <v-card>
                    <v-card-title>
                      <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                      Quick Actions
                    </v-card-title>
                    <v-card-text>
                      <v-btn-toggle v-model="selectedQuickAction" class="mb-4">
                        <v-btn value="sessions">
                          <v-icon class="mr-2">mdi-history</v-icon>
                          View Sessions
                        </v-btn>
                        <v-btn value="settings">
                          <v-icon class="mr-2">mdi-cog</v-icon>
                          Settings
                        </v-btn>
                        <v-btn value="profile">
                          <v-icon class="mr-2">mdi-account</v-icon>
                          Profile
                        </v-btn>
                      </v-btn-toggle>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Recent Sessions -->
              <v-row v-if="sessionsStore.recentSessions.length > 0">
                <v-col cols="12">
                  <v-card>
                    <v-card-title>
                      <v-icon class="mr-2">mdi-history</v-icon>
                      Recent Sessions
                    </v-card-title>
                    <v-card-text>
                      <v-list>
                        <v-list-item
                          v-for="session in sessionsStore.recentSessions.slice(0, 5)"
                          :key="session.id"
                          @click="navigateToSession(session.id)"
                        >
                          <v-list-item-title>
                            {{ session.goal || 'No goal specified' }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ formatDate(session.createdAt) }} • {{ formatDuration(session.totalDuration) }}
                          </v-list-item-subtitle>
                          <template v-slot:append>
                            <v-chip 
                              :color="getSessionStateColor(session.state)"
                              size="small"
                            >
                              {{ session.state }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                      <v-btn 
                        variant="text" 
                        @click="router.push({ name: 'Sessions' })"
                        class="mt-2"
                      >
                        View All Sessions
                        <v-icon class="ml-1">mdi-arrow-right</v-icon>
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useSessionsStore } from '@/stores'
import { SessionState } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const sessionsStore = useSessionsStore()

const selectedQuickAction = ref<string | null>(null)

// Watch for quick action changes
watch(selectedQuickAction, (newAction) => {
  if (newAction) {
    router.push({ name: newAction.charAt(0).toUpperCase() + newAction.slice(1) })
    selectedQuickAction.value = null
  }
})

// Helper functions
const getSessionStateColor = (state: string | undefined) => {
  switch (state) {
    case SessionState.ACTIVE: return 'success'
    case SessionState.PAUSED: return 'warning'
    case SessionState.COMPLETED: return 'primary'
    default: return 'grey'
  }
}

const formatDuration = (ms: number) => {
  if (ms === 0) return '0m'
  
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const navigateToSession = (sessionId: string) => {
  router.push({ name: 'SessionDetail', params: { id: sessionId } })
}
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>