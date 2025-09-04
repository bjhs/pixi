<template>
  <v-alert
    v-if="!isOnline"
    type="warning"
    icon="mdi-wifi-off"
    prominent
    border="start"
    class="offline-alert"
  >
    <v-alert-title>You're offline</v-alert-title>
    <div>
      Some features may not be available. Your data will sync when you're back online.
    </div>
  </v-alert>
</template>

<script setup lang="ts">
import { usePwa } from '@/composables/usePwa'

const { isOnline } = usePwa()
</script>

<style scoped>
.offline-alert {
  position: fixed;
  top: 64px; /* Below app bar */
  left: 0;
  right: 0;
  z-index: 1000;
  margin: 0;
  border-radius: 0;
}
</style>