<template>
  <div class="home-page">
    <!-- Top Section (Header + Points Card) -->
    <div class="top-section" ref="topSectionRef">
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
          <h2 class="points-value">{{ store.userPoints || stats.total_points || 0 }}</h2>
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
        <!-- Charged Metric -->
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
          <a href="#" class="see-all" @click.prevent="router.push('/history')"
            >See All</a
          >
        </div>

        <div v-if="activities.length > 0" class="activity-list">
          <div
            v-for="activity in activities.slice(0, 5)"
            :key="activity.id"
            class="activity-card-glass"
            :class="{ expanded: expandedActivityId === activity.id }"
            @click="toggleActivity(activity.id)"
          >
            <div class="card-main-content">
              <div :class="['activity-icon-container', activity.type]">
                <span class="material-icons">{{
                  getTransactionIcon(activity.type)
                }}</span>
              </div>
              <div class="activity-info">
                <div class="activity-header-row">
                  <p class="activity-name">{{ activity.title }}</p>
                  <div class="activity-points-pill">
                    <span
                      :class="[
                        'points-value',
                        activity.transaction_type === 'credit'
                          ? 'credit'
                          : 'debit',
                      ]"
                    >
                      {{ activity.transaction_type === "credit" ? "+" : "-"
                      }}{{ activity.amount }}
                    </span>
                  </div>
                </div>
                <div class="activity-meta">
                  <span class="activity-date">
                    {{ formatDate(activity.created_at) }},
                    {{ formatTime(activity.created_at) }}
                  </span>
                  <div class="balance-pill">
                    <span class="pill-label">Balance:</span>
                    <span class="pill-value">{{ activity.points_after }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Expanded Details -->
            <div v-if="expandedActivityId === activity.id" class="card-details">
              <div class="divider"></div>
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">{{ activity.id }}</span>
              </div>
              <div v-if="activity.description" class="detail-item mt-2">
                <span class="detail-label">Description:</span>
                <p class="detail-desc">{{ activity.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="activity-card-empty">
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
      
    </div>
    <!-- End scroll content -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { secureStorage } from "@/services/secureStorage";
import {
  dashboardService,
  chargingService,
  pointsService,
} from "@/services/apiServices";

import { sessionState } from "@/services/sessionState";
import { store } from "@/services/store";

import gsap from 'gsap';
import { bounceGradient } from '@/gsap-bounce-gradient';

const router = useRouter();
const user = ref(null);
const stats = ref({});
const activities = ref([]);
const historyLoading = ref(false);
const expandedActivityId = ref(null);

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

const topSectionRef = ref(null);

const animateGradient = () => {
  if (topSectionRef.value) bounceGradient(topSectionRef.value);
};

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
      // Initialize store
      if (stats.value.total_points !== undefined) {
         store.setPoints(stats.value.total_points);
      }
    } else {
      // Mock
      stats.value = {
        total_points: 43,
        total_charges: 12,
        total_recyclables_weight_kg: 34,
        co2_saved_kg: 1,
      };
      // Init store with mock val if 0 (or keep existing if we moved back from scan and have higher val)
      if (store.userPoints === 0 || store.userPoints === 43) {
          store.setPoints(stats.value.total_points);
      }
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

  // Get Recent Activity
  fetchRecentActivity();

  // Animate gradient after DOM update
  await nextTick();
  animateGradient();
});

const fetchRecentActivity = async () => {
  historyLoading.value = true;
  try {
    const response = await pointsService.getTransactions({ limit: 5 });
    if (response.data && response.data.data) {
      activities.value = response.data.data;
    }
  } catch (error) {
    console.warn("Failed to fetch recent activity:", error);
  } finally {
    historyLoading.value = false;
  }
};

const toggleActivity = (id) => {
  if (expandedActivityId.value === id) {
    expandedActivityId.value = null;
  } else {
    expandedActivityId.value = id;
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case "charge":
      return "bolt";
    case "recycling":
      return "recycling";
    case "achievement":
      return "military_tech";
    default:
      return "history";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

onUnmounted(() => {
  // Global polling is handled in App.vue
});

const handleAction = (type) => {
  const routes = {
    scan: "/scan",
    map: "/map",
    history: "/history",
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

/* Activity List Unified */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-card-glass {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 14px;
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.activity-card-glass:active {
  transform: scale(0.97);
  background: rgba(255, 255, 255, 0.8);
}

.card-main-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.activity-icon-container.charge {
  background: rgba(43, 127, 255, 0.1);
  color: #2b7fff;
}

.activity-icon-container.recycling {
  background: rgba(32, 153, 88, 0.1);
  color: #209958;
}

.activity-icon-container.achievement {
  background: rgba(255, 215, 0, 0.1);
  color: #fbc02d;
}

.activity-info {
  flex: 1;
}

.activity-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-name {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.points-value {
  font-size: 13px;
  font-weight: 800;
}

.points-value.credit {
  color: #209958;
}

.points-value.debit {
  color: #e53935;
}

.activity-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-date {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.balance-pill {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.pill-label {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
}

.pill-value {
  font-size: 10px;
  font-weight: 700;
  color: #444;
}

/* Expanded State */
.card-details {
  margin-top: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.divider {
  height: 0.5px;
  background: rgba(0, 0, 0, 0.06);
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 11px;
  color: #999;
}

.detail-value {
  font-size: 11px;
  font-family: monospace;
  color: #666;
}

.detail-desc {
  font-size: 12px;
  color: #555;
  margin: 4px 0 0;
  line-height: 1.4;
}

.mt-2 {
  margin-top: 8px;
}

/* Empty State Styles */
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
