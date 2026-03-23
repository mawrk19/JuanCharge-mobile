<template>
  <div class="get-started-page">
    <!-- Main Content -->
    <div class="content-container">
      <!-- Top Section -->
      <div class="header-section">
        <div class="logo-container">
          <img src="/logo.png" alt="JuanCharge Logo" class="logo" />
        </div>
        <h1 class="app-title">JuanCharge</h1>
        <p class="tagline">Solar-Wind Powered Smart Kiosk</p>
        <p class="sub-tagline">
          AI-Enabled Waste Segregation & Renewable Energy
        </p>
      </div>

      <!-- Features Card -->
      <div class="features-card">
        <h2 class="card-title">Why JuanCharge?</h2>

        <div class="features-list">
          <!-- Feature 1 -->
          <div class="feature-item">
            <div class="icon-box green-bg">
              <span class="material-icons green-text">recycling</span>
            </div>
            <div class="feature-text">
              <h3>Recycle & Earn Points</h3>
              <p>Deposit recyclables and earn points instantly</p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="feature-item">
            <div class="icon-box yellow-bg">
              <span class="material-icons yellow-text">bolt</span>
            </div>
            <div class="feature-text">
              <h3>Charge Your Device</h3>
              <p>Use points for renewable energy charging</p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="feature-item">
            <div class="icon-box blue-bg">
              <span class="material-icons blue-text">cloud_queue</span>
            </div>
            <div class="feature-text">
              <h3>Works Offline</h3>
              <p>Sync automatically when you're online</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="footer-action">
        <button class="get-started-btn" @click="navigateToLogin">
          Get Started
          <span class="material-icons chevron">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const navigateToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.get-started-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(
    180deg,
    #2b7fff 0%,
    #209958 100%
  ); /* Blue to Green gradient approximation */
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  color: white;
  overflow-y: auto;
  position: fixed;
  top: var(--app-safe-top, 12px);
  left: 0;
  right: 0;
  bottom: 0;
  margin-bottom: 24px;
}

.content-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 32px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 20px;
  padding: 10px;
  object-fit: contain;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.app-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.sub-tagline {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.4;
}

/* Features Card */
.features-card {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  box-sizing: border-box;
  color: var(--text-primary);
  margin-bottom: 32px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.card-title {
  text-align: center;
  color: #2b7fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.green-bg {
  background-color: #e8f5e9;
}
.yellow-bg {
  background-color: #fffde7;
}
.blue-bg {
  background-color: #e3f2fd;
}

.green-text {
  color: #2e7d32;
}
.yellow-text {
  color: #fbc02d;
}
.blue-text {
  color: #1976d2;
}

[data-theme="dark"] .green-bg {
  background-color: rgba(46, 125, 50, 0.2);
}
[data-theme="dark"] .yellow-bg {
  background-color: rgba(251, 192, 45, 0.2);
}
[data-theme="dark"] .blue-bg {
  background-color: rgba(25, 118, 210, 0.2);
}

[data-theme="dark"] .green-text {
  color: #81c784;
}
[data-theme="dark"] .yellow-text {
  color: #fff176;
}
[data-theme="dark"] .blue-text {
  color: #64b5f6;
}

.material-icons {
  font-size: 24px;
}

.feature-text h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #2b7fff;
  font-weight: 700;
}

.feature-text p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Footer Action */
.footer-action {
  width: 100%;
  margin-top: auto;
  padding-bottom: 24px;
}

.get-started-btn {
  width: 100%;
  padding: 18px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 14px;
  color: #2b7fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.get-started-btn:active {
  transform: scale(0.98);
}

.chevron {
  font-size: 20px;
  font-weight: bold;
}
</style>
