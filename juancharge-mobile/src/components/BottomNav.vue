<template>
  <nav class="bottom-nav">
    <router-link to="/home" class="nav-item" :class="{ active: currentRoute === '/home' }">
      <Home class="nav-icon" :size="24" />
      <div class="nav-label">Home</div>
    </router-link>

    <router-link to="/map" class="nav-item" :class="{ active: currentRoute === '/map' }">
      <MapPin class="nav-icon" :size="24" />
      <div class="nav-label">Map</div>
    </router-link>

    <router-link to="/scan" class="nav-item nav-scan" :class="{ active: currentRoute === '/scan' }">
      <div class="scan-button">
        <ScanLine class="scan-icon" :size="32" />
      </div>
      <div class="nav-label">Scan</div>
    </router-link>

    <router-link to="/achievements" class="nav-item" :class="{ active: currentRoute === '/achievements' }">
      <Trophy class="nav-icon" :size="24" />
      <div class="nav-label">Rewards</div>
    </router-link>

    <router-link to="/settings" class="nav-item" :class="{ active: currentRoute === '/settings' }">
      <Settings class="nav-icon" :size="24" />
      <div class="nav-label">Settings</div>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, MapPin, ScanLine, Trophy, Settings } from 'lucide-vue-next'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  z-index: 9999;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  border-top: 3px solid #7fdb9f;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #292929;
  padding: 5px 0;
  transition: all 0.3s;
}

.nav-item.active {
  color: #42b883;
}

.nav-icon {
  margin-bottom: 4px;
  transition: transform 0.3s;
  stroke-width: 2;
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
  stroke-width: 2.5;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Special styling for scan button */
.nav-scan {
  position: relative;
  margin-top: -25px;
}

.scan-button {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #42b883 0%, #7fdb9f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(218, 41, 28, 0.35);
  margin-bottom: 5px;
  transition: transform 0.3s;
  border: 4px solid white;
}

.nav-scan:active .scan-button {
  transform: scale(0.9);
}

.scan-icon {
  color: white;
  stroke-width: 2.5;
}

.nav-scan .nav-label {
  color: #42b883;
  font-weight: 700;
}

/* Safe area handling for devices with notches */
@supports (padding: max(0px)) {
  .bottom-nav {
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }
}
</style>
