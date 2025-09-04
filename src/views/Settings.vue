<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon class="mr-2">mdi-cog</v-icon>
            Settings
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-4">
              Configure your Pixi preferences and settings.
            </p>
            
            <v-alert type="info" class="mb-4">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-information</v-icon>
                This view will contain user preferences, session settings, and application configuration.
              </div>
            </v-alert>
            
            <v-btn 
              color="primary" 
              @click="router.push({ name: 'Dashboard' })"
              class="mr-2"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Back to Dashboard
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>