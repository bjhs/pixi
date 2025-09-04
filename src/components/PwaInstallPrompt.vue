<template>
  <v-dialog
    v-model="showInstallPrompt" 
    max-width="400"
    persistent
  >
    <v-card>
      <v-card-title class="text-h5">
        <v-icon class="mr-2" color="primary">mdi-download</v-icon>
        Install Pixi App
      </v-card-title>
      
      <v-card-text>
        <p class="mb-4">
          Install Pixi as an app on your device for quick access and offline functionality.
        </p>
        
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-lightning-bolt">
            <v-list-item-title>Faster loading</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-wifi-off">
            <v-list-item-title>Works offline</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-bell">
            <v-list-item-title>Native notifications</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-fullscreen">
            <v-list-item-title>Full screen experience</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
      
      <v-card-actions>
        <v-btn 
          variant="text"
          @click="dismiss"
        >
          Not Now
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="elevated"
          @click="installApp"
          :loading="installing"
        >
          Install
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Banner for supported browsers without dialog -->
  <v-banner
    v-if="showBanner && !showInstallPrompt"
    color="primary"
    icon="mdi-download"
    lines="two"
    sticky
  >
    <v-banner-text>
      <strong>Install Pixi App</strong><br>
      Get the full app experience with offline support
    </v-banner-text>
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="dismissBanner"
      >
        Dismiss
      </v-btn>
      <v-btn
        variant="tonal"
        @click="showInstallDialog"
      >
        Install
      </v-btn>
    </template>
  </v-banner>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const showInstallPrompt = ref(false)
const showBanner = ref(false)
const installing = ref(false)
const deferredPrompt = ref<any>(null)

// Check if app is already installed
const isStandalone = ref(false)

const checkInstallability = () => {
  // Check if app is running in standalone mode (already installed)
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true

  // Don't show prompts if already installed
  if (isStandalone.value) {
    return
  }

  // Check if PWA install prompt was already dismissed
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) {
    return
  }

  // Show banner after a delay if beforeinstallprompt hasn't fired
  setTimeout(() => {
    if (!deferredPrompt.value && !isStandalone.value) {
      showBanner.value = true
    }
  }, 30000) // 30 seconds delay
}

const handleBeforeInstallPrompt = (e: Event) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault()
  // Stash the event so it can be triggered later
  deferredPrompt.value = e
  // Show our custom install prompt
  showInstallPrompt.value = true
}

const installApp = async () => {
  if (!deferredPrompt.value) {
    // Fallback for browsers that don't support the install prompt
    showInstructionsBasedOnBrowser()
    return
  }

  installing.value = true
  
  try {
    // Show the install prompt
    deferredPrompt.value.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }
    
    // Clear the deferredPrompt for next time
    deferredPrompt.value = null
    showInstallPrompt.value = false
    
  } catch (error) {
    console.error('Error during installation:', error)
  } finally {
    installing.value = false
  }
}

const showInstructionsBasedOnBrowser = () => {
  // Show browser-specific instructions
  const userAgent = navigator.userAgent.toLowerCase()
  let instructions = ''
  
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    instructions = 'Tap the Share button and then "Add to Home Screen"'
  } else if (userAgent.includes('chrome')) {
    instructions = 'Tap the menu button (⋮) and then "Add to Home Screen"'
  } else if (userAgent.includes('firefox')) {
    instructions = 'Tap the menu button and then "Install"'
  } else {
    instructions = 'Look for an "Add to Home Screen" or "Install" option in your browser menu'
  }
  
  // You could show this in a separate dialog or alert
  alert(`To install Pixi:\n${instructions}`)
  showInstallPrompt.value = false
}

const dismiss = () => {
  showInstallPrompt.value = false
  // Remember dismissal for 7 days
  const dismissUntil = new Date()
  dismissUntil.setDate(dismissUntil.getDate() + 7)
  localStorage.setItem('pwa-install-dismissed', dismissUntil.toISOString())
}

const dismissBanner = () => {
  showBanner.value = false
  // Remember dismissal for 7 days
  const dismissUntil = new Date()
  dismissUntil.setDate(dismissUntil.getDate() + 7)
  localStorage.setItem('pwa-install-dismissed', dismissUntil.toISOString())
}

const showInstallDialog = () => {
  showBanner.value = false
  showInstallPrompt.value = true
}

onMounted(() => {
  checkInstallability()
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showInstallPrompt.value = false
    showBanner.value = false
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<style scoped>
.v-banner {
  z-index: 1000;
}
</style>