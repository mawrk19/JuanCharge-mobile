<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Back Button -->
      <div class="header-nav">
        <button class="back-btn" @click="router.back()">
          <span class="material-icons">chevron_left</span>
          Back
        </button>
      </div>

      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img src="/logo.png" alt="JuanCharge Logo" class="logo" />
        </div>
        <h1>Create Your Account</h1>
        <p>Join the JuanCharge community</p>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form @submit.prevent="handleRegister">
          <!-- Name Fields -->
          <div class="form-section">
            <label>Your Name</label>
            <div class="row">
              <input
                v-model="form.first_name"
                type="text"
                placeholder="First Name"
                required
                :disabled="loading"
                class="half-width"
              />
              <input
                v-model="form.last_name"
                type="text"
                placeholder="Last Name"
                required
                :disabled="loading"
                class="half-width"
              />
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-section">
            <label>Email Address</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">mail_outline</span>
              <input
                v-model="form.email"
                type="email"
                placeholder="Your Email Address"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-section">
            <label>Password</label>
            <div class="input-wrapper">
              <span class="material-icons field-icon">lock</span>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="******************"
                required
                :disabled="loading"
              />
              <!-- Toggle Visibility hidden/shown by design, keeping functionality if user clicks icon? 
                   Design shows dots. I'll make the whole row clickable or add end icon if needed.
                   For now, sticking to clean design, maybe no toggle or subtle one.
                   I will add a subtle toggle at the end for ux.
              -->
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? "Creating Account..." : "Create Account & Continue" }}
          </button>

          <!-- Auto-Login Info -->
          <div class="info-box">
            <div class="info-icon">
              <span class="material-icons">lock_open</span>
            </div>
            <div class="info-text">
              <strong>Auto-Login Feature</strong>
              <p>
                Your device will be automatically logged in. You won't need to
                sign in again!
              </p>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <p class="terms-footer">
        By creating an account, you agree to our
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";

const router = useRouter();

const form = reactive({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref(null);

const handleRegister = async () => {
  loading.value = true;
  error.value = null;

  // Prepare payload - add missing fields expected by backend
  const payload = {
    ...form,
    password_confirmation: form.password, // Auto-confirm
    contact: "", // Empty contact as it matches "HBO style" minimal info
  };

  try {
    const response = await authService.register(payload);

    if (response.data && response.data.success) {
      // Logic from original file to handle auto-login
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // If backend didn't return token (some just return success), try login
      if (!response.data.token) {
        try {
          const loginResp = await authService.login({
            email: form.email,
            password: form.password,
          });
          if (loginResp.data?.success && loginResp.data.token) {
            localStorage.setItem("auth_token", loginResp.data.token);
            if (loginResp.data.user)
              localStorage.setItem("user", JSON.stringify(loginResp.data.user));

            // Redirect
            if (loginResp.data.should_update_profile) {
              router.push("/settings");
            } else {
              router.push("/home");
            }
            return;
          }
        } catch (le) {
          console.warn("Auto-login after register failed:", le);
        }
      } else {
        // Token was returned directly
        if (response.data.should_update_profile) {
          router.push("/settings");
        } else {
          router.push("/home");
        }
      }
    } else {
      error.value = response.data?.message || "Registration failed";
    }
  } catch (err) {
    console.error("Register error:", err);
    const resp = err.response?.data;
    if (resp) {
      if (resp.errors) {
        const first = Object.values(resp.errors)
          .map((v) => v[0])
          .join(" ");
        error.value = first;
      } else {
        error.value = resp.message || "Registration failed";
      }
    } else {
      error.value = "Registration failed";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  overflow-y: auto;
  position: fixed;
  top: var(--app-safe-top, 12px);
  left: 0;
  right: 0;
  bottom: 0;
}

.register-container {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-nav {
  margin-bottom: 0px;
}

.back-btn {
  background: none;
  border: none;
  color: #2b7fff;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
}

.logo-section {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
}

.logo-wrapper {
  width: 100px;
  height: 100px;
  background: var(--bg-secondary);
  border-radius: 20px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.logo-section p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Card */
.form-card {
  background: var(--bg-secondary);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 20px;
}

.form-section label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.row {
  display: flex;
  gap: 12px;
}

.half-width {
  width: 50%;
}

input {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}

input:focus {
  box-shadow: 0 0 0 2px #42b883; /* Green focus ring */
  background: var(--bg-secondary);
}

/* Input with Icon */
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  padding-left: 44px; /* Space for icon */
}

.field-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #555;
  font-size: 20px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: #55b560; /* Green from design */
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(85, 181, 96, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Info Box */
.info-box {
  background: rgba(43, 127, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon {
  width: 24px;
  height: 24px;
  background: #1976d2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-icon .material-icons {
  font-size: 14px;
  color: white;
}

.info-text strong {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.info-text p {
  margin: 0;
  font-size: 12px;
  color: #2b7fff;
  line-height: 1.4;
}

/* Error */
.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  text-align: center;
}

/* Footer */
.terms-footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: auto;
  line-height: 1.5;
  padding-bottom: 20px;
}

.terms-footer a {
  color: #2b7fff;
  text-decoration: none;
}
</style>
