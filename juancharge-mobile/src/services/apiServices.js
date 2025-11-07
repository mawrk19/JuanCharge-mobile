import api from './api'

// Auth API calls
export const authService = {
  login(credentials) {
    return api.post('/login', credentials)
  },
  register(userData) {
    return api.post('/register', userData)
  },
  logout() {
    return api.post('/logout')
  },
  getProfile() {
    return api.get('/profile')
  }
}

// Stations API calls
export const stationService = {
  getAll(params) {
    return api.get('/stations', { params })
  },
  getById(id) {
    return api.get(`/stations/${id}`)
  },
  getNearby(lat, lng, radius = 5) {
    return api.get('/stations/nearby', { 
      params: { lat, lng, radius } 
    })
  }
}

// Charging API calls
export const chargingService = {
  startSession(stationId, data) {
    return api.post(`/charging/start`, { station_id: stationId, ...data })
  },
  stopSession(sessionId) {
    return api.post(`/charging/stop`, { session_id: sessionId })
  },
  getActiveSession() {
    return api.get('/charging/active')
  },
  getHistory(params) {
    return api.get('/charging/history', { params })
  },
  scanQR(qrCode) {
    return api.post('/charging/scan', { qr_code: qrCode })
  }
}

// User API calls
export const userService = {
  getStats() {
    return api.get('/user/stats')
  },
  getAchievements() {
    return api.get('/user/achievements')
  },
  updateSettings(settings) {
    return api.put('/user/settings', settings)
  }
}

// Payments API calls
export const paymentService = {
  getMethods() {
    return api.get('/payment/methods')
  },
  addMethod(method) {
    return api.post('/payment/methods', method)
  },
  processPayment(sessionId) {
    return api.post('/payment/process', { session_id: sessionId })
  }
}
