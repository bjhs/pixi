import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

// Define routes with proper typing
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: 'Login',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: 'Register',
      requiresAuth: false
    }
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('@/views/Sessions.vue'),
    meta: {
      title: 'Sessions',
      requiresAuth: true
    }
  },
  {
    path: '/session/:id',
    name: 'SessionDetail',
    component: () => import('@/views/SessionDetail.vue'),
    meta: {
      title: 'Session Details',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: 'Profile',
      requiresAuth: true
    }
  },
  // Catch-all route for 404 errors
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Page Not Found',
      requiresAuth: false
    }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // Always scroll to top on route change, unless returning to saved position
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Pixi`
  } else {
    document.title = 'Pixi - Work Session Companion'
  }
  
  // Check authentication requirements
  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth but user is not authenticated
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else if (!requiresAuth && isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    // Redirect authenticated users away from auth pages
    next({ name: 'Dashboard' })
  } else {
    // Allow navigation
    next()
  }
})

router.afterEach(() => {
  // Log navigation for debugging (remove in production)
  if (import.meta.env.DEV) {
    console.log('Navigation completed')
  }
})

export default router