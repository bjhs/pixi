<template>
  <v-card>
    <v-card-title>
      <v-icon class="mr-2">mdi-application</v-icon>
      PWA Status
    </v-card-title>
    
    <v-card-text>
      <v-list density="compact">
        <v-list-item>
          <template v-slot:prepend>
            <v-icon :color="isInstalled ? 'success' : 'warning'">
              {{ isInstalled ? 'mdi-check-circle' : 'mdi-download' }}
            </v-icon>
          </template>
          <v-list-item-title>Installed</v-list-item-title>
          <v-list-item-subtitle>
            {{ isInstalled ? 'App is installed' : 'App is not installed' }}
          </v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item>
          <template v-slot:prepend>
            <v-icon :color="isOnline ? 'success' : 'error'">
              {{ isOnline ? 'mdi-wifi' : 'mdi-wifi-off' }}
            </v-icon>
          </template>
          <v-list-item-title>Network Status</v-list-item-title>
          <v-list-item-subtitle>
            {{ isOnline ? 'Online' : 'Offline' }}
          </v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item>
          <template v-slot:prepend>
            <v-icon :color="capabilities.canNotify ? 'success' : 'warning'">
              {{ capabilities.canNotify ? 'mdi-bell' : 'mdi-bell-off' }}
            </v-icon>
          </template>
          <v-list-item-title>Notifications</v-list-item-title>
          <v-list-item-subtitle>
            {{ capabilities.canNotify ? 'Enabled' : 'Disabled' }}
          </v-list-item-subtitle>
          <template v-slot:append v-if="!capabilities.canNotify">
            <v-btn 
              size="small" 
              variant="outlined"
              @click="requestNotifications"
            >
              Enable
            </v-btn>
          </template>
        </v-list-item>
        
        <v-list-item>
          <template v-slot:prepend>
            <v-icon color="info">mdi-monitor</v-icon>
          </template>
          <v-list-item-title>Display Mode</v-list-item-title>
          <v-list-item-subtitle>
            {{ capabilities.displayMode }}
          </v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item v-if="storageQuota">
          <template v-slot:prepend>
            <v-icon color="info">mdi-database</v-icon>
          </template>
          <v-list-item-title>Storage</v-list-item-title>
          <v-list-item-subtitle>
            {{ formatBytes(storageQuota.usage) }} / {{ formatBytes(storageQuota.quota) }} used
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      
      <v-divider class="my-4" />
      
      <div class="d-flex flex-wrap gap-2">
        <v-btn 
          v-if="capabilities.canInstall"
          color="primary"
          variant="elevated"
          @click="installPwa"
          size="small"
        >
          <v-icon class="mr-2">mdi-download</v-icon>
          Install App
        </v-btn>
        
        <v-btn 
          v-if="capabilities.canUpdate"
          color="warning"
          variant="elevated"
          @click="updatePwa"
          size="small"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Update App
        </v-btn>
        
        <v-btn 
          variant="outlined"
          size="small"
          @click="refreshQuota"
        >
          <v-icon class="mr-2">mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { usePwa } from '@/composables/usePwa'

const { 
  isInstalled, 
  isOnline, 
  storageQuota, 
  capabilities,
  installPwa,
  updatePwa,
  requestNotificationPermission,
  getStorageQuota
} = usePwa()

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const requestNotifications = async () => {
  await requestNotificationPermission()
}

const refreshQuota = () => {
  getStorageQuota()
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>