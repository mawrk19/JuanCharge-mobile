<template>
  <div class="leaderboards-page">
    <!-- Header -->
    <div class="header-container">
      <button class="back-btn" @click="goBack">
        <span class="material-icons">chevron_left</span>
        Back
      </button>
      <h1>Community Leaderboard</h1>
      <p>Compete with your community</p>
    </div>

    <div class="content-container">
      <!-- Month Card -->
      <div class="month-card shadow-sm">
        <div class="month-info">
          <h3>December 2025</h3>
          <p>Resets in 20 days</p>
        </div>
        <div class="competition-badge">Monthly Competition</div>
      </div>

      <!-- Top 3 Rewards -->
      <div class="rewards-card shadow-sm">
        <div class="rewards-header">
          <div class="rewards-icon-box">🏆</div>
          <div class="rewards-text">
            <h3>Top 3 Rewards</h3>
            <p>Win bonus points to charge your small devices!</p>
          </div>
        </div>
        <div class="prizes-list">
          <div class="prize-pill first">🥇 1st: 300 pts</div>
          <div class="prize-pill second">🥈 2nd: 200 pts</div>
          <div class="prize-pill third">🥉 3rd: 100 pts</div>
        </div>
      </div>

      <div class="section-title">Rankings</div>

      <!-- Requirement Info -->
      <div class="requirement-card shadow-sm">
        <div class="info-icon">ⓘ</div>
        <div class="req-content">
          <h3>Minimum Requirement</h3>
          <p>
            You need at least <span class="highlight">100 points</span> to be
            ranked on the leader board. Keep recycling to join the competition!
          </p>
        </div>
      </div>

      <!-- Rankings List -->
      <div class="rankings-list">
        <div
          v-for="user in leaderboardData"
          :key="user.rank"
          class="rank-card shadow-sm"
        >
          <div class="rank-number" :class="getRankClass(user.rank)">
            {{ user.rank }}
          </div>
          <div class="user-details">
            <div class="user-header">
              <h4>{{ user.name }}</h4>
              <div class="user-points">
                <span class="points-val">{{ user.points }}</span>
                <span class="points-label">points</span>
              </div>
            </div>
            <p class="recycled-count">{{ user.recycled }} items recycled</p>
            <p v-if="user.bonus" class="bonus-text">
              Bonus Reward: +{{ user.bonus }} points for charging devices
            </p>
          </div>
        </div>
      </div>

      <div class="section-title">Unranked Users</div>

      <!-- User Stats (Unranked view style) -->
      <div class="rank-card shadow-sm user-stats-card">
        <div class="rank-number unranked">-</div>
        <div class="user-details">
          <div class="user-header">
            <h4>You</h4>
            <div class="user-points">
              <span class="points-val">{{ myStats.points }}</span>
              <span class="points-label">points</span>
            </div>
          </div>
          <p class="recycled-count">{{ myStats.recycled }} items recycled</p>

          <div class="rank-progress">
            <p class="progress-text">
              Need {{ myStats.needed }} more points to rank
              <span class="percent-text">{{ myStats.percent }}%</span>
            </p>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{ width: myStats.percent + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { dashboardService } from "@/services/apiServices";

const router = useRouter();
const loading = ref(true);
const leaderboardData = ref([]);

const myStats = reactive({
  points: 0,
  recycled: 0,
  needed: 100, // Default requirement
  percent: 0,
  rank: "-",
});

const goBack = () => {
  router.back();
};

const fetchLeaderboard = async () => {
  loading.value = true;
  try {
    const response = await dashboardService.getLeaderboard();
    if (response.data && response.data.data) {
      leaderboardData.value = response.data.data.rankings || [];

      // Update my stats if provided in response, but prioritize dashboard stats
      if (response.data.data.user_stats) {
        const userStats = response.data.data.user_stats;
        // Only update if not already set by fetchStats or if fetching from leaderboard
        myStats.points = Math.max(myStats.points, userStats.points || 0);
        myStats.recycled = Math.max(
          myStats.recycled,
          userStats.recycled_count || 0
        );
        myStats.rank = userStats.rank || myStats.rank;

        calculateProgress();
      }
    }
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    fallbackMockData();
  } finally {
    loading.value = false;
  }
};

const calculateProgress = () => {
  const minRequired = 100;
  if (myStats.points < minRequired) {
    myStats.needed = minRequired - myStats.points;
    myStats.percent = Math.floor((myStats.points / minRequired) * 100);
  } else {
    myStats.needed = 0;
    myStats.percent = 100;
  }
};

const fetchStats = async () => {
  loading.value = true;
  try {
    const response = await dashboardService.getStats();
    if (response.data && response.data.data) {
      const data = response.data.data;
      // Map either total_points (from stats) or points (from leaderboard user_stats)
      myStats.points = data.total_points ?? data.points ?? 0;
      myStats.recycled =
        data.total_recyclables_weight_kg ?? data.recycled_count ?? 0;
      myStats.rank = data.rank ?? "-";

      calculateProgress();
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    fallbackMockData();
  } finally {
    loading.value = false;
  }
};

const fallbackMockData = () => {
  if (leaderboardData.value.length === 0) {
    leaderboardData.value = [
      {
        rank: 1,
        name: "Maria Santos",
        recycled: 125,
        points: 1250,
        bonus: 300,
      },
      {
        rank: 2,
        name: "Juan Dela Cruz",
        recycled: 98,
        points: 1100,
        bonus: 200,
      },
      { rank: 3, name: "Ana Reyes", recycled: 87, points: 950, bonus: 100 },
      {
        rank: 4,
        name: "Carlos Mendoza",
        recycled: 76,
        points: 820,
        bonus: null,
      },
      {
        rank: 5,
        name: "Miguel Kornejo",
        recycled: 54,
        points: 820,
        bonus: null,
      },
    ];
  }
  // Only set mock stats if real points are 0
  if (myStats.points === 0) {
    myStats.points = 43;
    myStats.recycled = 12;
    calculateProgress();
  }
};

const getRankClass = (rank) => {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-normal";
};

onMounted(() => {
  fetchLeaderboard();
  fetchStats();
});
</script>

<style scoped>
.leaderboards-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-primary);
  font-family: "Inter", sans-serif;
  padding-bottom: 40px;
}

.header-container {
  background: #4caf50; /* Green header */
  color: white;
  padding: 40px 20px 80px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  margin-bottom: -60px; /* Overlap content */
  position: relative;
  z-index: 1;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 0;
  margin-bottom: 16px;
  cursor: pointer;
  opacity: 0.9;
}

.header-container h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
}

.header-container p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.content-container {
  padding: 0 20px;
  position: relative;
  z-index: 2;
  bottom: 7 0px;
}

/* Month Card */
.month-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
}

.month-info h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--text-primary);
}

.month-info p {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.competition-badge {
  background: #e3f2fd;
  color: #2196f3;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
}

/* Rewards Card */
.rewards-card {
  background: #f0fdf4; /* Light green tint */
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #dcfce7;
}

.rewards-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.rewards-icon-box {
  width: 40px;
  height: 40px;
  background: #4caf50;
  border-radius: 10px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.rewards-text h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #166534;
}

.rewards-text p {
  font-size: 13px;
  color: #15803d;
  margin: 0;
  line-height: 1.4;
}

.prizes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.prize-pill {
  padding: 8px 30px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  width: 140px;
  text-align: center;
}

.prize-pill.first {
  background: var(--bg-secondary);
  border: 2px solid #90caf9;
  color: #1976d2;
}

.prize-pill.second {
  background: var(--bg-secondary);
  border: 2px solid #a5d6a7;
  color: #2e7d32;
}

.prize-pill.third {
  background: var(--bg-secondary);
  border: 2px solid #fff59d;
  color: #fbc02d;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

/* Requirement Card */
.requirement-card {
  background: #fffde7; /* Yellow tint */
  border: 1px solid #fff9c4;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.info-icon {
  color: #fbc02d;
  font-size: 24px;
  background: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #fbc02d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.req-content h3 {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.req-content p {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.highlight {
  color: #fbc02d;
  font-weight: 700;
}

/* Rankings List */
.rankings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.rank-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color);
}

.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
}

.rank-1,
.rank-2,
.rank-3 {
  background: #4caf50;
  color: white;
}

.rank-normal {
  background: none;
  color: var(--text-primary);
  font-size: 24px;
}

.unranked {
  background: none;
  color: #333;
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.user-details {
  flex: 1;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4px;
}

.user-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.user-points {
  text-align: right;
  color: #4caf50;
}

.points-val {
  font-weight: 700;
  font-size: 16px;
  margin-right: 4px;
}

.points-label {
  font-size: 12px;
}

.recycled-count {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

.bonus-text {
  font-size: 10px;
  color: #666;
  margin: 0;
}

/* User Stats Card */
.user-stats-card {
  border: 1px solid #666;
}

.progress-text {
  font-size: 11px;
  color: #666;
  margin: 0 0 4px;
  display: flex;
  justify-content: space-between;
}

.percent-text {
  font-weight: 700;
  color: #333;
}

.progress-bar-bg {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  background: #4caf50;
  height: 100%;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style>
