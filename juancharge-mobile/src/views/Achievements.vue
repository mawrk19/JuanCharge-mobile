<template>
  <div class="achievements-page">
    <div class="page-header">
      <h1>🏆 Rewards</h1>
      <p>Your charging points and history</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading rewards...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchRewards">Retry</button>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="points-summary">
        <div class="total-points">
          <div class="points-icon">⭐</div>
          <div class="points-info">
            <div class="points-value">{{ pointsBalance.points_balance }}</div>
            <div class="points-label">Available Points</div>
          </div>
        </div>
        <div class="level-badge">
          <div class="badge-icon">⚡</div>
          <div class="level-name">{{ formatEnergy(pointsBalance.available_energy_wh) }}</div>
        </div>
      </div>

      <!-- Points Stats -->
      <div class="stats-cards">
        <div class="stat-item">
          <div class="stat-label">Total Earned</div>
          <div class="stat-value">{{ pointsBalance.total_earned }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Total Redeemed</div>
          <div class="stat-value">{{ pointsBalance.total_redeemed }}</div>
        </div>
      </div>

      <!-- Charging History Section -->
      <div class="challenges-section">
        <h2>⚡ Charging History</h2>
        
        <div v-if="chargingHistory.length === 0" class="empty-state">
          <p>No charging history yet</p>
        </div>
        
        <div class="challenge-list">
          <div 
            class="challenge-item" 
            v-for="session in chargingHistory" 
            :key="session.session_id"
          >
            <div class="challenge-icon">
              {{ session.status === 'completed' ? '✓' : session.status === 'cancelled' ? '✗' : '⏱' }}
            </div>
            <div class="challenge-details">
              <div class="challenge-name">{{ session.kiosk.kiosk_code }}</div>
              <div class="challenge-reward">
                {{ session.duration_minutes }} min • {{ session.energy_wh }} Wh
              </div>
              <div class="challenge-time">{{ formatDate(session.start_time) }}</div>
            </div>
            <div 
              class="challenge-status" 
              :class="session.status"
            >
              {{ getStatusLabel(session.status) }}
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <button 
          v-if="canLoadMore" 
          @click="loadMoreHistory" 
          class="load-more-btn"
          :disabled="loadingMore"
        >
          {{ loadingMore ? 'Loading...' : 'Load More' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { pointsService, chargingService } from '@/services/apiServices'
import { formatEnergy } from '@/services/apiConstants'

const pointsBalance = ref({
  points_balance: 0,
  total_earned: 0,
  total_redeemed: 0,
  available_energy_wh: 0
})

const chargingHistory = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)
const currentPage = ref(1)
const lastPage = ref(1)

// Can load more history
const canLoadMore = ref(false)

// Fetch rewards data
const fetchRewards = async () => {
  loading.value = true
  error.value = null
  
  try {
    const [balanceResponse, historyResponse] = await Promise.all([
      pointsService.getBalance(),
      chargingService.getHistory({ per_page: 10, page: 1 })
    ])
    
    pointsBalance.value = balanceResponse.data.data
    chargingHistory.value = historyResponse.data.data
    
    // Update pagination info
    if (historyResponse.data.pagination) {
      currentPage.value = historyResponse.data.pagination.current_page
      lastPage.value = historyResponse.data.pagination.last_page
      canLoadMore.value = currentPage.value < lastPage.value
    }
  } catch (err) {
    console.error('Rewards error:', err)
    error.value = err.response?.data?.message || 'Failed to load rewards'
    
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// Load more charging history
const loadMoreHistory = async () => {
  if (loadingMore.value || !canLoadMore.value) return
  
  loadingMore.value = true
  
  try {
    const nextPage = currentPage.value + 1
    const response = await chargingService.getHistory({ 
      per_page: 10, 
      page: nextPage 
    })
    
    // Append new history items
    chargingHistory.value.push(...response.data.data)
    
    // Update pagination
    if (response.data.pagination) {
      currentPage.value = response.data.pagination.current_page
      lastPage.value = response.data.pagination.last_page
      canLoadMore.value = currentPage.value < lastPage.value
    }
  } catch (err) {
    console.error('Load more error:', err)
  } finally {
    loadingMore.value = false
  }
}

// Get status label
const getStatusLabel = (status) => {
  return {
    'active': 'Active',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  }[status] || status
}

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

onMounted(() => {
  fetchRewards()
})
</script>

<style scoped>
.achievements-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  text-align: center;
  padding: 32px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 800;
}

.page-header p {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
}

.points-summary {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin: 0 16px 24px;
}

.total-points {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  color: #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.points-icon {
  font-size: 40px;
  margin-right: 16px;
}

.points-value {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #42b883;
}

.points-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(255, 199, 44, 0.3);
}

.badge-icon {
  font-size: 40px;
  margin-bottom: 6px;
}

.level-name {
  font-size: 13px;
  font-weight: 800;
  color: #333;
  text-align: center;
}

.achievements-grid {
  display: grid;
  gap: 12px;
  margin: 0 16px 24px;
}

.achievement-card {
  position: relative;
  display: flex;
  padding: 18px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  opacity: 0.5;
  transition: all 0.3s;
  border: 2px solid #f0f0f0;
}

.achievement-card.unlocked {
  opacity: 1;
  border: 2px solid #7fdb9f;
  box-shadow: 0 4px 16px rgba(255, 199, 44, 0.2);
}

.achievement-icon {
  font-size: 42px;
  margin-right: 16px;
  min-width: 50px;
  text-align: center;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 17px;
  font-weight: 800;
  color: #333;
  margin-bottom: 6px;
}

.achievement-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883 0%, #7fdb9f 100%);
  transition: width 0.3s;
  box-shadow: 0 0 8px rgba(218, 41, 28, 0.3);
}

.progress-text {
  font-size: 13px;
  color: #666;
  min-width: 40px;
  font-weight: 700;
}

.achievement-reward {
  font-size: 14px;
  font-weight: 800;
  color: #42b883;
}

.unlock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(255, 199, 44, 0.4);
}

.challenges-section {
  margin: 0 16px;
}

.challenges-section h2 {
  font-size: 20px;
  color: #42b883;
  margin-bottom: 16px;
  font-weight: 800;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.challenge-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.challenge-icon {
  font-size: 32px;
  margin-right: 16px;
  min-width: 40px;
  text-align: center;
}

.challenge-details {
  flex: 1;
}

.challenge-name {
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  font-size: 15px;
}

.challenge-reward {
  font-size: 13px;
  color: #42b883;
  font-weight: 800;
  margin-bottom: 2px;
}

.challenge-time {
  font-size: 12px;
  color: #999;
  font-weight: 600;
}

.challenge-status {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  text-transform: capitalize;
}

.challenge-status.completed {
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  box-shadow: 0 2px 8px rgba(127, 219, 159, 0.3);
}

.challenge-status.active {
  background: #42b883;
  color: white;
}

.challenge-status.cancelled {
  background: #f0f0f0;
  color: #666;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0 16px 24px;
}

.stat-item {
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.stat-label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  color: #42b883;
  font-weight: 800;
}

/* Loading/Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state p {
  font-size: 16px;
  color: #666;
  font-weight: 600;
}

.error-state p {
  font-size: 16px;
  color: #e74c3c;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-state button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

/* Load More Button */
.load-more-btn {
  width: 100%;
  padding: 14px;
  background: white;
  color: #42b883;
  border: 2px solid #42b883;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 12px;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.load-more-btn:not(:disabled):hover {
  background: #42b883;
  color: white;
}
</style>
