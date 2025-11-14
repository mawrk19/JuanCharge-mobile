import { Preferences } from '@capacitor/preferences'

/**
 * Secure Storage Service using Capacitor Preferences
 * Uses platform-native secure storage (iOS Keychain, Android Keystore)
 */
export const secureStorage = {
  // Token storage keys
  DEVICE_TOKEN: 'device_token',
  API_TOKEN: 'api_token',
  USER_DATA: 'user_data',
  TOKEN_EXPIRES_AT: 'token_expires_at',

  /**
   * Store device token (for persistent login)
   */
  async setDeviceToken(token) {
    await Preferences.set({
      key: this.DEVICE_TOKEN,
      value: token
    })
  },

  /**
   * Get device token
   */
  async getDeviceToken() {
    const { value } = await Preferences.get({ key: this.DEVICE_TOKEN })
    return value
  },

  /**
   * Store API token (for API requests)
   */
  async setApiToken(token) {
    await Preferences.set({
      key: this.API_TOKEN,
      value: token
    })
  },

  /**
   * Get API token
   */
  async getApiToken() {
    const { value } = await Preferences.get({ key: this.API_TOKEN })
    return value
  },

  /**
   * Store user data
   */
  async setUserData(userData) {
    await Preferences.set({
      key: this.USER_DATA,
      value: JSON.stringify(userData)
    })
  },

  /**
   * Get user data
   */
  async getUserData() {
    const { value } = await Preferences.get({ key: this.USER_DATA })
    return value ? JSON.parse(value) : null
  },

  /**
   * Store token expiration date
   */
  async setTokenExpiresAt(expiresAt) {
    await Preferences.set({
      key: this.TOKEN_EXPIRES_AT,
      value: expiresAt
    })
  },

  /**
   * Get token expiration date
   */
  async getTokenExpiresAt() {
    const { value } = await Preferences.get({ key: this.TOKEN_EXPIRES_AT })
    return value
  },

  /**
   * Clear all auth data (logout)
   */
  async clearAll() {
    await Preferences.remove({ key: this.DEVICE_TOKEN })
    await Preferences.remove({ key: this.API_TOKEN })
    await Preferences.remove({ key: this.USER_DATA })
    await Preferences.remove({ key: this.TOKEN_EXPIRES_AT })
  },

  /**
   * Check if user has valid stored credentials
   */
  async hasValidCredentials() {
    const deviceToken = await this.getDeviceToken()
    if (!deviceToken) return false

    const expiresAt = await this.getTokenExpiresAt()
    if (!expiresAt) return true // If no expiration stored, assume valid

    const expirationDate = new Date(expiresAt)
    const now = new Date()
    return expirationDate > now
  }
}

// Fallback for web browser (development)
if (typeof window !== 'undefined' && !window.Capacitor) {
  console.warn('Capacitor not detected - using localStorage fallback (NOT SECURE for production)')
  
  const localStorageFallback = {
    DEVICE_TOKEN: 'device_token',
    API_TOKEN: 'api_token',
    USER_DATA: 'user_data',
    TOKEN_EXPIRES_AT: 'token_expires_at',

    async setDeviceToken(token) {
      localStorage.setItem(this.DEVICE_TOKEN, token)
    },

    async getDeviceToken() {
      return localStorage.getItem(this.DEVICE_TOKEN)
    },

    async setApiToken(token) {
      localStorage.setItem(this.API_TOKEN, token)
    },

    async getApiToken() {
      return localStorage.getItem(this.API_TOKEN)
    },

    async setUserData(userData) {
      localStorage.setItem(this.USER_DATA, JSON.stringify(userData))
    },

    async getUserData() {
      const data = localStorage.getItem(this.USER_DATA)
      return data ? JSON.parse(data) : null
    },

    async setTokenExpiresAt(expiresAt) {
      localStorage.setItem(this.TOKEN_EXPIRES_AT, expiresAt)
    },

    async getTokenExpiresAt() {
      return localStorage.getItem(this.TOKEN_EXPIRES_AT)
    },

    async clearAll() {
      localStorage.removeItem(this.DEVICE_TOKEN)
      localStorage.removeItem(this.API_TOKEN)
      localStorage.removeItem(this.USER_DATA)
      localStorage.removeItem(this.TOKEN_EXPIRES_AT)
    },

    async hasValidCredentials() {
      const deviceToken = localStorage.getItem(this.DEVICE_TOKEN)
      if (!deviceToken) return false

      const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_AT)
      if (!expiresAt) return true

      const expirationDate = new Date(expiresAt)
      const now = new Date()
      return expirationDate > now
    }
  }

  Object.assign(secureStorage, localStorageFallback)
}
