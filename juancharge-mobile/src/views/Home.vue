<template>
  <div class="home-page">
    <div class="hero-header">
      <h1>⚡ JuanCharge</h1>
      <p class="tagline">Fast. Easy. Charged.</p>
    </div>

    <div class="featured-banner">
      <div class="banner-content">
        <div class="banner-icon">🎉</div>
        <div class="banner-text">
          <div class="banner-title">Limited Offer!</div>
          <div class="banner-subtitle">Get 50% off your next charge</div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔋</div>
        <div class="stat-value">15</div>
        <div class="stat-label">Total Charges</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-value">245</div>
        <div class="stat-label">Points Earned</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📍</div>
        <div class="stat-value">8</div>
        <div class="stat-label">Stations Visited</div>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="action-buttons">
        <router-link to="/map" class="action-btn primary">
          <span class="action-icon">🗺️</span>
          <span class="action-label">Find Station</span>
        </router-link>
        <router-link to="/scan" class="action-btn secondary">
          <span class="action-icon">📱</span>
          <span class="action-label">Scan QR</span>
        </router-link>
      </div>
    </div>

    <div class="recent-activity">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon-wrap">
            <div class="activity-icon">🔌</div>
          </div>
          <div class="activity-details">
            <div class="activity-title">Charging Complete</div>
            <div class="activity-time">SM Mall Station • 2 hours ago</div>
          </div>
          <div class="activity-value">+50</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon-wrap">
            <div class="activity-icon">🏆</div>
          </div>
          <div class="activity-details">
            <div class="activity-title">Achievement Unlocked</div>
            <div class="activity-time">Eco Warrior • 1 day ago</div>
          </div>
          <div class="activity-value">+100</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon-wrap">
            <div class="activity-icon">⚡</div>
          </div>
          <div class="activity-details">
            <div class="activity-title">Fast Charge Used</div>
            <div class="activity-time">Capitol Commons • 2 days ago</div>
          </div>
          <div class="activity-value">+25</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home page logic can be added here
</script>

<style scoped>
.home-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #f8f8f8;
}

.hero-header {
  background: linear-gradient(135deg, #42b883 0%, #7fdb9f 100%);
  padding: 40px 20px 30px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.2);
}

.hero-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.tagline {
  color: white;
  margin-top: 8px;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.featured-banner {
  margin: 16px;
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(255, 199, 44, 0.3);
}

.banner-content {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #42b883;
  margin-bottom: 4px;
}

.banner-subtitle {
  font-size: 0.9rem;
  color: #292929;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px 12px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 2px solid #f0f0f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.stat-icon {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #42b883;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quick-actions {
  padding: 0 16px;
  margin-bottom: 24px;
}

.quick-actions h2 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #292929;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  text-decoration: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 120px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  color: #292929;
}

.action-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.action-label {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
}

.recent-activity {
  padding: 0 16px;
}

.recent-activity h2 {
  font-size: 1.3rem;
  margin-bottom: 12px;
  color: #292929;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  border: 2px solid #f0f0f0;
  transition: transform 0.2s;
}

.activity-item:active {
  transform: scale(0.98);
}

.activity-icon-wrap {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #7fdb9f 0%, #9fe6b5 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 14px;
  flex-shrink: 0;
}

.activity-icon {
  font-size: 1.8rem;
}

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 700;
  color: #292929;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.activity-value {
  font-weight: 800;
  color: #42b883;
  font-size: 1.1rem;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
