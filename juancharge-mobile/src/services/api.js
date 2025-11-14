import axios from 'axios'
import { secureStorage } from './secureStorage'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor - Add auth token from secure storage
api.interceptors.request.use(
  async (config) => {
    // Get token from secure storage
    const token = await secureStorage.getApiToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear credentials and redirect to login
      console.warn('401 Unauthorized - session expired, redirecting to login')
      
      // Clear all stored credentials
      await secureStorage.clearAll()
      
      // Redirect to login if in browser context
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
