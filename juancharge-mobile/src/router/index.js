import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'
import ScanQR from '../views/ScanQR.vue'
import Achievements from '../views/Achievements.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Home' }
  },
  {
    path: '/map',
    name: 'Map',
    component: Map,
    meta: { title: 'Map' }
  },
  {
    path: '/scan',
    name: 'Scan',
    component: ScanQR,
    meta: { title: 'Scan QR' }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: Achievements,
    meta: { title: 'Achievements' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { title: 'Settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
