<template>
  <div class="about-page">
    <div class="header-nav">
      <button class="back-btn" @click="router.back()">
        <span class="material-icons">chevron_left</span>
        Back
      </button>
      <h1>About JuanCharge</h1>
    </div>

    <div class="content">
      <div class="logo-section">
        <img src="/logo.png" alt="JuanCharge Logo" class="app-logo" />
        <h2 class="app-name">JuanCharge</h2>
        <p class="app-version">Version 1.0.0 (Stable)</p>
      </div>

      <div class="info-card">
        <h3>Our Mission</h3>
        <p>
          JuanCharge is a solar and wind-powered smart kiosk system designed to
          provide sustainable charging solutions while encouraging proper waste
          management through AI-enabled segregation and a points-based reward
          system.
        </p>
      </div>

      <div class="info-card">
        <h3>Sustainability</h3>
        <p>
          We believe in a greener Philippines. By using renewable energy, we
          reduce carbon footprints one charge at a time.
        </p>
      </div>

      <div class="social-links">
        <div class="link-item">
          <span class="material-icons">language</span>
          <span>www.juancharge.ph</span>
        </div>
        <div class="link-item">
          <span class="material-icons">facebook</span>
          <span>JuanChargePH</span>
        </div>
      </div>

      <div class="footer-legal">
        <p>© 2025 JuanCharge Philippines. All rights reserved.</p>
        <p>Terms of Service • Privacy Policy</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped>
.about-page {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.content {
  max-width: 480px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.app-logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: white;
  padding: 10px;
  box-shadow: var(--shadow-md);
  margin-bottom: 16px;
}

.app-name {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}

.app-version {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--accent-color);
}

.info-card p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.social-links {
  margin-top: 32px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: var(--text-primary);
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);
}

.link-item .material-icons {
  color: var(--accent-color);
  font-size: 20px;
}

.footer-legal {
  text-align: center;
  margin-top: 48px;
  padding-bottom: 24px;
}

.footer-legal p {
  color: var(--text-tertiary);
  font-size: 12px;
  margin: 4px 0;
}
</style>
