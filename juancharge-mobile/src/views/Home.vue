<template>
  <div class="home-page">
    <!-- Top Section (Header + Points Card) -->
    <div class="top-section">
      <!-- Header -->
      <div class="header">
        <div class="greeting">
          <p class="welcome-text">Welcome back,</p>
          <h1 class="user-name">{{ user?.name || "Juan Dela Cruz" }}</h1>
        </div>
        <div class="header-logo">
          <img src="/logo.png" alt="Logo" />
        </div>
      </div>

      <!-- Points Card -->
      <div class="points-card">
        <div class="points-info">
          <span class="points-label">Available Points</span>
          <h2 class="points-value">{{ stats.total_points || 0 }}</h2>
        </div>
        <div class="points-icon-wrapper">
          <span class="material-icons flash-icon">bolt</span>
        </div>
      </div>
    </div>

    <div class="scroll-content">
      <!-- Active Session Widget -->
      <div
        v-if="activeSession"
        class="active-session-widget shadow-sm"
        @click="router.push('/scan')"
      >
        <div class="widget-left">
          <div class="pulse-icon">
            <span class="material-icons">bolt</span>
          </div>
          <div class="widget-info">
            <h4>Charging in Progress</h4>
            <p>{{ timeRemaining }} mins remaining</p>
          </div>
        </div>
        <div class="widget-right">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-icon green-icon">
            <span class="material-icons">recycling</span>
          </div>
          <div class="metric-text">
            <span class="metric-label">Recycled</span>
            <span class="metric-count"
              >{{ stats.total_recyclables_weight_kg || 0 }} kg</span
            >
            <!-- Using kg as per data, design says 'times', will adapt label if needed -->
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon blue-icon">
            <span class="material-icons">battery_charging_full</span>
          </div>
          <div class="metric-text">
            <span class="metric-label">Charged</span>
            <span class="metric-count"
              >{{ stats.total_charges || 0 }} times</span
            >
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-container">
        <h3 class="section-title">Quick Actions</h3>
        <div class="actions-grid">
          <!-- Store Points -->
          <button class="action-btn" @click="handleAction('scan')">
            <div class="action-icon-circle green-light">
              <span class="material-icons green-text">recycling</span>
            </div>
            <span class="action-name">Store Points</span>
          </button>

          <!-- Scan Port QR -->
          <button class="action-btn" @click="handleAction('scan')">
            <div class="action-icon-circle blue-light">
              <span class="material-icons blue-text">qr_code_scanner</span>
            </div>
            <span class="action-name">Scan Port QR</span>
          </button>

          <!-- Offline Transactions -->
          <button class="action-btn" @click="handleAction('offline')">
            <div class="action-icon-circle yellow-light">
              <span class="material-icons yellow-text">receipt_long</span>
            </div>
            <span class="action-name">Offline Transactions</span>
          </button>

          <!-- History -->
          <button class="action-btn" @click="handleAction('history')">
            <div class="action-icon-circle blue-light">
              <span class="material-icons blue-text">history</span>
            </div>
            <span class="action-name">History</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section-container">
        <div class="section-header">
          <h3 class="section-title">Recent Activity</h3>
          <a href="#" class="see-all">See All</a>
        </div>

        <div class="activity-card-empty">
          <div class="empty-icon">
            <span class="material-icons">history</span>
          </div>
          <p class="empty-title">No Activity Yet</p>
          <p class="empty-desc">
            Start by depositing recyclables or charging your device
          </p>
        </div>
      </div>

      <!-- Environmental Impact -->
      <div class="section-container">
        <div class="impact-card">
          <div class="impact-header">
            <div class="impact-icon-box">
              <span class="material-icons">bar_chart</span>
            </div>
            <h4>Your Environmental Impact</h4>
          </div>

          <p class="impact-desc">
            You've helped reduce
            <span class="highlight">{{ stats.co2_saved_kg || 0 }}kg</span> of
            waste this month!
          </p>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div
              class="progress-bar"
              :style="{ width: calculatedProgress + '%' }"
            ></div>
          </div>

          <p class="impact-footer">
            49 more kilograms to reach your monthly goal
          </p>
        </div>
      </div>
    </div>
    <!-- End scroll content -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { secureStorage } from "@/services/secureStorage";
import { dashboardService } from "@/services/apiServices";

import { sessionState } from "@/services/sessionState";

const router = useRouter();
const user = ref(null);
const stats = ref({});

const activeSession = computed(() => sessionState.activeSession);
const timeRemaining = computed(() => {
  if (!activeSession.value) return 0;
  return (
    activeSession.value.remaining_minutes ??
    activeSession.value.remaining_time_minutes ??
    0
  );
});

const calculatedProgress = computed(() => {
  const current = stats.value.co2_saved_kg || 0;
  const goal = 50; // Example goal
  return Math.min((current / goal) * 100, 100);
});

// Polling for Active Session is now handled globally in App.vue

onMounted(async () => {
  // Get User
  const userData = await secureStorage.getUserData();
  if (userData) {
    user.value = userData;
  }

  // Get Stats (Mock or Real)
  try {
    const response = await dashboardService.getStats();
    if (response.data && response.data.data) {
      stats.value = response.data.data;
    } else {
      // Mock
      stats.value = {
        total_points: 43,
        total_charges: 12,
        total_recyclables_weight_kg: 34,
        co2_saved_kg: 1,
      };
    }
  } catch (e) {
    console.warn("Using mock stats data");
    stats.value = {
      total_points: 43,
      total_charges: 12,
      total_recyclables_weight_kg: 34,
      co2_saved_kg: 1,
    };
  }

  // Start polling active session (now handled globally, but we can trigger immediate check)
  // sessionState polling handles this automatically
});

import { onUnmounted } from "vue"; // Ensure imported
import { chargingService } from "@/services/apiServices"; // Ensure imported

onUnmounted(() => {
  // Global polling is handled in App.vue
});

const handleAction = (type) => {
  const routes = {
    scan: "/scan",
    map: "/map",
    history: "/achievements", // Pointing history to achievements for now or create new view
    offline: "#",
  };

  if (routes[type]) {
    if (routes[type] === "#") {
      alert("Offline transactions feature coming soon!");
    } else {
      router.push(routes[type]);
    }
  }
};
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Top Section with Gradient */
.top-section {
  background: linear-gradient(180deg, #2b7fff 0%, #209958 100%);
  padding: 40px 20px 80px; /* Extra bottom padding for overlap */
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.welcome-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin: 0;
}

.user-name {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin: 4px 0 0;
}

.header-logo img {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  padding: 4px;
  object-fit: contain;
}

/* Points Card */
.points-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.points-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}

.points-value {
  color: white;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.points-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flash-icon {
  color: #ffd700; /* Gold/Yellow */
  font-size: 28px;
}

/* Content Area */
.scroll-content {
  padding: 0 20px 100px; /* Bottom padding for nav bar */
  margin-top: -60px; /* Overlap effect */
  position: relative;
  z-index: 2;
  overflow-y: auto;
  flex: 1;
}

/* Metrics Row */
.metrics-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  flex: 1;
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.green-icon {
  background: #e8f5e9;
  color: #2e7d32;
}
.blue-icon {
  background: #e3f2fd;
  color: #1976d2;
}

.metric-text {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.metric-count {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Sections */
.section-container {
  margin-bottom: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.see-all {
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  transition: transform 0.1s;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.green-light {
  background: #e8f5e9;
}
.blue-light {
  background: #e3f2fd;
}
.yellow-light {
  background: #fffde7;
}

.green-text {
  color: #4caf50;
}
.blue-text {
  color: #2196f3;
}
.yellow-text {
  color: #ffc107;
}

.action-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

/* Empty State */
.activity-card-empty {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 40px 20px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  margin-bottom: 16px;
}
.empty-icon .material-icons {
  font-size: 40px;
  color: var(--text-secondary);
}

.empty-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 200px;
  margin: 0 auto;
}

/* Impact Card */
.impact-card {
  background: #f0fdf4; /* Light green bg */
  border: 1px solid #86efac;
  border-radius: 20px;
  padding: 20px;
}

.impact-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.impact-icon-box {
  width: 36px;
  height: 36px;
  background: #4caf50;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.impact-icon-box .material-icons {
  color: white;
  font-size: 20px;
}

.impact-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #166534; /* Dark green */
}

.impact-desc {
  font-size: 14px;
  color: #4ade80; /* Medium green */
  color: #15803d;
  margin: 0 0 16px;
  line-height: 1.5;
}

.highlight {
  font-weight: 700;
}

.progress-container {
  height: 8px;
  background: #d1d5db; /* Gray */
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: #4caf50;
  border-radius: 4px;
}

.impact-footer {
  font-size: 13px;
  color: #15803d;
  margin: 0;
  font-weight: 500;
}

/* Active Session Widget */
.active-session-widget {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  margin: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-color);
  background: linear-gradient(
    to right,
    rgba(224, 242, 241, 0.3),
    var(--bg-secondary)
  );
  cursor: pointer;
}

.widget-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pulse-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #26a69a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(38, 166, 154, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(38, 166, 154, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(38, 166, 154, 0);
  }
}

.widget-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #00695c;
}

.widget-info p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #00897b;
}

.widget-right {
  color: #00897b;
}
</style>
