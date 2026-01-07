<template>
  <div class="history-page">
    <!-- Header -->
    <div class="header-section">
      <button class="back-btn" @click="router.back()">
        <span class="material-icons">arrow_back</span>
      </button>
      <h1>Activity History</h1>
      <div class="header-spacer"></div>
    </div>

    <!-- Content -->
    <div class="scroll-content">
      <div v-if="loading && activities.length === 0" class="loading-state">
        <div class="loader"></div>
        <p>Fetching your activities...</p>
      </div>

      <div v-else-if="activities.length > 0" class="activity-list">
        <div
          v-for="activity in activities"
          :key="activity.id"
          class="activity-card-glass"
          :class="{ expanded: expandedId === activity.id }"
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
          <div v-if="expandedId === activity.id" class="card-details">
            <div class="divider"></div>
            <div class="detail-item">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">{{ activity.id }}</span>
            </div>
            <div class="detail-item mt-2">
              <span class="detail-label">Status:</span>
              <span class="status-badge" :class="activity.status">{{
                activity.status
              }}</span>
            </div>
            <div v-if="activity.description" class="detail-item mt-2">
              <span class="detail-label">Description:</span>
              <p class="detail-desc">{{ activity.description }}</p>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="load-more-container" v-if="hasMore">
          <button
            class="load-more-btn"
            :disabled="loading"
            @click="fetchHistory"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Load More</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <span class="material-icons">history</span>
        </div>
        <h3>No activity yet</h3>
        <p>
          Your transaction history will appear here once you start using the
          app.
        </p>
        <button class="start-btn" @click="router.push('/home')">
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { pointsService } from "@/services/apiServices";

const router = useRouter();
const activities = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const hasMore = ref(true);
const expandedId = ref(null);

const fetchHistory = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await pointsService.getTransactions({
      page: currentPage.value,
      limit: 15,
    });

    if (response.data && response.data.data) {
      const newData = response.data.data;
      if (newData.length < 15) {
        hasMore.value = false;
      }
      activities.value = [...activities.value, ...newData];
      currentPage.value++;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error("Failed to fetch history:", error);
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const toggleActivity = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
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

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.history-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.header-section {
  background: linear-gradient(180deg, #2b7fff 0%, #209958 100%);
  padding: 50px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  color: white;
}

.header-section h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.back-btn,
.header-spacer {
  width: 40px;
  height: 40px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.scroll-content {
  flex: 1;
  padding: 20px;
}

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
  padding: 16px;
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.activity-card-glass:active {
  transform: scale(0.98);
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
}

.balance-pill {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
  display: flex;
  gap: 4px;
}

.pill-label {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
}
.pill-value {
  font-size: 10px;
  font-weight: 700;
  color: #444;
}

/* Expanded State */
.card-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.5px solid rgba(0, 0, 0, 0.06);
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

.status-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
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

/* Load More */
.load-more-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.load-more-btn {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon .material-icons {
  font-size: 40px;
  color: #ccc;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 14px;
  color: #777;
  max-width: 250px;
  margin-bottom: 30px;
}

.start-btn {
  background: #2b7fff;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-weight: 700;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2b7fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
