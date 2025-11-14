import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'
import ScanQR from '../views/ScanQR.vue'
import Achievements from '../views/Achievements.vue'
import Settings from '../views/Settings.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Splash from '../views/Splash.vue'
import { secureStorage } from '../services/secureStorage'

const routes = [
  {
    path: '/',
    name: 'Splash',
    component: Splash,
    meta: { title: 'Loading...' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'Register', requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { title: 'Home', requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: Map,
    meta: { title: 'Map', requiresAuth: true }
  },
  {
    path: '/scan',
    name: 'Scan',
    component: ScanQR,
    meta: { title: 'Scan QR', requiresAuth: true }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: Achievements,
    meta: { title: 'Achievements', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: 'Settings', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication using secure storage
router.beforeEach(async (to, from, next) => {
  // Allow access to splash screen without checks
  if (to.path === '/') {
    next()
    return
  }

  const apiToken = await secureStorage.getApiToken()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !apiToken) {
    next('/login')
  }
  // Check if route requires guest (already logged in users shouldn't access)
  else if (to.meta.requiresGuest && apiToken) {
    next('/home')
  }
  else {
    next()
  }
})

export default router
