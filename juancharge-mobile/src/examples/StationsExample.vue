<template>
  <div class="stations-example">
    <h2>Nearby Stations</h2>
    
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else>
      <div v-for="station in stations" :key="station.id" class="station-card">
        <h3>{{ station.name }}</h3>
        <p>{{ station.address }}</p>
        <p>Distance: {{ station.distance }}km</p>
        <button @click="startCharging(station.id)">Start Charging</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { stationService, chargingService } from '@/services/apiServices'

const stations = ref([])
const loading = ref(false)
const error = ref(null)

// Fetch nearby stations
const fetchStations = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Get user location (you can use Geolocation API)
    const lat = 14.5995  // Example: Manila coordinates
    const lng = 120.9842
    
    const response = await stationService.getNearby(lat, lng, 10)
    stations.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to fetch stations'
    console.error('Error fetching stations:', err)
  } finally {
    loading.value = false
  }
}

// Start charging session
const startCharging = async (stationId) => {
  try {
    const response = await chargingService.startSession(stationId, {
      connector_type: 'type2'
    })
    
    alert('Charging started! Session ID: ' + response.data.session_id)
  } catch (err) {
    alert('Error: ' + (err.response?.data?.message || 'Failed to start charging'))
  }
}

onMounted(() => {
  fetchStations()
})
</script>

<style scoped>
.station-card {
  border: 1px solid #ddd;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
}
</style>
