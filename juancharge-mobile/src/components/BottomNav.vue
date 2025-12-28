<template>
  <nav class="bottom-nav">
    <router-link
      to="/home"
      class="nav-item"
      :class="{ active: currentRoute === '/home' }"
    >
      <span class="material-icons nav-icon">home</span>
      <div class="nav-label">Home</div>
    </router-link>

    <router-link
      to="/map"
      class="nav-item"
      :class="{ active: currentRoute === '/map' }"
    >
      <span class="material-icons nav-icon">map</span>
      <div class="nav-label">Map</div>
    </router-link>

    <router-link to="/scan" class="nav-item nav-scan">
      <div class="scan-button">
        <span class="material-icons scan-icon">qr_code_scanner</span>
      </div>
      <div class="nav-label">Scan QR</div>
    </router-link>

    <router-link
      to="/achievements"
      class="nav-item"
      :class="{ active: currentRoute === '/achievements' }"
    >
      <span class="material-icons nav-icon">emoji_events</span>
      <div class="nav-label">Rewards</div>
    </router-link>

    <router-link
      to="/settings"
      class="nav-item"
      :class="{ active: currentRoute === '/settings' }"
    >
      <span class="material-icons nav-icon">settings</span>
      <div class="nav-label">Settings</div>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const currentRoute = computed(() => route.path);
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
  background: var(--bg-secondary);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  padding: 8px 0 max(12px, env(safe-area-inset-bottom));
  z-index: 9999;
  border-top: 1px solid var(--border-color);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  text-decoration: none;
  color: var(--text-secondary); /* Neutral gray */
  padding: 5px 0;
  padding: 5px 0;
  transition: all 0.2s;
}

.nav-item.active {
  color: var(--accent-color); /* JuanCharge Green */
}

.nav-icon {
  font-size: 26px;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Special styling for scan button */
.nav-scan {
  position: relative;
  margin-top: -30px;
}

.scan-button {
  width: 60px;
  height: 60px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.3);
  margin-bottom: 5px;
  transition: transform 0.2s;
  border: 4px solid #4caf50; /* Green border as in screenshot */
}

.nav-scan .scan-icon {
  color: #4caf50;
  font-size: 32px;
}

.nav-scan:active .scan-button {
  transform: scale(0.92);
}

.nav-scan .nav-label {
  color: var(--text-secondary);
  font-weight: 600;
  margin-top: 0;
}

/* Safe area handling */
@supports (padding: max(0px)) {
  .bottom-nav {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>
