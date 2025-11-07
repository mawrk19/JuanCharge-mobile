<template>
  <div class="map-page">
    <div class="page-header">
      <h1>🗺️ Charging Stations Map</h1>
    </div>

    <div class="search-bar">
      <input type="text" placeholder="Search stations..." v-model="searchQuery" />
      <button class="search-btn">🔍</button>
    </div>

    <div class="map-container">
      <div class="map-placeholder">
        <div class="map-icon">📍</div>
        <p>Map will be displayed here</p>
        <small>Integration with Google Maps or Mapbox</small>
      </div>
    </div>

    <div class="stations-list">
      <h2>Nearby Stations</h2>
      <div class="station-card" v-for="station in filteredStations" :key="station.id">
        <div class="station-info">
          <div class="station-name">{{ station.name }}</div>
          <div class="station-distance">{{ station.distance }} km away</div>
          <div class="station-status" :class="station.available ? 'available' : 'occupied'">
            {{ station.available ? '✓ Available' : '⚠ Occupied' }}
          </div>
        </div>
        <button class="navigate-btn">Navigate</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const stations = ref([
  { id: 1, name: 'SM Mall Station', distance: 1.2, available: true },
  { id: 2, name: 'Ayala Center', distance: 2.5, available: true },
  { id: 3, name: 'Robinson\'s Place', distance: 3.1, available: false },
  { id: 4, name: 'Capitol Commons', distance: 4.0, available: true },
  { id: 5, name: 'BGC Station', distance: 5.5, available: true }
])

const filteredStations = computed(() => {
  if (!searchQuery.value) return stations.value
  return stations.value.filter(station => 
    station.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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
