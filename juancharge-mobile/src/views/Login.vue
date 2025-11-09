<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo/Header -->
      <div class="login-header">
        <div class="logo">⚡</div>
        <h1>JuanCharge</h1>
        <p>Power your device, earn rewards</p>
      </div>

      <!-- Login Form -->
      <div class="login-form">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="credentials.email" 
              type="email" 
              placeholder="Enter your email"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input 
              v-model="credentials.password" 
              type="password" 
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Login Button -->
          <button 
            type="submit" 
            class="login-btn"
            :disabled="loading"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Forgot Password Link -->
        <div class="forgot-password">
          <a href="#" @click.prevent="showForgotPassword = true">
            Forgot Password?
          </a>
        </div>

        <!-- Register Link -->
        <div class="register-link">
          Don't have an account? 
          <router-link to="/register">Register</router-link>
        </div>
      </div>

      <!-- App Info -->
      <div class="app-version">
        <p>v1.0.0</p>
      </div>
      <!-- Debug panel (visible when debugging in emulator) -->
      <div v-if="debugEnabled" class="debug-panel">
        <div class="debug-header">
          <h4>Debug Output</h4>
          <div class="debug-actions">
            <button @click="copyDebug" class="debug-btn">Copy</button>
            <button @click="clearDebug" class="debug-btn">Clear</button>
          </div>
        </div>
        <pre class="debug-log">{{ debugMessages.join('\n') }}</pre>
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPassword" class="modal-overlay" @click="showForgotPassword = false">
      <div class="modal-content" @click.stop>
        <h3>Reset Password</h3>
        <p class="modal-description">
          Enter your email address and we'll send you a password reset link.
        </p>
        
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="forgotEmail" 
              type="email" 
              placeholder="Enter your email"
              required
            />
          </div>

          <div v-if="forgotError" class="error-message">
            {{ forgotError }}
          </div>

          <div v-if="forgotSuccess" class="success-message">
            {{ forgotSuccess }}
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              @click="showForgotPassword = false" 
              class="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="sendingReset"
            >
              {{ sendingReset ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/apiServices'
import api from '@/services/api'
import { secureStorage } from '@/services/secureStorage'

const router = useRouter()

const credentials = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)
// Debug UI - enable for troubleshooting
const debugEnabled = ref(true)
const debugMessages = ref([])
function pushDebug(msg) {
  try {
    debugMessages.value.unshift(new Date().toISOString() + ' - ' + String(msg))
    // keep latest 50
    if (debugMessages.value.length > 50) debugMessages.value.length = 50
  } catch (e) { /* ignore */ }
}

// Copy debug to clipboard
async function copyDebug() {
  const txt = debugMessages.value.join('\n')
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(txt)
      alert('Debug copied to clipboard')
      return
    }
  } catch (e) {
    // fallthrough to textarea fallback
  }
  // Fallback
  try {
    const ta = document.createElement('textarea')
    ta.value = txt
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('Debug copied to clipboard')
  } catch (e) {
    alert('Unable to copy debug output')
  }
}

function clearDebug() {
  debugMessages.value = []
}

// Forgot password
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotError = ref(null)
const forgotSuccess = ref(null)
const sendingReset = ref(false)

// Handle login - Mobile auth with persistent login
const handleLogin = async () => {
  loading.value = true
  error.value = null

  // Prepare request values so they're available in catch/fallback
  const authBody = { email: credentials.value.email, password: credentials.value.password }
  const base = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'undefined'
  const authUrl = base.replace(/\/$/, '') + '/mobile/auth/login'

  try {
    // Debug logs: show computed base URL, origin and request body
    console.log('DEBUG: AUTH_URL ->', authUrl)
    pushDebug('AUTH_URL -> ' + authUrl)
    console.log('DEBUG: location.origin ->', typeof location !== 'undefined' ? location.origin : 'no-location')
    pushDebug('location.origin -> ' + (typeof location !== 'undefined' ? location.origin : 'no-location'))
    console.log('DEBUG: LOGIN REQUEST BODY ->', authBody)
    pushDebug('LOGIN REQUEST BODY -> ' + JSON.stringify(authBody))

    // Primary request using Axios (app uses authService.login)
    const response = await authService.login(credentials.value)
    
    if (response.data.success) {
      // Store tokens securely using Capacitor Preferences
      await secureStorage.setDeviceToken(response.data.device_token)
      await secureStorage.setApiToken(response.data.api_token)
      await secureStorage.setUserData(response.data.user)
      await secureStorage.setTokenExpiresAt(response.data.token_expires_at)
      
      console.log('✅ Login successful - tokens stored securely')
      
      // Check if profile update is needed
      if (response.data.should_update_profile) {
        alert(response.data.prompt_message || 'Please complete your profile.')
        router.push('/settings')
      } else {
        // Navigate to home
        router.push('/home')
      }
    } else {
      error.value = response.data.message || 'Login failed'
    }
  } catch (err) {
    // Log detailed error information
    console.error('Login error (axios):', err)
    pushDebug('ERROR: ' + (err.message || String(err)))
    
    try {
      console.log('Axios error response:', err.response)
      if (err.response) {
        pushDebug('Error status: ' + err.response.status)
        pushDebug('Error data: ' + JSON.stringify(err.response.data))
      }
      if (err.response && err.response.data) console.log('Axios response data:', err.response.data)
    } catch (e) {
      console.warn('Could not read axios error response')
      pushDebug('Could not read error response')
    }

    // Try a direct fetch as a comparison to see raw server response
    try {
      console.log('DEBUG: Attempting fetch() fallback to compare behavior')
      pushDebug('Attempting fetch fallback to ' + authUrl)
      const fetchRes = await fetch(authUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(authBody)
      })
      console.log('DEBUG: fetch status', fetchRes.status)
      pushDebug('fetch status -> ' + fetchRes.status)
      const text = await fetchRes.text()
      console.log('DEBUG: fetch body', text)
      pushDebug('fetch body -> ' + text.substring(0, 500))
    } catch (fe) {
      console.error('Fetch fallback error:', fe)
      pushDebug('Fetch error: ' + (fe.message || String(fe)))
    }

    // If the server responded with a 429 Too Many Attempts, give a clearer message
    if (err?.response?.status === 429) {
      const retryAfter = err.response.headers?.['retry-after'] || err.response.headers?.['Retry-After']
      error.value = retryAfter ? `Too many attempts. Try again in ${retryAfter} seconds.` : 'Too many attempts. Please wait and try again.'
    } else {
      error.value = err.response?.data?.message || err.message || 'Network error. Check connection.'
    }
  } finally {
    loading.value = false
  }
}

// Handle forgot password
const handleForgotPassword = async () => {
  forgotError.value = null
  forgotSuccess.value = null
  sendingReset.value = true

  try {
    const response = await authService.forgotPassword({ email: forgotEmail.value })
    
    if (response.data.success) {
      forgotSuccess.value = response.data.message
      forgotEmail.value = ''
      
      // Close modal after 3 seconds
      setTimeout(() => {
        showForgotPassword.value = false
        forgotSuccess.value = null
      }, 3000)
    } else {
      forgotError.value = response.data.message
    }
  } catch (err) {
    console.error('Forgot password error:', err)
    forgotError.value = err.response?.data?.message || 'Failed to send reset link'
  } finally {
    sendingReset.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  font-size: 80px;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.login-header h1 {
  font-size: 36px;
  color: white;
  margin-bottom: 8px;
  font-weight: 800;
}

.login-header p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.login-form {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.debug-panel {
  margin-top: 12px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  padding: 8px;
  border-radius: 8px;
}
.debug-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:8px;
}
.debug-actions { display:flex; gap:8px }
.debug-btn {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: none;
  padding: 6px 8px;
  border-radius: 6px;
}
.debug-log {
  max-height: 220px;
  overflow: auto;
  white-space: pre-wrap;
  font-size: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
  transition: all 0.3s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.forgot-password {
  text-align: center;
  margin-top: 16px;
}

.forgot-password a {
  color: #42b883;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.register-link a {
  color: #42b883;
  text-decoration: none;
  font-weight: 800;
}

.app-version {
  text-align: center;
  margin-top: 24px;
}

.app-version p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
}

.modal-content h3 {
  font-size: 20px;
  color: #333;
  font-weight: 800;
  margin-bottom: 12px;
}

.modal-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn {
  padding: 12px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
