<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>Settings</h1>
      <p>Manage your account and preferences</p>
    </div>

    <!-- Profile Section -->
    <div class="card profile-card" v-if="!loading">
      <div class="profile-avatar">
        {{ userInitials }}
      </div>
      <div class="profile-info">
        <div class="profile-name">
          {{ userProfile.first_name }} {{ userProfile.last_name }}
        </div>
        <div class="profile-email">{{ userProfile.email }}</div>
        <div
          class="profile-phone"
          v-if="
            userProfile.phone || userProfile.phone_number || userProfile.contact
          "
        >
          {{
            userProfile.phone || userProfile.phone_number || userProfile.contact
          }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading profile...</p>
    </div>

    <!-- Account Section -->
    <div class="section-title">Account</div>
    <div class="card settings-group">
      <div class="list-item" @click="router.push('/settings/edit-profile')">
        <div class="item-icon">
          <span class="material-icons">edit</span>
        </div>
        <div class="item-content">Edit Profile</div>
        <div class="item-action">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>
      <div class="list-item" @click="openLink('privacy')">
        <div class="item-icon">
          <span class="material-icons">security</span>
        </div>
        <div class="item-content">
          <div class="item-title">Privacy & Security</div>
          <div class="item-subtitle">Terms and Agreement</div>
        </div>
        <div class="item-action">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>
    </div>

    <!-- Preferences Section -->
    <div class="section-title">Preferences</div>
    <div class="card settings-group">
      <div class="list-item">
        <div class="item-icon">
          <span class="material-icons">notifications</span>
        </div>
        <div class="item-content">
          <div class="item-title">Notifications</div>
          <div class="item-subtitle">Get updates on your activity</div>
        </div>
        <div class="item-action">
          <label class="toggle-switch">
            <input type="checkbox" v-model="preferences.notifications" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
      <div class="list-item">
        <div class="item-icon">
          <span class="material-icons">dark_mode</span>
        </div>
        <div class="item-content">
          <div class="item-title">Dark Mode</div>
        </div>
        <div class="item-action">
          <label class="toggle-switch">
            <input type="checkbox" v-model="isDark" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <!-- Device Section -->
    <div class="section-title">Device</div>
    <div class="card settings-group">
      <div class="list-item device-item">
        <div class="item-icon">
          <span class="material-icons">smartphone</span>
        </div>
        <div class="item-content">
          <div class="item-title">Device</div>
          <div class="item-subtitle">{{ deviceId }}</div>
        </div>
      </div>
      <div class="device-info-box">
        <div class="info-box-content">
          <span class="material-icons info-icon">lightbulb</span>
          <p>
            Your device is automatically logged in. You won't need to sign in
            again unless you log out manually.
          </p>
        </div>
      </div>
    </div>

    <!-- Support Section -->
    <div class="section-title">Support</div>
    <div class="card settings-group">
      <div class="list-item" @click="router.push('/help')">
        <div class="item-icon">
          <span class="material-icons">help_outline</span>
        </div>
        <div class="item-content">Help Center</div>
        <div class="item-action">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>
      <div class="list-item" @click="router.push('/about')">
        <div class="item-icon">
          <span class="material-icons">info_outline</span>
        </div>
        <div class="item-content">About JuanCharge</div>
        <div class="item-action">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="page-footer">
      <p>Version 1.0.0</p>
      <p>© 2025 JuanCharge Philippines</p>

      <button class="logout-btn" @click="logout" :disabled="loggingOut">
        <span class="material-icons btn-icon" v-if="!loggingOut">logout</span>
        <span v-if="!loggingOut">Log Out</span>
        <span v-else>Logging out...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import { secureStorage } from "@/services/secureStorage";
import { normalizeAuthUser } from "@/services/authUser";
import { useTheme } from "@/composables/useTheme";
import Swal from "sweetalert2";

const router = useRouter();
const { isDark, toggleTheme } = useTheme();

// State
const userProfile = ref({});
const loading = ref(true);
const loggingOut = ref(false);
const deviceId = ref("device_" + Math.random().toString(36).substr(2, 9));

const preferences = ref({
  notifications: true,
  autoSync: false,
});

const userInitials = computed(() => {
  const first = userProfile.value.first_name?.charAt(0) || "";
  const last = userProfile.value.last_name?.charAt(0) || "";
  return (first + last).toUpperCase() || "U";
});

// Fetch Profile
const fetchProfile = async () => {
  loading.value = true;
  try {
    const response = await authService.me();
    const normalizedUser = normalizeAuthUser(
      response.data.user || response.data.data || {},
      response.data
    );
    userProfile.value = normalizedUser;
    await secureStorage.setUserData(normalizedUser);
  } catch (err) {
    console.error("Profile load error", err);
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  loggingOut.value = true;
  try {
    await authService.logout();
  } catch (e) {
    console.error(e);
  } finally {
    await secureStorage.clearAll();
    router.push("/login");
  }
};

const openLink = (page) => {
  if (page === "privacy") {
    Swal.fire({
      title: "Terms and Agreement",
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto; font-size: 14px; line-height: 1.6; padding: 0 10px;">
          <p><strong>Last Updated: March 26, 2026</strong></p>
          <p>Welcome to JuanCharge. These Terms of Service ("Terms") govern your use of the JuanCharge mobile application and the associated IoT-integrated smart kiosks (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
          
          <h4>1. Acceptance of Terms</h4>
          <p>By creating an account or using a JuanCharge kiosk, you confirm that you have read, understood, and agree to these Terms. If you do not agree, please do not use the Service.</p>
          
          <h4>2. Description of Service</h4>
          <p>JuanCharge provides an automated recycling and charging solution. Users may deposit eligible plastic bottles or aluminum cans into designated kiosks to receive mobile charging credits or other incentives as defined within the app.</p>
          
          <h4>3. User Accounts</h4>
          <ul>
              <li><strong>Registration:</strong> You must provide accurate and complete information when creating an account.</li>
              <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
              <li><strong>Eligibility:</strong> You must be at least 13 years of age to use this Service.</li>
          </ul>

          <h4>4. Proper Use of Kiosks</h4>
          <ul>
              <li><strong>Eligible Materials:</strong> Only empty, uncrushed plastic bottles and aluminum cans are accepted.</li>
              <li><strong>Prohibited Items:</strong> Users must not attempt to deposit glass, paper, liquids, hazardous materials, or any items not explicitly supported by the kiosk.</li>
              <li><strong>Vandalism:</strong> Any attempt to tamper with, damage, or bypass the hardware/software of a JuanCharge kiosk is strictly prohibited and may result in legal action.</li>
          </ul>

          <h4>5. Incentive Credits</h4>
          <ul>
              <li><strong>Earning:</strong> Credits are issued based on the successful validation of recycled materials by the IoT system.</li>
              <li><strong>Redemption:</strong> Credits are non-transferable and have no cash value outside of the JuanCharge ecosystem.</li>
              <li><strong>Expiration:</strong> We reserve the right to set expiration dates on promotional credits, which will be communicated via the app.</li>
          </ul>

          <h4>6. Privacy & Data Collection</h4>
          <p>Your use of the Service is also governed by our Privacy Policy. We collect data necessary for the functionality of the smart kiosks, including recycling history and charging sessions, to improve our environmental impact reporting.</p>

          <h4>7. Limitation of Liability</h4>
          <p>JuanCharge and its development team (JuanThugs) shall not be liable for:</p>
          <ul>
              <li>Damage to mobile devices resulting from faulty user cables or improper connection to the kiosk.</li>
              <li>Loss of credits due to unauthorized account access.</li>
              <li>Service interruptions caused by kiosk maintenance or connectivity issues.</li>
          </ul>

          <h4>8. Termination</h4>
          <p>We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the Service itself.</p>

          <h4>9. Changes to Terms</h4>
          <p>We may update these Terms from time to time. We will notify you of any changes by posting the new Terms within the mobile application. Your continued use of the app after such changes constitutes acceptance of the new Terms.</p>

          <h4>10. Contact Information</h4>
          <p>If you have any questions regarding these Terms, please contact the JuanCharge support team through the "Help" section of the mobile app. Leo.</p>
        </div>
      `,
      icon: "info",
      confirmButtonColor: "#42b883",
      confirmButtonText: "Close"
    });
  }
};

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.settings-page {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  margin-bottom: 60px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.page-header p {
  color: var(--text-secondary);
  font-size: 14px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 24px 0 8px 4px;
}

.card {
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.profile-card:active {
  background-color: var(--bg-tertiary);
}

.profile-avatar {
  width: 60px;
  aspect-ratio: 1/1;
  min-width: 48px;
  min-height: 48px;
  max-width: 100px;
  max-height: 100px;
  border-radius: 50%;
  background: var(--accent-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  margin-right: 16px;
  overflow: hidden;
  box-sizing: border-box;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 2px;
}

.profile-email,
.profile-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

/* List Items */
.list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  background-color: var(--bg-secondary);
  transition: background-color 0.2s;
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:active {
  background-color: var(--bg-tertiary);
}

.item-icon {
  width: 24px;
  text-align: center;
  margin-right: 16px;
  font-size: 18px;
}

.item-content {
  flex: 1;
}

.item-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.item-action {
  color: var(--text-tertiary);
  font-weight: bold;
}

/* Device Section specific */
.device-item {
  border-bottom: none;
}

.device-info-box {
  background-color: rgba(66, 184, 131, 0.1);
  color: #2c8c63;
  font-size: 12px;
  padding: 12px 16px;
  margin: 0 16px 16px;
  border-radius: 8px;
  line-height: 1.4;
}

.info-box-content {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.device-info-box .info-icon {
  font-size: 16px;
  color: #f1c40f;
}

[data-theme="dark"] .device-info-box {
  background-color: rgba(66, 184, 131, 0.2);
  color: #7fdb9f;
}

/* Footer */
.page-footer {
  text-align: center;
  margin-top: 40px;
  padding-bottom: 20px;
}

.page-footer p {
  color: var(--text-tertiary);
  font-size: 12px;
  margin-bottom: 4px;
}

.logout-btn {
  margin-top: 20px;
  background: var(--bg-secondary);
  color: var(--error-color);
  border: 1px solid var(--border-color);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.btn-icon {
  font-size: 20px;
}
</style>
