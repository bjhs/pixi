<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-card class="pa-8">
          <v-icon 
            size="120" 
            color="grey-lighten-2"
            class="mb-4"
          >
            mdi-file-question-outline
          </v-icon>
          
          <div class="text-h2 mb-2">404</div>
          <div class="text-h5 mb-4">Page Not Found</div>
          
          <p class="text-body-1 mb-6 text-grey">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div class="d-flex flex-column flex-sm-row gap-4 justify-center">
            <v-btn 
              color="primary" 
              size="large"
              @click="router.push({ name: 'Dashboard' })"
            >
              <v-icon class="mr-2">mdi-home</v-icon>
              Go to Dashboard
            </v-btn>
            
            <v-btn 
              variant="outlined"
              size="large" 
              @click="router.go(-1)"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Go Back
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.gap-4 {
  gap: 1rem;
}
</style>