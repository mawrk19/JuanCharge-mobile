<template>
  <div class="map-page">
    <div class="page-header">
      <h1>🗺️ Charging Stations Map</h1>
    </div>

    <div class="search-bar">
      <input 
        type="text" 
        placeholder="Search stations..." 
        v-model="searchQuery"
        @input="filterStations"
      />
      <button class="search-btn" @click="fetchKiosks">🔍</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading stations...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchKiosks">Retry</button>
    </div>

    <!-- Content -->
    <template v-else>
      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-icon">📍</div>
          <p>{{ kiosks.length }} station{{ kiosks.length !== 1 ? 's' : '' }} found</p>
          <small>Map integration coming soon</small>
        </div>
      </div>

      <div class="stations-list">
        <h2>Available Stations ({{ filteredKiosks.length }})</h2>
        
        <div v-if="filteredKiosks.length === 0" class="empty-state">
          <p>No stations found</p>
        </div>
        
        <div 
          v-for="kiosk in filteredKiosks" 
          :key="kiosk.id" 
          class="station-card"
        >
          <div class="station-info">
            <div class="station-name">{{ kiosk.kiosk_code }}</div>
            <div class="station-distance">{{ kiosk.location }}</div>
            <div 
              class="station-status" 
              :class="getStatusClass(kiosk.status)"
            >
              {{ getStatusLabel(kiosk.status) }}
            </div>
          </div>
          <button 
            class="navigate-btn" 
            @click="navigateToKiosk(kiosk)"
            :disabled="kiosk.status !== 'active'"
          >
            {{ kiosk.status === 'active' ? 'Start Charging' : 'Unavailable' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { kioskService } from '@/services/apiServices'
import { API_CONSTANTS } from '@/services/apiConstants'

const router = useRouter()

const searchQuery = ref('')
const kiosks = ref([])
const loading = ref(true)
const error = ref(null)

// Fetch kiosks from API
const fetchKiosks = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await kioskService.getAll()
    kiosks.value = response.data.data
  } catch (err) {
    console.error('Kiosks error:', err)
    error.value = err.response?.data?.message || 'Failed to load stations'
    
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// Filter kiosks by search query
const filteredKiosks = computed(() => {
  if (!searchQuery.value) return kiosks.value
  
  const query = searchQuery.value.toLowerCase()
  return kiosks.value.filter(kiosk => 
    kiosk.kiosk_code.toLowerCase().includes(query) ||
    kiosk.location.toLowerCase().includes(query)
  )
})

// Get status CSS class
const getStatusClass = (status) => {
  return {
    'active': 'available',
    'inactive': 'occupied',
    'maintenance': 'maintenance'
  }[status] || 'occupied'
}

// Get status label
const getStatusLabel = (status) => {
  return {
    'active': '✓ Available',
    'inactive': '⚠ Offline',
    'maintenance': '🔧 Maintenance'
  }[status] || '⚠ Unavailable'
}

// Navigate to charging page with selected kiosk
const navigateToKiosk = (kiosk) => {
  if (kiosk.status === 'active') {
    // Store selected kiosk in session storage
    sessionStorage.setItem('selected_kiosk', JSON.stringify(kiosk))
    router.push('/scan')
  }
}

// Filter stations when typing
const filterStations = () => {
  // Computed property handles this automatically
}

onMounted(() => {
  fetchKiosks()
})
</script>

<style scoped>
.map-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #f8f8f8;
}

.page-header {
  background: linear-gradient(135deg, #42b883 0%, #7fdb9f 100%);
  padding: 24px 16px;
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.2);
}

.page-header h1 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.search-bar {
  display: flex;
  gap: 10px;
}

.search-bar input {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-weight: 500;
}

.search-bar input::placeholder {
  color: #999;
}

.search-btn {
  padding: 14px 20px;
  background: white;
  color: #42b883;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  font-weight: 700;
}

.map-container {
  margin: 16px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border: 2px solid #f0f0f0;
}

.map-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background: #f8f8f8;
}

.map-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.stations-list {
  padding: 0 16px;
}

.stations-list h2 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #292929;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.station-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 2px solid #f0f0f0;
  transition: transform 0.2s;
}

.station-card:active {
  transform: scale(0.98);
}

.station-info {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.station-name {
  font-weight: 700;
  font-size: 1rem;
  color: #292929;
  margin-bottom: 6px;
}

.station-distance {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.station-status {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.station-status.available {
  background: #7fdb9f;
  color: #292929;
}

.station-status.occupied {
  background: #f0f0f0;
  color: #666;
}

.navigate-btn {
  padding: 12px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(218, 41, 28, 0.3);
  flex-shrink: 0;
}

.navigate-btn:active {
  opacity: 0.85;
}
</style>
