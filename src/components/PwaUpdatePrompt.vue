<template>
  <v-snackbar
    v-model="showUpdatePrompt"
    :timeout="-1"
    color="primary"
    multi-line
    location="bottom"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">mdi-download</v-icon>
      <div>
        <div class="font-weight-medium">App Update Available</div>
        <div class="text-body-2">A new version of Pixi is ready to install.</div>
      </div>
    </div>
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        size="small"
        @click="dismiss"
      >
        Later
      </v-btn>
      <v-btn
        variant="tonal"
        size="small"
        @click="updateApp"
        :loading="updating"
      >
        Update
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-ignore - virtual module
import { useRegisterSW } from 'virtual:pwa-register/vue'

const showUpdatePrompt = ref(false)
const updating = ref(false)

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW({
  onRegistered(r: any) {
    console.log('SW Registered:', r)
  },
  onRegisterError(error: any) {
    console.error('SW registration error:', error)
  },
  onNeedRefresh() {
    showUpdatePrompt.value = true
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  }
})

const updateApp = async () => {
  updating.value = true
  try {
    await updateServiceWorker(true)
  } catch (error) {
    console.error('Failed to update app:', error)
  } finally {
    updating.value = false
    showUpdatePrompt.value = false
  }
}

const dismiss = () => {
  showUpdatePrompt.value = false
}

onMounted(() => {
  if (needRefresh.value) {
    showUpdatePrompt.value = true
  }
})
</script>