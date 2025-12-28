<template>
  <div class="achievements-page">
    <!-- Header Section -->
    <div class="header-container">
      <div class="header-content">
        <div class="header-text">
          <h1>Achievements</h1>
          <p>Track your progress and earn rewards</p>
        </div>

        <!-- Summary Stats Cards -->
        <div class="summary-stats">
          <div class="stat-card glass-effect">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <span class="stat-label">Completed:</span>
              <span class="stat-value"
                >{{ completedCount }}/{{ totalCount }}</span
              >
            </div>
          </div>
          <div class="stat-card glass-effect">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-label">Points Earned:</span>
              <span class="stat-value">{{ totalPoints }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-container">
      <!-- Overall Progress -->
      <div class="progress-card shadow-sm">
        <div class="progress-header">
          <span class="progress-title">Overall Progress</span>
          <span class="progress-percentage">{{ overallProgress }}%</span>
        </div>
        <div class="progress-bar-container">
          <div
            class="progress-bar"
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Leaderboard Banner -->
      <button
        class="leaderboard-banner shadow-sm"
        @click="router.push('/leaderboards')"
      >
        <div class="banner-content">
          <div class="banner-icon">👥</div>
          <div class="banner-text">
            <h3>See Leaderboards</h3>
            <p>Compete with your community</p>
          </div>
        </div>
        <div class="banner-arrow">›</div>
      </button>

      <!-- Completed Achievements -->
      <div class="section-header">
        <h3>
          🏆 Completed
          <span class="count">({{ completedAchievements.length }})</span>
        </h3>
      </div>

      <div class="achievements-list">
        <div
          v-for="item in completedAchievements"
          :key="item.id"
          class="achievement-card completed shadow-sm"
        >
          <div class="card-icon-wrapper">
            <div class="card-icon">{{ getIcon(item.id) }}</div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h4>{{ item.title }}</h4>
              <span class="badge completed">✓ Completed</span>
            </div>
            <p class="card-desc">{{ getDescription(item.id) }}</p>
            <p class="points-earned">
              ⭐ + {{ item.points_reward }} points earned
            </p>
          </div>
        </div>
      </div>

      <!-- In Progress Achievements -->
      <div class="section-header">
        <h3>
          ⚡ In Progress
          <span class="count">({{ inProgressAchievements.length }})</span>
        </h3>
      </div>

      <div class="achievements-list">
        <div
          v-for="item in inProgressAchievements"
          :key="item.id"
          class="achievement-card in-progress shadow-sm"
        >
          <div class="card-icon-wrapper">
            <div class="card-icon">{{ getIcon(item.id) }}</div>
          </div>
          <div class="card-content">
            <div class="card-header">
              <h4>{{ item.title }}</h4>
            </div>
            <p class="card-desc">{{ getDescription(item.id) }}</p>

            <div class="item-progress">
              <div class="progress-info">
                <span>{{ item.progress }} / {{ item.target }}</span>
                <span
                  >{{ Math.round((item.progress / item.target) * 100) }}%</span
                >
              </div>
              <div class="progress-bar-container small">
                <div
                  class="progress-bar green"
                  :style="{
                    width: (item.progress / item.target) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>

            <p class="points-reward">
              ☆ Reward: {{ item.points_reward }} Points
            </p>
          </div>
        </div>
      </div>

      <!-- Coming Soon -->
      <div class="section-header">
        <h3>🔒 Coming Soon</h3>
      </div>

      <div class="achievement-card locked shadow-sm">
        <div class="card-icon-wrapper">
          <div class="card-icon locked">🔒</div>
        </div>
        <div class="card-content">
          <p class="locked-text">More achievements coming soon!</p>
          <p class="locked-subtext">
            Keep using JuanCharge to unlock new challenges
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { dashboardService } from "@/services/apiServices";

const router = useRouter();
const loading = ref(true);
const achievements = ref([]);

// Mapping helpers for text/icons (since backend might send just IDs/Titles)
const getIcon = (id) => {
  const map = {
    first_charge: "🎖️",
    account_created: "🏆",
    eco_warrior: "🌿",
    power_user: "⚡",
    point_collector: "⭐",
    clean_barangay: "🌐",
    juice_up: "🔋",
  };
  return map[id] || "🏅";
};

const getDescription = (id) => {
  const map = {
    first_charge: "First charging session",
    account_created: "Welcome to JuanCharge!",
    eco_warrior: "Recycle waste items",
    power_user: "Charge your device frequently",
    point_collector: "Accumulate points",
    clean_barangay: "Recycle more waste",
    juice_up: "Power up your devices",
  };
  return map[id] || "Challenge yourself";
};

// Fetch Data
const fetchAchievements = async () => {
  loading.value = true;
  try {
    const response = await dashboardService.getAchievements();
    if (response.data && response.data.data) {
      achievements.value = response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch achievements:", error);
    // Fallback Mock if API fails
    mockFallback();
  } finally {
    loading.value = false;
  }
};

const mockFallback = () => {
  achievements.value = [
    {
      id: "first_charge",
      title: "First Charge",
      is_completed: true,
      progress: 1,
      target: 1,
      points_reward: 10,
    },
    {
      id: "eco_warrior",
      title: "Eco Warrior",
      is_completed: false,
      progress: 34,
      target: 50,
      points_reward: 50,
    },
  ];
};

// Computeds
const completedAchievements = computed(() => {
  return achievements.value.filter((a) => a.is_completed);
});

const inProgressAchievements = computed(() => {
  return achievements.value.filter((a) => !a.is_completed);
});

const totalCount = computed(() => achievements.value.length);
const completedCount = computed(() => completedAchievements.value.length);
const totalPoints = computed(() =>
  completedAchievements.value.reduce((sum, item) => sum + item.points_reward, 0)
);

const overallProgress = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

onMounted(() => {
  fetchAchievements();
});
</script>

<style scoped>
.achievements-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  font-family: "Inter", sans-serif;
  padding-bottom: 80px;
  margin-bottom: 30px;
}

.header-container {
  background: linear-gradient(180deg, #2b7fff 0%, #209958 100%);
  color: white;
  padding: 50px 24px 80px; /* Increased top padding to avoid clipping, matched bottom padding for overlap */
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  position: relative;
  margin-bottom: 40px; /* Space for the floating cards */
}

.header-text {
  text-align: center;
  margin-bottom: 24px;
}

.header-text h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.summary-stats {
  position: absolute;
  bottom: -30px;
  left: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.content-container {
  padding: 0 20px;
}

.progress-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 14px;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-container.small {
  height: 6px;
}

.progress-bar {
  height: 100%;
  background: black; /* Default black for overall per design */
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-bar.green {
  background: #42b883;
}

.leaderboard-banner {
  width: 100%;
  background: linear-gradient(90deg, #42b883 0%, #2e7d32 100%);
  border: none;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 24px;
  cursor: pointer;
  text-align: left;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.banner-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.banner-text p {
  margin: 0;
  font-size: 12px;
  opacity: 0.9;
}

.banner-arrow {
  font-size: 24px;
  font-weight: bold;
}

.section-header {
  margin-bottom: 16px;
  margin-top: 24px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  color: var(--text-secondary);
  font-weight: normal;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color);
}

.achievement-card.completed {
  border: 1px solid #a5d6a7;
  background-color: var(--bg-secondary);
}

.card-icon-wrapper {
  flex-shrink: 0;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.achievement-card.completed .card-icon {
  background: #4caf50;
  color: white;
}

.achievement-card.locked .card-icon {
  background: #eee;
  color: #999;
}

.card-content {
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.card-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.badge {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.badge.completed {
  background: #4caf50;
  color: white;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.points-earned {
  margin: 0;
  font-size: 13px;
  color: #fbc02d;
  font-weight: 600;
}

.points-reward {
  margin: 0;
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 600;
  margin-top: 8px;
}

.item-progress {
  margin-top: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.locked-text {
  font-weight: 600;
  color: #666;
  margin: 0;
  margin-bottom: 4px;
}

.locked-subtext {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
