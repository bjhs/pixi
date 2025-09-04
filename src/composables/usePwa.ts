import { ref, computed, onMounted } from 'vue'

export interface PWAInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export function usePwa() {
  const isInstalled = ref(false)
  const isInstallable = ref(false)
  const isOnline = ref(navigator.onLine)
  const installPromptEvent = ref<PWAInstallPromptEvent | null>(null)

  // Check if app is running as installed PWA
  const checkIfInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://')
  }

  // Check if device/browser supports PWA installation
  const checkIfInstallable = () => {
    // Basic check for PWA support
    return 'serviceWorker' in navigator && 
           'PushManager' in window &&
           'Notification' in window
  }

  // Install the PWA
  const installPwa = async (): Promise<boolean> => {
    if (!installPromptEvent.value) {
      return false
    }

    try {
      await installPromptEvent.value.prompt()
      const choiceResult = await installPromptEvent.value.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA installation')
        installPromptEvent.value = null
        return true
      } else {
        console.log('User dismissed PWA installation')
        return false
      }
    } catch (error) {
      console.error('Error installing PWA:', error)
      return false
    }
  }

  // Get PWA display mode
  const getDisplayMode = (): string => {
    if (checkIfInstalled()) {
      return 'standalone'
    }
    
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen'
    }
    
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui'
    }
    
    return 'browser'
  }

  // Check if PWA can be updated
  const canUpdate = ref(false)
  const updateAvailable = ref(false)

  // Update PWA (handled by the PWA plugin)
  const updatePwa = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration?.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        return true
      }
    }
    return false
  }

  // Enable/disable notifications
  const notificationPermission = ref<NotificationPermission>('default')
  
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    return permission === 'granted'
  }

  // Show notification
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        ...options
      })
    }
    return null
  }

  // PWA capabilities check
  const capabilities = computed(() => ({
    canInstall: isInstallable.value && !isInstalled.value,
    canUpdate: canUpdate.value,
    canNotify: notificationPermission.value === 'granted',
    isOnline: isOnline.value,
    displayMode: getDisplayMode()
  }))

  // Storage quota information
  const storageQuota = ref<{
    usage: number
    quota: number
    usageDetails?: any
  } | null>(null)

  const getStorageQuota = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        storageQuota.value = {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          usageDetails: (estimate as any).usageDetails
        }
      } catch (error) {
        console.error('Error getting storage quota:', error)
      }
    }
  }

  // Setup event listeners
  onMounted(() => {
    isInstalled.value = checkIfInstalled()
    isInstallable.value = checkIfInstallable()
    notificationPermission.value = Notification?.permission || 'default'

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      installPromptEvent.value = e as PWAInstallPromptEvent
      isInstallable.value = true
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      isInstalled.value = true
      installPromptEvent.value = null
    })

    // Listen for online/offline status
    window.addEventListener('online', () => {
      isOnline.value = true
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    // Get storage quota
    getStorageQuota()

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated')
        updateAvailable.value = true
      })
    }
  })

  return {
    // State
    isInstalled,
    isInstallable,
    isOnline,
    canUpdate,
    updateAvailable,
    notificationPermission,
    storageQuota,
    capabilities,

    // Methods  
    installPwa,
    updatePwa,
    requestNotificationPermission,
    showNotification,
    getStorageQuota,
    getDisplayMode
  }
}