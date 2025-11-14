<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo/Header -->
      <div class="login-header">
        <img src="/logo.png" alt="JuanCharge Logo" class="logo" />
        <h1>JuanCharge</h1>
        <p>Powering every Juan</p>
      </div>

      <!-- Login Form -->
      <div class="login-form">
        <header class="login-form-header">Login</header>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email</label>
            <input v-model="credentials.email" type="email" placeholder="Enter your email" required
              :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="password-input-wrapper">
              <input v-model="credentials.password" :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password" required :disabled="loading">
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" :disabled="loading">
                <span class="material-icons">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              </input>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Login Button -->
          <button type="submit" class="login-btn" :disabled="loading">
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
          <router-link to="/register">Create Account</router-link>
        </div>
      </div>

      <!-- App Info -->
      <div class="app-version">
        <p>v1.0.0</p>
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
            <input v-model="forgotEmail" type="email" placeholder="Enter your email" required />
          </div>

          <div v-if="forgotError" class="error-message">
            {{ forgotError }}
          </div>

          <div v-if="forgotSuccess" class="success-message">
            {{ forgotSuccess }}
          </div>

          <div class="modal-actions">
            <button type="button" @click="showForgotPassword = false" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="submit-btn" :disabled="sendingReset">
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

//Toggle Password Visibility

const showPassword = ref(false)


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

  try {
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
    console.error('Login error:', err)

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
  height: 100vh;
  background: #FFFFFF;
  background: linear-gradient(20deg, rgba(255, 255, 255, 1) 45%, rgba(66, 184, 131, 1) 55%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-container {
  width: 100%;
  max-width: 400px;
  overflow-y: auto;
  max-height: 100vh;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 150px;
  height: 150px;
  margin: 0 auto 16px;
  display: block;
  /* animation: pulse 2s infinite; */
  object-fit: contain;
  background-color: #F8F8F8;
  border-radius: 16px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.login-header h1 {
  font-size: 36px;
  color: white;
  font-weight: 800;
}

.login-header p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.login-form-header {
  font-size: 24px;
  color: #333;
  font-weight: 800;
  text-align: center;
  margin-bottom: 12px;
}

.login-form {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(50, 50, 93, 0.25), 0 2px 4px rgba(0, 0, 0, 0.3);

}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  text-align: left;
  padding: 4px;
  font-size: 13px;
  color: #333;
  font-weight: 700;
  margin-bottom: 2px;
}

.form-group input {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  color: #333;
  font-size: 13px;
  font-weight: normal;
  transition: all 0.3s;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
}

.form-group input:focus {
  outline: none;
  border: 2px solid #6ec89f;
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

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper input {
  padding-right: 45px;
  /* Make space for the button */
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #333;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  outline: none;
}
</style>
