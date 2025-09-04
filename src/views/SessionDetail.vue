<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">
            <v-icon class="mr-2">mdi-clipboard-text</v-icon>
            Session Details
          </v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-4">
              Session ID: {{ route.params['id'] }}
            </p>
            
            <v-alert type="info" class="mb-4">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-information</v-icon>
                This view will display detailed information about a specific session.
              </div>
            </v-alert>
            
            <v-btn 
              color="primary" 
              @click="router.push({ name: 'Sessions' })"
              class="mr-2"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Back to Sessions
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
</script>