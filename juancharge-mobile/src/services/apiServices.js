import api from './api'

// Auth API calls - Mobile endpoints with persistent login
export const authService = {
  // Mobile-specific auth endpoints (use these if backend has mobile auth implemented)
  login(credentials) {
    // Try mobile endpoint first, fallback handled by backend
    return api.post('/mobile/auth/login', credentials)
  },
  
  // Fallback: Regular auth endpoint (if mobile endpoints not deployed yet)
  loginLegacy(credentials) {
    return api.post('/auth/login', credentials)
  },
  
  autoLogin(deviceToken) {
    return api.post('/mobile/auth/auto-login', { device_token: deviceToken })
  },
  logout() {
    return api.post('/mobile/auth/logout')
  },
  refreshToken(deviceToken) {
    return api.post('/mobile/auth/refresh-token', { device_token: deviceToken })
  },
  
  // Legacy endpoints (keep for backwards compatibility)
  register(userData) {
    return api.post('/auth/register', userData)
  },
  me() {
    return api.get('/auth/me')
  },
  updateProfile(data) {
    return api.put('/auth/profile', data)
  },
  changePassword(data) {
    return api.post('/auth/change-password', data)
  },
  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },
  resetPassword(data) {
    return api.post('/auth/reset-password', data)
  }
}

// Dashboard API calls
export const dashboardService = {
  getStats() {
    return api.get('/patron/dashboard/stats')
  },
  getPointsBalance() {
    return api.get('/patron/points/balance')
  }
}

// Kiosks/Stations API calls
export const kioskService = {
  getAll(params) {
    return api.get('/kiosks', { params })
  },
  getById(id) {
    return api.get(`/kiosks/${id}`)
  }
}

// Charging API calls
export const chargingService = {
  getActiveSession() {
    return api.get('/charging/active')
  },
  redeemPoints(points, kioskId) {
    return api.post('/charging/redeem', { 
      points, 
      kiosk_id: kioskId 
    })
  },
  cancelSession(sessionId) {
    return api.post('/charging/cancel', { 
      session_id: sessionId 
    })
  },
  getHistory(params) {
    return api.get('/charging/history', { params })
  }
}

// Points API calls
export const pointsService = {
  getBalance() {
    return api.get('/patron/points/balance')
  },
  getTransactions(params) {
    return api.get('/patron/points/transactions', { params })
  }
}

