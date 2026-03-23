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
      <div class="list-item" @click="openLink('permissions')">
        <div class="item-icon">
          <span class="material-icons">verified_user</span>
        </div>
        <div class="item-content">Permissions</div>
        <div class="item-action">
          <span class="material-icons">chevron_right</span>
        </div>
      </div>
      <div class="list-item" @click="openLink('privacy')">
        <div class="item-icon">
          <span class="material-icons">security</span>
        </div>
        <div class="item-content">Privacy & Security</div>
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
      <!-- <div class="list-item">
        <div class="item-icon">
          <span class="material-icons">sync</span>
        </div>
        <div class="item-content">
          <div class="item-title">Auto Sync</div>
          <div class="item-subtitle">Sync when online</div>
        </div>
        <div class="item-action">
          <label class="toggle-switch">
            <input type="checkbox" v-model="preferences.autoSync" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div> -->
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

    <!-- Danger Zone -->
    <div class="section-title">Danger Zone</div>
    <div class="card settings-group">
      <div
        class="list-item danger-item"
        @click="deleteAccount"
        :class="{ disabled: deletingAccount }"
      >
        <div class="item-icon danger-icon">
          <span class="material-icons">delete_forever</span>
        </div>
        <div class="item-content">
          <div class="item-title danger-text">Delete Account</div>
          <div class="item-subtitle">
            Permanently remove your account and all associated data
          </div>
        </div>
        <div class="item-action danger-text">
          <span class="material-icons" v-if="!deletingAccount">chevron_right</span>
          <span v-else>...</span>
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

    <!-- Edit Profile Modal (Simplified Reuse) -->
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
const deletingAccount = ref(false);
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

const updateProfile = async () => {
  updating.value = true;
  try {
    await authService.updateProfile(editForm.value);

    // Use SweetAlert2 for success
    Swal.fire({
      title: "Success!",
      text: "Your profile has been updated.",
      icon: "success",
      confirmButtonColor: "#42b883",
      timer: 2000,
      timerProgressBar: true,
    });

    showEditProfile.value = false;
    fetchProfile();
  } catch (e) {
    // Use SweetAlert2 for failure
    Swal.fire({
      title: "Update Failed",
      text:
        e.response?.data?.message ||
        "Something went wrong while updating your profile.",
      icon: "error",
      confirmButtonColor: "#e74c3c",
    });
  } finally {
    updating.value = false;
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

const deleteAccount = async () => {
  if (deletingAccount.value) return;

  const confirmDelete = await Swal.fire({
    title: "Delete account?",
    text: "This action is permanent and cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Continue",
  });

  if (!confirmDelete.isConfirmed) return;

  const finalConfirm = await Swal.fire({
    title: "Final confirmation",
    text: "Are you sure you want to permanently delete your JuanCharge account?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it",
  });

  if (!finalConfirm.isConfirmed) return;

  deletingAccount.value = true;
  try {
    await authService.deleteAccount();
    await secureStorage.clearAll();
    await Swal.fire({
      title: "Account deleted",
      text: "Your account has been permanently removed.",
      icon: "success",
      confirmButtonColor: "#42b883",
    });
    router.push("/get-started");
  } catch (err) {
    Swal.fire({
      title: "Delete failed",
      text:
        err.response?.data?.message ||
        "We couldn't delete your account right now. Please try again.",
      icon: "error",
      confirmButtonColor: "#e74c3c",
    });
  } finally {
    deletingAccount.value = false;
  }
};

const openLink = (page) => {
  if (page === "permissions") {
    Swal.fire({
      title: "Permissions",
      text: "Please accept permissions (Location/Camera) when prompted by the app features.",
      icon: "info",
      confirmButtonColor: "#42b883",
    });
  } else if (page === "privacy") {
    Swal.fire({
      title: "Privacy & Security",
      text: "This feature is coming soon.",
      icon: "info",
      confirmButtonColor: "#42b883",
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

.profile-arrow {
  color: var(--text-tertiary);
}

.edit-trigger-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--accent-color);
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-trigger-btn:active {
  transform: scale(0.95);
  background: var(--bg-secondary);
}

.edit-trigger-btn .material-icons {
  font-size: 16px;
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

.danger-item {
  cursor: pointer;
}

.danger-item.disabled {
  opacity: 0.7;
  pointer-events: none;
}

.danger-icon,
.danger-text {
  color: var(--error-color);
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

.btn-icon {
  font-size: 20px;
}
</style>
