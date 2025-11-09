<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()

// Hide navbar on login page
const showNavbar = computed(() => {
  return route.path !== '/login'
})
</script>

<template>
  <div id="app">
    <div class="app-content">
      <router-view />
    </div>
    <BottomNav v-if="showNavbar" />
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

body {
  font-family: 'Speedee', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f8f8f8;
  color: #292929;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  position: fixed;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
</style>
