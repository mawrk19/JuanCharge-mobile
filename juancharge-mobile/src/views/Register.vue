<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo">⚡</div>
        <h1>Create Account</h1>
        <p>Join JuanCharge and start earning rewards</p>
      </div>

      <div class="login-form">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="form.name" type="text" placeholder="Enter your full name" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="Enter your email" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input v-model="form.password" type="password" placeholder="Enter a password" required :disabled="loading" />
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input v-model="form.password_confirmation" type="password" placeholder="Confirm password" required :disabled="loading" />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="login-btn" :disabled="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
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
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

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
/* Register uses the same styles as Login; keep this file minimal to avoid duplicate CSS in the build.
  The main styles are defined in Login.vue's <style> section and will apply here via global CSS scope. */
</style>
