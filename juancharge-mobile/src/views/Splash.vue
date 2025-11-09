<template>
  <div class="splash-screen">
    <div class="splash-content">
      <div class="logo">⚡</div>
      <h1>JuanCharge</h1>
      <div class="loading-spinner"></div>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/apiServices'
import { secureStorage } from '@/services/secureStorage'

const router = useRouter()
const statusMessage = ref('Checking credentials...')

onMounted(async () => {
  await checkAutoLogin()
})

async function checkAutoLogin() {
  try {
    // Check if device token exists
    const deviceToken = await secureStorage.getDeviceToken()
    
    if (!deviceToken) {
      // No token stored, go to login
      statusMessage.value = 'No saved credentials'
      setTimeout(() => router.push('/login'), 500)
      return
    }

    // Check if token is expired
    const hasValidCredentials = await secureStorage.hasValidCredentials()
    if (!hasValidCredentials) {
      // Token expired, clear and go to login
      statusMessage.value = 'Session expired'
      await secureStorage.clearAll()
      setTimeout(() => router.push('/login'), 500)
      return
    }

    // Try auto-login
    statusMessage.value = 'Logging in...'
    const response = await authService.autoLogin(deviceToken)
    
    if (response.data.success) {
      // Update API token (refreshed by backend)
      await secureStorage.setApiToken(response.data.api_token)
      await secureStorage.setUserData(response.data.user)
      await secureStorage.setTokenExpiresAt(response.data.token_expires_at)
      
      console.log('✅ Auto-login successful')
      statusMessage.value = 'Welcome back!'
      
      // Check if profile update needed
      if (response.data.should_update_profile) {
        setTimeout(() => router.push('/settings'), 500)
      } else {
        setTimeout(() => router.push('/home'), 500)
      }
    } else if (response.data.requires_login) {
      // Token invalid, clear and go to login
      statusMessage.value = 'Please login again'
      await secureStorage.clearAll()
      setTimeout(() => router.push('/login'), 500)
    }
  } catch (error) {
    console.error('Auto-login error:', error)
    // On network error or other issues, clear storage and go to login
    statusMessage.value = 'Connection error'
    await secureStorage.clearAll()
    setTimeout(() => router.push('/login'), 1500)
  }
}
</script>

<style scoped>
.splash-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  text-align: center;
  color: white;
}

.logo {
  font-size: 100px;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  font-size: 16px;
  opacity: 0.9;
}
</style>
