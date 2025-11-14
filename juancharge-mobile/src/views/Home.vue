<template>
  <div class="home-page">
    <div class="hero-header">
      <h1>⚡ JuanCharge</h1>
      <p class="tagline">Fast. Easy. Charged.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchDashboard">Retry</button>
    </div>

    <!-- Dashboard Content -->
    <template v-else>
      <!-- Active Session Banner -->
      <div v-if="activeSession" class="featured-banner active-session">
        <div class="banner-content">
          <div class="banner-icon">🔋</div>
          <div class="banner-text">
            <div class="banner-title">Charging in Progress</div>
            <div class="banner-subtitle">{{ getRemainingTime() }} remaining</div>
          </div>
        </div>
      </div>

      <!-- Promo Banner (when no active session) -->
      <div v-else class="featured-banner">
        <div class="banner-content">
          <div class="banner-icon">🎉</div>
          <div class="banner-text">
            <div class="banner-title">Start Charging Today!</div>
            <div class="banner-subtitle">Redeem your points now</div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🔋</div>
          <div class="stat-value">{{ stats.total_charges }}</div>
          <div class="stat-label">Total Charges</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ stats.total_points }}</div>
          <div class="stat-label">Points Balance</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-value">{{ stats.energy_used_kwh }}</div>
          <div class="stat-label">kWh Used</div>
        </div>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <router-link to="/map" class="action-btn primary">
            <span class="action-icon">🗺️</span>
            <span class="action-label">Find Station</span>
          </router-link>
          <router-link to="/scan" class="action-btn secondary">
            <span class="action-icon">📱</span>
            <span class="action-label">Scan QR</span>
          </router-link>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Environmental Impact</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon-wrap">
              <span class="activity-icon">🌱</span>
            </div>
            <div class="activity-details">
              <div class="activity-title">CO2 Saved</div>
              <div class="activity-time">{{ stats.co2_saved_kg }} kg</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon-wrap">
              <span class="activity-icon">♻️</span>
            </div>
            <div class="activity-details">
              <div class="activity-title">Recyclables Deposited</div>
              <div class="activity-time">{{ stats.total_recyclables_weight_kg }} kg</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardService, chargingService } from '@/services/apiServices'
import { formatDuration } from '@/services/apiConstants'

const router = useRouter()

const stats = ref({
  total_points: 0,
  total_charges: 0,
  energy_used_kwh: 0,
  co2_saved_kg: 0,
  total_recyclables_weight_kg: 0
})

const activeSession = ref(null)
const loading = ref(true)
const error = ref(null)
let refreshInterval = null

// Fetch dashboard data
const fetchDashboard = async () => {
  try {
    const [statsResponse, sessionResponse] = await Promise.all([
      dashboardService.getStats(),
      chargingService.getActiveSession()
    ])
    
    stats.value = statsResponse.data.data
    activeSession.value = sessionResponse.data.data.session
    error.value = null
  } catch (err) {
    console.error('Dashboard error:', err)
    error.value = err.response?.data?.message || 'Failed to load dashboard'
    
    // If unauthorized, redirect to login
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// Calculate remaining time for active session
const getRemainingTime = () => {
  if (!activeSession.value) return ''
  
  const remaining = activeSession.value.remaining_minutes
  if (remaining <= 0) return 'Ending soon...'
  
  return formatDuration(remaining)
}

onMounted(() => {
  fetchDashboard()
  
  // Auto-refresh every 30 seconds
  refreshInterval = setInterval(() => {
    fetchDashboard()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #f8f8f8;
}

.hero-header {
  background: linear-gradient(135deg, #42b883 0%, #7fdb9f 100%);
  padding: 40px 20px 30px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.2);
}

.hero-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.tagline {
  color: white;
  margin-top: 8px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.featured-banner {
  margin: 16px;
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(255, 199, 44, 0.3);
}

.banner-content {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #42b883;
  margin-bottom: 4px;
}

.banner-subtitle {
  font-size: 0.9rem;
  color: #292929;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px 12px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 2px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.stat-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #42b883;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-actions {
  padding: 0 16px;
  margin-bottom: 24px;
}

.quick-actions h2 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #292929;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  text-decoration: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 120px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  color: #292929;
}

.action-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.action-label {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.recent-activity {
  padding: 0 16px;
}

.recent-activity h2 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #292929;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 2px solid #f0f0f0;
  transition: transform 0.2s;
}

.activity-item:active {
  transform: scale(0.98);
}

.activity-icon-wrap {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.activity-icon {
  font-size: 1.8rem;
}

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 700;
  color: #292929;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.activity-value {
  font-weight: 800;
  color: #42b883;
  font-size: 1.1rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
