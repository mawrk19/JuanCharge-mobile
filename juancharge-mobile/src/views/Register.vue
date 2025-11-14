<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="/logo.png" alt="JuanCharge Logo" class="logo" />
        <h1>JuanCharge</h1>
        <p>Powering every Juan</p>
      </div>

      <div class="login-form">
        <header class="login-form-header">Create Account</header>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="form.first_name" type="text" placeholder="Enter your first name" required :disabled="loading" />
          </div>

           <div class="form-group">
            <label>Last Name</label>
            <input v-model="form.last_name" type="text" placeholder="Enter your last name" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="Enter your email" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Contact No. <span class="optional-label">(Optional)</span></label>
            <input v-model="form.contact" type="number" placeholder="Enter your contact number" :disabled="loading" />
          </div>

          <div class="form-group">
            <div class="password-input-wrapper">
              <label>Password</label>
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Enter a password"
                required :disabled="loading">
              <button type="button" class="toggle-password" @click="showPassword = !showPassword" :disabled="loading">
                <span class="material-icons">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              </input>
            </div>
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <div class="password-input-wrapper">
              <input v-model="form.password_confirmation" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="Confirm password" 
              required
              :disabled="loading"
              >
                <button type="button" class="toggle-confirm-password" @click="showConfirmPassword = !showConfirmPassword" :disabled="loading">
                <span class="material-icons">
                  {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              </input>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="login-btn" :disabled="loading">{{ loading ? 'Registering...' : 'Register'
            }}</button>
        </form>

        <div class="register-link">
          Already have an account? <router-link to="/login">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/apiServices'

const router = useRouter()

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  contact: '',
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)


const loading = ref(false)
const error = ref(null)

const handleRegister = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await authService.register(form)

    if (response.data && response.data.success) {
      // Some backends return token/user on register
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token)
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      // If backend did NOT return token, attempt auto-login with provided credentials
      if (!response.data.token) {
        try {
          const loginResp = await authService.login({ email: form.email, password: form.password })
          if (loginResp.data?.success && loginResp.data.token) {
            localStorage.setItem('auth_token', loginResp.data.token)
            if (loginResp.data.user) localStorage.setItem('user', JSON.stringify(loginResp.data.user))
            if (loginResp.data.should_update_profile) {
              router.push('/settings')
            } else {
              router.push('/')
            }
            return
          }
        } catch (le) {
          // If auto-login fails, fall through to route to login
          console.warn('Auto-login after register failed:', le)
        }
      }

      // If backend asks to update profile after register
      if (response.data.should_update_profile) {
        router.push('/settings')
      } else {
        // If token exists we are logged in, otherwise route to login so user can sign in
        if (localStorage.getItem('auth_token')) {
          router.push('/')
        } else {
          router.push('/login')
        }
      }
    } else {
      // Try to show validation errors
      error.value = response.data?.message || 'Registration failed'
    }
  } catch (err) {
    console.error('Register error:', err)
    // Handle Laravel validation errors (errors object)
    const resp = err.response?.data
    if (resp) {
      if (resp.errors) {
        // join first error messages
        const first = Object.values(resp.errors).map(v => v[0]).join(' ')
        error.value = first
      } else {
        error.value = resp.message || 'Registration failed'
      }
    } else {
      error.value = 'Registration failed'
    }
  } finally {
    loading.value = false
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
  top: 71%;
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

.toggle-confirm-password {
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

.optional-label {
  font-size: 11px;
  font-style: italic;
  font-weight: 400;
  color: #999;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>