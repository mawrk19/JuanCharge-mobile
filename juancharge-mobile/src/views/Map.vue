<template>
  <div class="map-page">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="page-title">Nearby Charging Stations</h1>
      <p class="page-subtitle">Find JuanCharge kiosks near you</p>
    </div>

    <!-- Map Container -->
    <div class="map-wrapper">
      <div id="map" class="map-container">
        <!-- Floating controls for Map (Overlayed) -->
        <div class="map-controls">
          <button
            class="control-btn location-btn shadow"
            @click="focusUserLocation"
          >
            <span class="material-icons">my_location</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Station List Section -->
    <div class="stations-section">
      <div v-if="loading" class="loading-state">
        <p>Loading stations...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="retry-btn" @click="fetchKiosks">Retry Search</button>
      </div>

      <template v-else>
        <h2 class="list-title">All Stations ({{ kiosks.length }})</h2>

        <div class="stations-list">
          <div
            v-for="kiosk in kiosks"
            :key="kiosk.id"
            class="station-card"
            :class="getBorderClass(kiosk)"
          >
            <div class="card-body">
              <h3 class="station-name">{{ kiosk.name }}</h3>
              <div class="info-row">
                <span class="material-icons info-icon">location_on</span>
                <span class="info-text">{{ kiosk.address }}</span>
              </div>
              <div class="stats-row">
                <div class="info-row">
                  <span class="material-icons info-icon rotate-45"
                    >navigation</span
                  >
                  <span class="info-text">{{ kiosk.distance }}</span>
                </div>
                <div class="info-row">
                  <span class="material-icons info-icon"
                    >battery_charging_full</span
                  >
                  <span class="info-text"
                    >{{ kiosk.available }}/{{ kiosk.total }} available</span
                  >
                </div>
              </div>
            </div>
            <div class="card-actions">
              <button
                class="action-btn details-btn"
                @click="handleAction('details', kiosk)"
              >
                <span class="material-icons small-icon">info</span>
                Details
              </button>
              <button
                class="action-btn directions-btn"
                @click="handleAction('directions', kiosk)"
              >
                <span class="material-icons small-icon">near_me</span>
                Directions
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { kioskService } from "@/services/apiServices";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const router = useRouter();

const kiosks = ref([]);
const loading = ref(false);
const error = ref(null);
let map = null;
const markers = [];

const mapCenter = [14.7566, 121.045]; // Default (Camarin, Caloocan area)

// Fetch kiosks
const fetchKiosks = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await kioskService.getAll();
    kiosks.value = response.data.data.map((k) => ({
      id: k.id,
      name: k.kiosk_code,
      address: k.location,
      lat: k.latitude || k.lat || 14.7566 + (Math.random() - 0.5) * 0.01, // Fallback for demo
      lng: k.longitude || k.lng || 121.045 + (Math.random() - 0.5) * 0.01,
      distance: "Calculating...",
      available: k.status === "active" ? 1 : 0,
      total: 1,
      color:
        k.status === "active"
          ? "green"
          : k.status === "maintenance"
          ? "orange"
          : "red",
    }));

    updateMapMarkers();
  } catch (err) {
    console.error("Kiosks error:", err);
    error.value = "Failed to load stations";
  } finally {
    loading.value = false;
  }
};

const updateMapMarkers = () => {
  if (!map) return;

  // Clear existing markers
  markers.forEach((m) => m.remove());
  markers.length = 0;

  kiosks.value.forEach((kiosk) => {
    const icon = L.divIcon({
      className: "custom-div-icon",
      html: `<div class='marker-pin ${kiosk.color}'></div><i class='material-icons'>location_on</i>`,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
    });

    const marker = L.marker([kiosk.lat, kiosk.lng], { icon })
      .addTo(map)
      .bindPopup(`<b>${kiosk.name}</b><br>${kiosk.address}`);

    markers.push(marker);
  });

  // Fit bounds if we have points
  if (markers.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
};

const initMap = () => {
  map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
  }).setView(mapCenter, 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  // Add a user location marker (simulated)
  L.circle(mapCenter, {
    color: "#3B82F6",
    fillColor: "#3B82F6",
    fillOpacity: 0.2,
    radius: 100,
  }).addTo(map);

  L.circleMarker(mapCenter, {
    radius: 8,
    fillColor: "#3B82F6",
    color: "#fff",
    weight: 2,
    opacity: 1,
    fillOpacity: 1,
  }).addTo(map);
};

const focusUserLocation = () => {
  if (map) map.setView(mapCenter, 16);
};

const getBorderClass = (kiosk) => {
  return `${kiosk.color}-border`;
};

const handleAction = (type, kiosk) => {
  if (type === "details") {
    sessionStorage.setItem("selected_kiosk", JSON.stringify(kiosk));
    router.push("/scan");
  } else {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${kiosk.lat},${kiosk.lng}`,
      "_blank"
    );
  }
};

onMounted(async () => {
  await nextTick();
  initMap();
  fetchKiosks();
});
</script>

<style scoped>
.map-page {
  padding: 20px 0 100px;
  background: var(--bg-primary);
  min-height: 100vh;
  box-sizing: border-box;
}

.header-section {
  padding: 0 20px;
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}
.page-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
  font-weight: 500;
}

.map-wrapper {
  padding: 0 20px;
  margin-bottom: 24px;
  position: relative;
}
.map-container {
  height: 280px;
  background: var(--bg-tertiary);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  z-index: 1;
}

.map-controls {
  position: absolute;
  right: 32px;
  bottom: 16px;
  z-index: 1000;
}

.control-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4caf50;
}

.shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stations-section {
  padding: 0 20px;
}
.list-title {
  font-size: 16px;
  font-weight: 700;
  color: #555;
  margin-bottom: 16px;
}

.stations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.station-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.green-border {
  border: 2px solid #55b959;
}
.red-border {
  border: 2px solid #ef4444;
}
.orange-border {
  border: 2px solid #f59e0b;
}

.station-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px;
}
.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.info-icon {
  font-size: 18px;
  color: var(--text-secondary);
}
.info-text {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}
.rotate-45 {
  transform: rotate(45deg);
}

.card-actions {
  display: flex;
  gap: 12px;
}
.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.details-btn {
  background: #4caf50;
  color: white;
  border: none;
}
.directions-btn {
  background: var(--bg-secondary);
  color: #4caf50;
  border: 1px solid var(--border-color);
}
.small-icon {
  font-size: 16px;
}

/* Custom Leaflet Marker Styles */
:deep(.custom-div-icon) {
  background: none;
  border: none;
}

:deep(.marker-pin) {
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
}

:deep(.marker-pin.green) {
  background: #10b981;
}
:deep(.marker-pin.orange) {
  background: #f59e0b;
}
:deep(.marker-pin.red) {
  background: #ef4444;
}

:deep(.custom-div-icon .material-icons) {
  position: absolute;
  width: 22px;
  font-size: 22px;
  left: 3px;
  top: 3px;
  color: white;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
.retry-btn {
  margin-top: 12px;
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}
</style>
