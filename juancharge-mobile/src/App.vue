<script setup>
import { onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import BottomNav from "./components/BottomNav.vue";
import ToastContainer from "./components/ToastContainer.vue";
import FloatingChargingWidget from "./components/FloatingChargingWidget.vue";
import {
  startSessionPolling,
  stopSessionPolling,
} from "@/services/sessionState";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
useTheme(); // Initialize theme globally

// Hide navbar on login page
const showBottomNav = computed(() => {
  return !["/login", "/get-started", "/"].includes(route.path);
});

// Watch for route changes to start/stop polling
watch(
  () => route.path,
  (newPath) => {
    // Only poll if we are on a protected route or Home
    if (["/login", "/get-started", "/"].includes(newPath)) {
      stopSessionPolling();
    } else {
      startSessionPolling();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  stopSessionPolling();
});
</script>

<template>
  <div id="app">
    <transition name="page-fade" mode="out-in">
      <router-view />
    </transition>
    <FloatingChargingWidget />
    <BottomNav v-if="showBottomNav" />
    <ToastContainer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  -webkit-text-size-adjust: 100%;
}

:root {
  --app-safe-top: calc(env(safe-area-inset-top, 0px) + 12px);
}

body {
  font-family: "Speedee", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  position: fixed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.3s, color 0.3s;
}

#app {
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: var(--app-safe-top);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.app-content {
  width: 100%;
  min-height: 100vh;
  padding-bottom: 100px;
  overflow-x: hidden;
}

/* Remove default link styles */
a {
  text-decoration: none;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

/* Button reset */
button {
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

/* Prevent horizontal scroll */
.app-content > * {
  max-width: 100vw;
  overflow-x: hidden;
}

.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-fade-enter-from, .page-fade-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}
.page-fade-enter-to, .page-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
