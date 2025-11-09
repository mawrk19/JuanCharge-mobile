<template>
  <div class="scan-page">
    <div class="page-header">
      <h1>⚡ Redeem Points</h1>
      <p>{{ selectedKiosk ? selectedKiosk.kiosk_code : 'Select a station to charge' }}</p>
    </div>

    <!-- No Kiosk Selected -->
    <div v-if="!selectedKiosk" class="no-kiosk">
      <div class="icon">📍</div>
      <p>No charging station selected</p>
      <button @click="$router.push('/map')" class="select-btn">
        Select Station
      </button>
    </div>

    <!-- Active Session Already Exists -->
    <div v-else-if="activeSession" class="active-session-alert">
      <div class="alert-icon">⚡</div>
      <h3>You have an active session</h3>
      <p>Complete or cancel your current session first</p>
      <div class="session-details">
        <p><strong>Station:</strong> {{ activeSession.kiosk.kiosk_code }}</p>
        <p><strong>Remaining:</strong> {{ getRemainingTime() }} minutes</p>
      </div>
      <button @click="cancelCurrentSession" class="cancel-btn" :disabled="cancelling">
        {{ cancelling ? 'Cancelling...' : 'Cancel Session' }}
      </button>
      <button @click="$router.push('/')" class="back-btn">Go to Home</button>
    </div>

    <!-- Redeem Points Form -->
    <div v-else class="redeem-container">
      <!-- Points Balance -->
      <div class="balance-card">
        <div class="balance-label">Available Points</div>
        <div class="balance-value">{{ pointsBalance }}</div>
      </div>

      <!-- Points Input -->
      <div class="input-section">
        <label>Points to Redeem</label>
        <input 
          type="number" 
          v-model.number="pointsToRedeem" 
          :min="MIN_POINTS"
          :max="Math.min(MAX_POINTS, pointsBalance)"
          placeholder="Enter points"
          class="points-input"
        />
        <div class="range-hint">
          Min: {{ MIN_POINTS }} • Max: {{ Math.min(MAX_POINTS, pointsBalance) }}
        </div>
      </div>

      <!-- Energy Preview -->
      <div v-if="pointsToRedeem >= MIN_POINTS" class="preview-card">
        <h3>⚡ Charging Preview</h3>
        <div class="preview-item">
          <span class="label">Duration:</span>
          <span class="value">{{ pointsToRedeem }} minutes</span>
        </div>
        <div class="preview-item">
          <span class="label">Energy:</span>
          <span class="value">{{ formatEnergy(calculateEnergy(pointsToRedeem)) }}</span>
        </div>
        <div class="preview-item">
          <span class="label">Station:</span>
          <span class="value">{{ selectedKiosk.kiosk_code }}</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Redeem Button -->
      <button 
        @click="redeemPoints" 
        class="redeem-btn"
        :disabled="!canRedeem || redeeming"
      >
        {{ redeeming ? 'Starting Session...' : 'Start Charging' }}
      </button>

      <!-- Quick Select Buttons -->
      <div class="quick-select">
        <button 
          v-for="preset in presetPoints" 
          :key="preset"
          @click="pointsToRedeem = preset"
          class="preset-btn"
          :disabled="preset > pointsBalance"
        >
          {{ preset }} pts
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { chargingService, pointsService } from '@/services/apiServices'
import { 
  API_CONSTANTS, 
  calculateEnergy, 
  formatEnergy 
} from '@/services/apiConstants'

const router = useRouter()

const MIN_POINTS = API_CONSTANTS.MIN_POINTS_PER_SESSION
const MAX_POINTS = API_CONSTANTS.MAX_POINTS_PER_SESSION

const selectedKiosk = ref(null)
const pointsBalance = ref(0)
const pointsToRedeem = ref(MIN_POINTS)
const activeSession = ref(null)
const error = ref(null)
const redeeming = ref(false)
const cancelling = ref(false)

const presetPoints = [10, 30, 60, 120]

// Can redeem check
const canRedeem = computed(() => {
  return pointsToRedeem.value >= MIN_POINTS &&
         pointsToRedeem.value <= MAX_POINTS &&
         pointsToRedeem.value <= pointsBalance.value &&
         selectedKiosk.value &&
         !activeSession.value
})

// Get remaining time for active session
const getRemainingTime = () => {
  if (!activeSession.value) return 0
  const remaining = activeSession.value.remaining_minutes || 0
  return Math.max(0, Math.round(remaining))
}

// Fetch initial data
const fetchData = async () => {
  try {
    // Get selected kiosk from sessionStorage
    const kioskData = sessionStorage.getItem('selectedKiosk')
    if (kioskData) {
      selectedKiosk.value = JSON.parse(kioskData)
    }

    // Fetch points balance and active session
    const [balanceResponse, sessionResponse] = await Promise.all([
      pointsService.getBalance(),
      chargingService.getActiveSession()
    ])

    pointsBalance.value = balanceResponse.data.data.points_balance
    
    if (sessionResponse.data.data) {
      activeSession.value = sessionResponse.data.data
    }
  } catch (err) {
    console.error('Fetch data error:', err)
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  }
}

// Redeem points and start charging
const redeemPoints = async () => {
  if (!canRedeem.value) return

  error.value = null
  redeeming.value = true

  try {
    const response = await chargingService.redeemPoints({
      kiosk_id: selectedKiosk.value.kiosk_id,
      points: pointsToRedeem.value
    })

    // Success - redirect to home
    alert('Charging session started successfully!')
    sessionStorage.removeItem('selectedKiosk')
    router.push('/')
  } catch (err) {
    console.error('Redeem error:', err)
    error.value = err.response?.data?.message || 'Failed to start charging session'
  } finally {
    redeeming.value = false
  }
}

// Cancel current session
const cancelCurrentSession = async () => {
  if (!activeSession.value) return

  cancelling.value = true

  try {
    await chargingService.cancelSession(activeSession.value.session_id)
    alert('Session cancelled successfully')
    activeSession.value = null
    await fetchData()
  } catch (err) {
    console.error('Cancel error:', err)
    alert(err.response?.data?.message || 'Failed to cancel session')
  } finally {
    cancelling.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.scan-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #f8f8f8;
}

.page-header {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  text-align: center;
  padding: 32px 20px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.page-header h1 {
  font-size: 28px;
  color: white;
  margin-bottom: 8px;
  font-weight: 800;
}

.page-header p {
  color: white;
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
}

/* No Kiosk Selected */
.no-kiosk {
  text-align: center;
  padding: 60px 20px;
}

.no-kiosk .icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.no-kiosk p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  font-weight: 600;
}

.select-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

/* Active Session Alert */
.active-session-alert {
  margin: 20px 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.alert-icon {
  font-size: 60px;
  margin-bottom: 16px;
}

.active-session-alert h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 800;
}

.active-session-alert > p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.session-details {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.session-details p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 600;
}

.session-details p:last-child {
  margin-bottom: 0;
}

.session-details strong {
  color: #333;
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 12px;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-btn {
  width: 100%;
  padding: 14px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

/* Redeem Container */
.redeem-container {
  padding: 20px 16px;
}

.balance-card {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.balance-label {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 8px;
  font-weight: 600;
}

.balance-value {
  font-size: 42px;
  color: white;
  font-weight: 800;
}

/* Input Section */
.input-section {
  margin-bottom: 24px;
}

.input-section label {
  display: block;
  font-size: 15px;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
}

.points-input {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  border: 2px solid #7fdb9f;
  border-radius: 12px;
  font-weight: 700;
  box-sizing: border-box;
}

.points-input:focus {
  outline: none;
  border-color: #42b883;
}

.range-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
  font-weight: 600;
}

/* Preview Card */
.preview-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 2px solid #7fdb9f;
}

.preview-card h3 {
  font-size: 17px;
  color: #42b883;
  margin-bottom: 16px;
  font-weight: 800;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.preview-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 800;
}

/* Error Message */
.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

/* Redeem Button */
.redeem-btn {
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
  margin-bottom: 20px;
}

.redeem-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quick Select */
.quick-select {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.preset-btn {
  padding: 12px;
  background: white;
  color: #42b883;
  border: 2px solid #42b883;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.preset-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.preset-btn:not(:disabled):active {
  background: #42b883;
  color: white;
}
</style>
