<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>⚙️ Settings</h1>
    </div>

    <div class="profile-section">
      <div class="profile-avatar">
        <div class="avatar-icon">👤</div>
      </div>
      <div class="profile-info">
        <div class="profile-name">Juan Dela Cruz</div>
        <div class="profile-email">juan@email.com</div>
      </div>
      <button class="edit-profile-btn">Edit</button>
    </div>

    <div class="settings-section">
      <h2>⚡ Charging Preferences</h2>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Auto-Start Charging</div>
            <div class="setting-description">Start charging automatically after QR scan</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.autoStartCharging" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Charge Limit</div>
            <div class="setting-description">Stop charging at</div>
          </div>
          <select v-model="settings.chargeLimit" class="setting-select">
            <option value="80">80%</option>
            <option value="90">90%</option>
            <option value="100">100%</option>
          </select>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h2>🔔 Notifications</h2>
      <div class="settings-group">
        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Charging Complete</div>
            <div class="setting-description">Notify when charging is done</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.notifyChargingComplete" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Station Availability</div>
            <div class="setting-description">Alert for nearby available stations</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.notifyStationAvailable" />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Promotions</div>
            <div class="setting-description">Receive special offers and updates</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.notifyPromotions" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h2>🌍 General</h2>
      <div class="settings-group">
        <div class="setting-item clickable" @click="showLanguageOptions = !showLanguageOptions">
          <div class="setting-label">
            <div class="setting-title">Language</div>
            <div class="setting-description">{{ settings.language }}</div>
          </div>
          <div class="setting-arrow">›</div>
        </div>

        <div class="setting-item clickable">
          <div class="setting-label">
            <div class="setting-title">Dark Mode</div>
            <div class="setting-description">Use dark theme</div>
          </div>
          <label class="toggle">
            <input type="checkbox" v-model="settings.darkMode" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h2>ℹ️ About</h2>
      <div class="settings-group">
        <div class="setting-item clickable">
          <div class="setting-label">
            <div class="setting-title">Terms of Service</div>
          </div>
          <div class="setting-arrow">›</div>
        </div>

        <div class="setting-item clickable">
          <div class="setting-label">
            <div class="setting-title">Privacy Policy</div>
          </div>
          <div class="setting-arrow">›</div>
        </div>

        <div class="setting-item clickable">
          <div class="setting-label">
            <div class="setting-title">Help & Support</div>
          </div>
          <div class="setting-arrow">›</div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <div class="setting-title">Version</div>
            <div class="setting-description">1.0.0</div>
          </div>
        </div>
      </div>
    </div>

    <button class="logout-btn">🚪 Sign Out</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showLanguageOptions = ref(false)

const settings = ref({
  autoStartCharging: true,
  chargeLimit: '80',
  notifyChargingComplete: true,
  notifyStationAvailable: true,
  notifyPromotions: false,
  language: 'English',
  darkMode: false
})
</script>

<style scoped>
.settings-page {
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
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.3);
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
  font-weight: 800;
}

.profile-section {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  margin: 0 16px 24px;
  color: #333;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(255, 199, 44, 0.3);
}

.avatar-icon {
  font-size: 32px;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #333;
}

.profile-email {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.edit-profile-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.3);
}

.settings-section {
  margin: 0 16px 24px;
}

.settings-section h2 {
  font-size: 16px;
  color: #42b883;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
}

.settings-group {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.clickable {
  cursor: pointer;
}

.setting-item.clickable:active {
  background: #f8f9fa;
}

.setting-label {
  flex: 1;
}

.setting-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.setting-arrow {
  font-size: 24px;
  color: #ccc;
  margin-left: 10px;
  font-weight: 700;
}

.setting-select {
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: white;
  cursor: pointer;
  font-weight: 700;
}

.setting-select:focus {
  outline: none;
  border-color: #7fdb9f;
  box-shadow: 0 0 0 3px rgba(255, 199, 44, 0.1);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 54px;
  height: 30px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ddd;
  transition: 0.3s;
  border-radius: 30px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  box-shadow: 0 0 8px rgba(255, 199, 44, 0.4);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.logout-btn {
  width: calc(100% - 32px);
  margin: 0 16px;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(218, 41, 28, 0.3);
  transition: all 0.2s ease;
}

.logout-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 8px rgba(218, 41, 28, 0.3);
}
</style>
