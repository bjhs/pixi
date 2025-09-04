<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4 d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-history</v-icon>
              Session History
            </div>
            <v-btn 
              color="primary" 
              @click="router.push({ name: 'Dashboard' })"
              variant="outlined"
              size="small"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Dashboard
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <div v-if="isLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-4 text-body-2">Loading sessions...</p>
            </div>
            
            <div v-else-if="error" class="text-center py-8">
              <v-alert type="error" variant="outlined" class="mb-4">
                <v-icon class="mr-2">mdi-alert-circle</v-icon>
                {{ error }}
              </v-alert>
              <v-btn color="primary" @click="loadSessions" variant="outlined">
                <v-icon class="mr-2">mdi-refresh</v-icon>
                Retry
              </v-btn>
            </div>
            
            <div v-else-if="recentSessions.length === 0" class="text-center py-12">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-history</v-icon>
              <h3 class="text-h6 mb-2 text-grey-darken-1">No sessions found</h3>
              <p class="text-body-2 text-grey-darken-1 mb-4">
                Start your first work session to see it appear here.
              </p>
              <v-btn color="primary" @click="router.push({ name: 'Dashboard' })">
                <v-icon class="mr-2">mdi-play</v-icon>
                Start Session
              </v-btn>
            </div>
            
            <div v-else>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-body-1">
                  Showing {{ Math.min(recentSessions.length, 20) }} recent sessions
                </div>
                <v-btn 
                  @click="loadSessions" 
                  variant="text" 
                  size="small"
                  :loading="isLoading"
                >
                  <v-icon class="mr-2">mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>
              
              <v-row>
                <v-col 
                  v-for="session in recentSessions" 
                  :key="session.id"
                  cols="12"
                  md="6" 
                  lg="4"
                >
                  <v-card 
                    class="session-card"
                    elevation="2"
                    hover
                    @click="viewSessionDetails(session)"
                  >
                    <v-card-text>
                      <div class="d-flex align-center justify-space-between mb-2">
                        <div class="text-caption text-grey-darken-1">
                          {{ formatDate(session.createdAt) }}
                        </div>
                        <v-chip
                          :color="getStateColor(session.state)"
                          size="x-small"
                          variant="flat"
                        >
                          {{ session.state }}
                        </v-chip>
                      </div>
                      
                      <div class="d-flex align-center mb-3">
                        <v-icon class="mr-2" color="primary">mdi-timer</v-icon>
                        <span class="text-h6 font-weight-medium">
                          {{ formatDuration(session.totalDuration) }}
                        </span>
                      </div>
                      
                      <div v-if="session.goal" class="mb-3">
                        <div class="text-caption text-grey-darken-1 mb-1">Goal:</div>
                        <div class="text-body-2">{{ session.goal }}</div>
                      </div>
                      
                      <div v-if="session.reflection?.rating" class="d-flex align-center">
                        <div class="text-caption text-grey-darken-1 mr-2">Rating:</div>
                        <div class="d-flex">
                          <v-icon 
                            v-for="star in 5" 
                            :key="star"
                            :color="star <= session.reflection.rating ? 'yellow-darken-2' : 'grey-lighten-2'"
                            size="small"
                          >
                            mdi-star
                          </v-icon>
                        </div>
                      </div>
                      
                      <div v-if="session.reflection?.notes" class="mt-2">
                        <div class="text-caption text-grey-darken-1 mb-1">Notes:</div>
                        <div class="text-body-2 text-truncate">
                          {{ session.reflection.notes }}
                        </div>
                      </div>
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import type { Session } from '@/types'
import { SessionState } from '@/types'

const router = useRouter()
const sessionsStore = useSessionsStore()

// Store state
const recentSessions = computed(() => sessionsStore.recentSessions)
const isLoading = computed(() => sessionsStore.isLoading)
const error = computed(() => sessionsStore.error)

// Methods
const loadSessions = async () => {
  try {
    await sessionsStore.loadSessions()
  } catch (err) {
    console.error('Failed to load sessions:', err)
  }
}

const formatDate = (date: Date): string => {
  const sessionDate = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
  
  const diffTime = today.getTime() - sessionDateOnly.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return `Today, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays === 1) {
    return `Yesterday, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else if (diffDays < 7) {
    return `${diffDays} days ago, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return sessionDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const getStateColor = (state: string): string => {
  switch (state) {
    case SessionState.COMPLETED:
      return 'success'
    case SessionState.ACTIVE:
      return 'primary'
    case SessionState.PAUSED:
      return 'warning'
    default:
      return 'grey'
  }
}

const viewSessionDetails = (session: Session) => {
  router.push({ name: 'SessionDetail', params: { id: session.id } })
}

// Load sessions on component mount
onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.session-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.session-card:hover {
  transform: translateY(-2px);
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>