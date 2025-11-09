<template>
  <div class="dashboard-example">
    <h2>Dashboard</h2>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <!-- User Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Points Balance</h3>
          <p class="stat-value">{{ stats.total_points }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Charges</h3>
          <p class="stat-value">{{ stats.total_charges }}</p>
        </div>
        <div class="stat-card">
          <h3>Energy Used</h3>
          <p class="stat-value">{{ stats.energy_used_kwh }} kWh</p>
        </div>
        <div class="stat-card">
          <h3>CO2 Saved</h3>
          <p class="stat-value">{{ stats.co2_saved_kg }} kg</p>
        </div>
      </div>

      <!-- Active Session -->
      <div v-if="activeSession" class="active-session">
        <h3>🔋 Charging in Progress</h3>
        <p>Session ID: {{ activeSession.session_id }}</p>
        <p>Duration: {{ activeSession.duration_minutes }} minutes</p>
        <p>Energy: {{ activeSession.energy_wh }} Wh</p>
        <p>Remaining: {{ activeSession.remaining_minutes }} minutes</p>
        <button @click="cancelSession" class="cancel-btn">Cancel Session</button>
      </div>

      <!-- Kiosks Map -->
      <div class="kiosks-section">
        <h3>📍 Available Kiosks</h3>
        <div v-for="kiosk in kiosks" :key="kiosk.id" class="kiosk-card">
          <h4>{{ kiosk.kiosk_code }}</h4>
          <p>{{ kiosk.location }}</p>
          <span :class="['status', kiosk.status]">{{ kiosk.status }}</span>
          <button @click="startCharging(kiosk.id)">Charge Here</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  dashboardService, 
  chargingService, 
  kioskService 
} from '@/services/apiServices'
import { calculateEnergy, API_CONSTANTS } from '@/services/apiConstants'

const stats = ref({})
const activeSession = ref(null)
const kiosks = ref([])
const loading = ref(false)
const error = ref(null)

// Fetch dashboard data
const fetchDashboard = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get dashboard stats
    const statsResponse = await dashboardService.getStats()
    stats.value = statsResponse.data.data
    
    // Check for active session
    const sessionResponse = await chargingService.getActiveSession()
    activeSession.value = sessionResponse.data.data.session
    
    // Get available kiosks
    const kiosksResponse = await kioskService.getAll({ 
      status: API_CONSTANTS.KIOSK_STATUS.ACTIVE 
    })
    kiosks.value = kiosksResponse.data.data
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load dashboard'
    console.error('Dashboard error:', err)
  } finally {
    loading.value = false
  }
}

// Start charging session
const startCharging = async (kioskId) => {
  try {
    const points = 30 // You can make this dynamic
    
    // Validate points
    const energy = calculateEnergy(points)
    const confirmed = confirm(
      `Redeem ${points} points for ${energy.minutes} minutes (${energy.wh} Wh)?`
    )
    
    if (!confirmed) return
    
    const response = await chargingService.redeemPoints(points, kioskId)
    
    alert('Charging started! Session ID: ' + response.data.data.session.session_id)
    
    // Refresh dashboard
    await fetchDashboard()
    
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to start charging'
    alert('Error: ' + message)
    
    // Handle specific error cases
    if (err.response?.data?.data?.active_session_id) {
      alert('You already have an active session')
    }
  }
}

// Cancel active session
const cancelSession = async () => {
  if (!activeSession.value) return
  
  const confirmed = confirm('Are you sure you want to cancel this charging session?')
  if (!confirmed) return
  
  try {
    const response = await chargingService.cancelSession(activeSession.value.session_id)
    
    alert(`Session cancelled. Time used: ${response.data.data.time_used_minutes} minutes`)
    
    // Refresh dashboard
    await fetchDashboard()
    
  } catch (err) {
    alert('Error: ' + (err.response?.data?.message || 'Failed to cancel session'))
  }
}

onMounted(() => {
  fetchDashboard()
  
  // Auto-refresh every 30 seconds if there's an active session
  const interval = setInterval(() => {
    if (activeSession.value) {
      fetchDashboard()
    }
  }, 30000)
  
  // Cleanup
  return () => clearInterval(interval)
})
</script>

<style scoped>
.dashboard-example {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #42b883;
  margin: 0;
}

.active-session {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  padding: 20px;
  border-radius: 16px;
  margin: 20px 0;
}

.active-session h3 {
  margin-top: 0;
}

.cancel-btn {
  background: white;
  color: #42b883;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
}

.kiosks-section {
  margin-top: 30px;
}

.kiosk-card {
  background: white;
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 12px;
  position: relative;
}

.kiosk-card h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status.maintenance {
  background: #fff3cd;
  color: #856404;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #2c8c63;
}
</style>

