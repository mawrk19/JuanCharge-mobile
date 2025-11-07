<template>
  <div class="achievements-page">
    <div class="page-header">
      <h1>🏆 Achievements</h1>
      <p>Track your charging milestones</p>
    </div>

    <div class="points-summary">
      <div class="total-points">
        <div class="points-icon">⭐</div>
        <div class="points-info">
          <div class="points-value">{{ totalPoints }}</div>
          <div class="points-label">Total Points</div>
        </div>
      </div>
      <div class="level-badge">
        <div class="badge-icon">🎖️</div>
        <div class="level-name">Gold Member</div>
      </div>
    </div>

    <div class="achievements-grid">
      <div 
        class="achievement-card" 
        v-for="achievement in achievements" 
        :key="achievement.id"
        :class="{ unlocked: achievement.unlocked }"
      >
        <div class="achievement-icon">{{ achievement.icon }}</div>
        <div class="achievement-info">
          <div class="achievement-name">{{ achievement.name }}</div>
          <div class="achievement-description">{{ achievement.description }}</div>
          <div class="achievement-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: achievement.progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">{{ achievement.progress }}%</div>
          </div>
          <div class="achievement-reward" v-if="achievement.unlocked">
            +{{ achievement.points }} points
          </div>
        </div>
        <div class="unlock-badge" v-if="achievement.unlocked">✓</div>
      </div>
    </div>

    <div class="challenges-section">
      <h2>🎯 Daily Challenges</h2>
      <div class="challenge-list">
        <div class="challenge-item" v-for="challenge in challenges" :key="challenge.id">
          <div class="challenge-icon">{{ challenge.icon }}</div>
          <div class="challenge-details">
            <div class="challenge-name">{{ challenge.name }}</div>
            <div class="challenge-reward">+{{ challenge.reward }} pts</div>
          </div>
          <div class="challenge-status" :class="challenge.completed ? 'completed' : 'active'">
            {{ challenge.completed ? 'Done' : 'Active' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const totalPoints = ref(1245)

const achievements = ref([
  {
    id: 1,
    name: 'First Charge',
    description: 'Complete your first charging session',
    icon: '⚡',
    points: 50,
    progress: 100,
    unlocked: true
  },
  {
    id: 2,
    name: 'Eco Warrior',
    description: 'Charge 10 times in a month',
    icon: '🌱',
    points: 100,
    progress: 100,
    unlocked: true
  },
  {
    id: 3,
    name: 'Station Explorer',
    description: 'Use 5 different charging stations',
    icon: '🗺️',
    points: 150,
    progress: 80,
    unlocked: false
  },
  {
    id: 4,
    name: 'Night Owl',
    description: 'Charge during off-peak hours 5 times',
    icon: '🦉',
    points: 75,
    progress: 60,
    unlocked: false
  },
  {
    id: 5,
    name: 'Speed Demon',
    description: 'Use fast charging 3 times',
    icon: '⚡',
    points: 120,
    progress: 33,
    unlocked: false
  },
  {
    id: 6,
    name: 'Green Champion',
    description: 'Charge 50 times total',
    icon: '🏆',
    points: 500,
    progress: 30,
    unlocked: false
  }
])

const challenges = ref([
  {
    id: 1,
    name: 'Charge Today',
    icon: '⚡',
    reward: 25,
    completed: true
  },
  {
    id: 2,
    name: 'Visit New Station',
    icon: '📍',
    reward: 50,
    completed: false
  },
  {
    id: 3,
    name: 'Share with Friends',
    icon: '👥',
    reward: 30,
    completed: false
  }
])
</script>

<style scoped>
.achievements-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
}

.page-header {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  text-align: center;
  padding: 32px 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
  font-weight: 800;
}

.page-header p {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
}

.points-summary {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin: 0 16px 24px;
}

.total-points {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  color: #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.points-icon {
  font-size: 40px;
  margin-right: 16px;
}

.points-value {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #42b883;
}

.points-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.level-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(255, 199, 44, 0.3);
}

.badge-icon {
  font-size: 40px;
  margin-bottom: 6px;
}

.level-name {
  font-size: 13px;
  font-weight: 800;
  color: #333;
  text-align: center;
}

.achievements-grid {
  display: grid;
  gap: 12px;
  margin: 0 16px 24px;
}

.achievement-card {
  position: relative;
  display: flex;
  padding: 18px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  opacity: 0.5;
  transition: all 0.3s;
  border: 2px solid #f0f0f0;
}

.achievement-card.unlocked {
  opacity: 1;
  border: 2px solid #7fdb9f;
  box-shadow: 0 4px 16px rgba(255, 199, 44, 0.2);
}

.achievement-icon {
  font-size: 42px;
  margin-right: 16px;
  min-width: 50px;
  text-align: center;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 17px;
  font-weight: 800;
  color: #333;
  margin-bottom: 6px;
}

.achievement-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883 0%, #7fdb9f 100%);
  transition: width 0.3s;
  box-shadow: 0 0 8px rgba(218, 41, 28, 0.3);
}

.progress-text {
  font-size: 13px;
  color: #666;
  min-width: 40px;
  font-weight: 700;
}

.achievement-reward {
  font-size: 14px;
  font-weight: 800;
  color: #42b883;
}

.unlock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(255, 199, 44, 0.4);
}

.challenges-section {
  margin: 0 16px;
}

.challenges-section h2 {
  font-size: 20px;
  color: #42b883;
  margin-bottom: 16px;
  font-weight: 800;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.challenge-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.challenge-icon {
  font-size: 32px;
  margin-right: 16px;
}

.challenge-details {
  flex: 1;
}

.challenge-name {
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  font-size: 15px;
}

.challenge-reward {
  font-size: 13px;
  color: #42b883;
  font-weight: 800;
}

.challenge-status {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
}

.challenge-status.completed {
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  box-shadow: 0 2px 8px rgba(255, 199, 44, 0.3);
}

.challenge-status.active {
  background: #f0f0f0;
  color: #666;
}
</style>
