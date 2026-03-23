<template>
  <div class="account-setup-page">
    <div class="setup-container">
      <!-- Welcome Header -->
      <div class="setup-header">
        <div class="icon-wrapper">
          <span class="material-icons setup-icon">person_add</span>
        </div>
        <h1>Complete Your Profile</h1>
        <p>Welcome to JuanCharge! Please tell us a bit more about yourself to get started.</p>
      </div>

      <!-- Setup Form -->
      <div class="form-card">
        <form @submit.prevent="handleSetup">
          <div class="form-section">
            <label>First Name</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">person_outline</span>
              <input
                v-model="form.first_name"
                type="text"
                placeholder="Enter your first name"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-section">
            <label>Last Name</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">person</span>
              <input
                v-model="form.last_name"
                type="text"
                placeholder="Enter your last name"
                required
                :disabled="loading"
              />
            </div>
          </div>



          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="material-icons spin">refresh</span>
            <span v-else>Finish Setup</span>
          </button>
        </form>
      </div>

      <!-- Skip / Logout Option -->
      <div class="footer-actions">
        <button class="logout-link" @click="handleLogout">
          Not you? Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import { secureStorage } from "@/services/secureStorage";
import { normalizeAuthUser } from "@/services/authUser";
import Swal from "sweetalert2";

const router = useRouter();
const loading = ref(false);
const error = ref(null);

const form = reactive({
  first_name: "",
  last_name: "",
  phone: "",
});

onMounted(async () => {
    // Pre-fill if some data already exists
    const userData = await secureStorage.getUserData();
    if (userData) {
        form.first_name = userData.first_name || "";
        form.last_name = userData.last_name || "";
        form.phone = userData.phone || userData.phone_number || "";
    }
});

const handleSetup = async () => {
  if (!form.first_name || !form.last_name) {
    error.value = "Please enter your full name";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await authService.updateProfile(form);
    
    // Update local user data
    const currentUser = await secureStorage.getUserData() || {};
    const updatedUser = { 
        ...currentUser, 
        ...form,
        // Ensure backend returned data is preferred if provided
        ...(response.data.user || response.data.data || {})
    };
    await secureStorage.setUserData(
      normalizeAuthUser(updatedUser, response.data)
    );

    await Swal.fire({
      title: "Success!",
      text: "Your profile is all set!",
      icon: "success",
      confirmButtonColor: "#42b883",
      timer: 2000,
    });

    router.push("/home");
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Failed to update profile";
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
    await secureStorage.clearAll();
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
    await secureStorage.clearAll();
    router.push("/login");
  }
};
</script>

<style scoped>
.account-setup-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 40px 20px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}

.setup-container {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.setup-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setup-icon {
  font-size: 40px;
  color: #42b883;
}

h1 {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.setup-header p {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
}

.form-card {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: var(--bg-tertiary);
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
}

input:focus {
  background: var(--bg-secondary);
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 22px;
}

.submit-btn {
  width: 100%;
  padding: 18px;
  background: #2b2b2b;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 12px;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #999;
}

.error-message {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
}

.footer-actions {
  text-align: center;
  margin-top: 20px;
}

.logout-link {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

[data-theme="dark"] .submit-btn {
  background: #42b883;
}
</style>
