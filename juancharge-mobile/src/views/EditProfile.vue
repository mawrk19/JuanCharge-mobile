<template>
  <div class="edit-profile-page">
    <div class="header-nav">
      <button class="back-btn" @click="router.back()">
        <span class="material-icons">chevron_left</span>
        Back
      </button>
      <h1>Edit Profile</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleUpdate">
        <div class="form-section">
          <label>First Name</label>
          <div class="input-wrapper">
            <span class="material-icons field-icon">person_outline</span>
            <input
              v-model="form.first_name"
              type="text"
              placeholder="First Name"
              required
              :disabled="updating"
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
              placeholder="Last Name"
              required
              :disabled="updating"
            />
          </div>
        </div>

        <div class="form-section">
          <label>Email Address</label>
          <div class="input-wrapper">
            <span class="material-icons field-icon">mail_outline</span>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@example.com"
              :disabled="updating"
            />
          </div>
        </div>



        <div class="action-footer">
          <button type="submit" class="save-btn" :disabled="updating">
            <span v-if="!updating">Save Changes</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import Swal from "sweetalert2";

const router = useRouter();
const updating = ref(false);
const form = ref({
  first_name: "",
  last_name: "",
  email: ""
});

const fetchProfile = async () => {
  try {
    console.log("[DEBUG] EditProfile - Fetching profile...");
    const response = await authService.me();
    console.log("[DEBUG] EditProfile - Profile response:", response.data);

    const user =
      response.data.user || response.data.data || response.data || {};
    console.log("[DEBUG] EditProfile - Extracted user data:", user);

    form.value = {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || ""
    };
  } catch (err) {
    console.error("[DEBUG] EditProfile - Profile load error:", err.message);
    if (err.response) {
      console.error(
        "[DEBUG] EditProfile - Status / Data:",
        err.response.status,
        err.response.data
      );
    }
  }
};

const handleUpdate = async () => {
  updating.value = true;
  try {
    await authService.updateProfile(form.value);

    await Swal.fire({
      title: "Success!",
      text: "Your profile has been updated.",
      icon: "success",
      confirmButtonColor: "#42b883",
      timer: 2000,
      timerProgressBar: true,
    });

    router.push("/settings");
  } catch (e) {
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

onMounted(() => {
  fetchProfile();
});
</script>

<style scoped>
.edit-profile-page {
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
  padding: 0;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.form-container {
  max-width: 480px;
  margin: 0 auto;
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
}

input:focus {
  border-color: #42b883;
}

.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: 22px;
}

.action-footer {
  margin-top: 40px;
}

.save-btn {
  width: 100%;
  padding: 18px;
  background: #2b2b2b;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .save-btn {
  background: var(--accent-color);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
