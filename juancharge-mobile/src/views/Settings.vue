<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>⚙️ Settings</h1>
      <p>Manage your account and preferences</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProfile">Retry</button>
    </div>

    <!-- Profile Content -->
    <template v-else>
      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-avatar">
          <div class="avatar-icon">👤</div>
        </div>
        <div class="profile-info">
          <div class="profile-name">{{ userProfile.first_name }} {{ userProfile.last_name }}</div>
          <div class="profile-email">{{ userProfile.email }}</div>
          <div class="profile-points">{{ userProfile.points_balance }} Points</div>
        </div>
      </div>

      <!-- Profile Details -->
      <div class="settings-section">
        <h2>👤 Profile Information</h2>
        <div class="settings-group">
          <div class="info-item">
            <div class="info-label">First Name</div>
            <div class="info-value">{{ userProfile.first_name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Last Name</div>
            <div class="info-value">{{ userProfile.last_name }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">{{ userProfile.email }}</div>
          </div>
          <div class="info-item" v-if="userProfile.phone">
            <div class="info-label">Phone</div>
            <div class="info-value">{{ userProfile.phone }}</div>
          </div>
          <div class="info-item" v-if="userProfile.birth_date">
            <div class="info-label">Birth Date</div>
            <div class="info-value">{{ formatDate(userProfile.birth_date) }}</div>
          </div>
        </div>
        <button class="action-btn" @click="showEditProfile = true">
          ✏️ Edit Profile
        </button>
      </div>

      <!-- Edit Profile Modal -->
      <div v-if="showEditProfile" class="modal-overlay" @click="showEditProfile = false">
        <div class="modal-content" @click.stop>
          <h3>Edit Profile</h3>
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>First Name</label>
              <input v-model="editForm.first_name" type="text" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input v-model="editForm.last_name" type="text" required />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input v-model="editForm.phone" type="tel" />
            </div>
            <div class="form-group">
              <label>Birth Date</label>
              <input v-model="editForm.birth_date" type="date" />
            </div>
            <div class="modal-actions">
              <button type="button" @click="showEditProfile = false" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="save-btn" :disabled="updating">
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Change Password -->
      <div class="settings-section">
        <h2>🔒 Security</h2>
        <button class="action-btn" @click="showChangePassword = true">
          Change Password
        </button>
      </div>

      <!-- Change Password Modal -->
      <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
        <div class="modal-content" @click.stop>
          <h3>Change Password</h3>
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label>Current Password</label>
              <input v-model="passwordForm.current_password" type="password" required />
            </div>
            <div class="form-group">
              <label>New Password</label>
              <input v-model="passwordForm.new_password" type="password" required minlength="8" />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input v-model="passwordForm.new_password_confirmation" type="password" required />
            </div>
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
            <div class="modal-actions">
              <button type="button" @click="showChangePassword = false" class="cancel-btn">
                Cancel
              </button>
              <button type="submit" class="save-btn" :disabled="changingPassword">
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="settings-section">
        <h2>🚪 Account</h2>
        <button class="logout-btn" @click="logout" :disabled="loggingOut">
          {{ loggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </div>

      <!-- App Info -->
      <div class="app-info">
        <p>JuanCharge Mobile v1.0.0</p>
        <p>© 2024 All rights reserved</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/apiServices'
import { secureStorage } from '@/services/secureStorage'

const router = useRouter()

const userProfile = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  points_balance: 0
})

const editForm = ref({})
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const loading = ref(true)
const error = ref(null)
const updating = ref(false)
const changingPassword = ref(false)
const loggingOut = ref(false)
const showEditProfile = ref(false)
const showChangePassword = ref(false)
const passwordError = ref(null)

// Fetch user profile
const fetchProfile = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await authService.me()
    // Laravel returns { success: true, user: {...} }
    userProfile.value = response.data.user || response.data.data || {}
    
    // Initialize edit form
    editForm.value = {
      first_name: userProfile.value.first_name || '',
      last_name: userProfile.value.last_name || '',
      phone: userProfile.value.phone || userProfile.value.phone_number || '',
      birth_date: userProfile.value.birth_date || ''
    }
  } catch (err) {
    console.error('Profile error:', err)
    error.value = err.response?.data?.message || 'Failed to load profile'
    
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  updating.value = true

  try {
    await authService.updateProfile(editForm.value)
    alert('Profile updated successfully!')
    showEditProfile.value = false
    await fetchProfile()
  } catch (err) {
    console.error('Update error:', err)
    alert(err.response?.data?.message || 'Failed to update profile')
  } finally {
    updating.value = false
  }
}

// Change password
const changePassword = async () => {
  passwordError.value = null

  // Validate password match
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordError.value = 'New passwords do not match'
    return
  }

  changingPassword.value = true

  try {
    await authService.changePassword(passwordForm.value)
    alert('Password changed successfully!')
    showChangePassword.value = false
    
    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    }
  } catch (err) {
    console.error('Password error:', err)
    passwordError.value = err.response?.data?.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

// Logout - Clear all secure storage and navigate to login
const logout = async () => {
  loggingOut.value = true

  try {
    // Call backend logout (best effort - don't block on failure)
    await authService.logout()
    console.log('✅ Logout API call successful')
  } catch (err) {
    console.error('Logout API error (ignored):', err)
    // Continue with local logout even if API call fails
  } finally {
    // Always clear all stored credentials
    await secureStorage.clearAll()
    console.log('✅ All credentials cleared')
    
    loggingOut.value = false
    alert('Logged out successfully!')
    router.push('/login')
  }
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

onMounted(() => {
  fetchProfile()
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
  margin-bottom: 8px;
  font-weight: 800;
}

.page-header p {
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
  margin: 0;
}

/* Loading/Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state p {
  font-size: 16px;
  color: #666;
  font-weight: 600;
}

.error-state p {
  font-size: 16px;
  color: #e74c3c;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-state button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

/* Profile Section */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: white;
  border-radius: 16px;
  margin: 0 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.avatar-icon {
  font-size: 40px;
  color: white;
}

.profile-info {
  text-align: center;
}

.profile-name {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
  color: #333;
}

.profile-email {
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin-bottom: 6px;
}

.profile-points {
  font-size: 16px;
  color: #42b883;
  font-weight: 800;
}

/* Settings Section */
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
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 800;
  text-align: right;
}

/* Action Buttons */
.action-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.logout-btn {
  width: calc(100% - 32px);
  margin: 0 16px;
  padding: 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 24px;
}

.logout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  font-size: 20px;
  color: #333;
  font-weight: 800;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
}

.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.save-btn {
  padding: 12px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* App Info */
.app-info {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 12px;
  font-weight: 600;
}

.app-info p {
  margin: 4px 0;
}
</style>
