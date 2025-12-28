<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Back Button -->
      <div class="header-nav">
        <button class="back-btn" @click="goBack">
          <span class="material-icons">chevron_left</span>
          Back
        </button>
      </div>

      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img src="/logo.png" alt="JuanCharge Logo" class="logo" />
        </div>
        <h1>{{ step === 1 ? "Welcome" : "Check your messages" }}</h1>
        <p v-if="step === 1">Enter your email or mobile number to continue</p>
        <p v-else>
          We sent a 6-digit code to <strong>{{ form.identifier }}</strong>
        </p>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <form @submit.prevent="handleSubmit">
          <!-- STEP 1: IDENTITY -->
          <div v-if="step === 1">
            <div class="form-section">
              <label>Email or Mobile Number</label>
              <div class="input-wrapper">
                <span class="material-icons field-icon">person_outline</span>
                <input
                  v-model="form.identifier"
                  type="text"
                  placeholder="e.g. name@email.com or 09123456789"
                  required
                  :disabled="loading"
                />
              </div>
            </div>
          </div>

          <!-- STEP 2: OTP -->
          <div v-else>
            <div class="form-section">
              <label>Verification Code</label>
              <div class="input-wrapper">
                <span class="material-icons field-icon">lock_clock</span>
                <input
                  v-model="form.code"
                  type="text"
                  placeholder="123456"
                  required
                  maxlength="6"
                  class="otp-input"
                  :disabled="loading"
                  autofocus
                />
              </div>
              <div class="resend-wrapper">
                <span v-if="!resendAvailable"
                  >Resend code in {{ resendTimer }}s</span
                >
                <button
                  v-else
                  type="button"
                  @click="startOtpProcess"
                  class="resend-btn"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="material-icons spin">refresh</span>
            <span v-else>{{ step === 1 ? "Continue" : "Verify & Login" }}</span>
          </button>

          <!-- Edit Number (Step 2 only) -->
          <button
            v-if="step === 2"
            type="button"
            class="change-number-btn"
            @click="step = 1"
          >
            Change email or mobile number
          </button>
        </form>
      </div>

      <!-- Footer Info -->
      <div class="footer-info">
        <p>
          <span class="material-icons small-icon">verified_user</span>
          {{ step === 1 ? "Secure Passwordless Login" : "Secure Verification" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import { secureStorage } from "@/services/secureStorage";

const router = useRouter();

const step = ref(1);
const loading = ref(false);
const error = ref(null);

// Form Data
const form = reactive({
  identifier: "",
  code: "",
});

// Resend Logic
const resendTimer = ref(30);
const resendAvailable = ref(false);
let timerInterval = null;

const goBack = () => {
  if (step.value === 2) {
    step.value = 1;
  } else {
    router.back();
  }
};

const startTimer = () => {
  resendTimer.value = 30;
  resendAvailable.value = false;
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (resendTimer.value > 0) {
      resendTimer.value--;
    } else {
      resendAvailable.value = true;
      clearInterval(timerInterval);
    }
  }, 1000);
};

const handleSubmit = () => {
  if (step.value === 1) {
    startOtpProcess();
  } else {
    verifyCode();
  }
};

const startOtpProcess = async () => {
  if (!form.identifier) {
    error.value = "Please enter your email or mobile number";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await authService.startOtp(form.identifier);
    if (response.data.success) {
      step.value = 2;
      startTimer();
    }
  } catch (err) {
    error.value = err.message || "Failed to send verification code";
  } finally {
    loading.value = false;
  }
};

const verifyCode = async () => {
  if (!form.code || form.code.length < 4) {
    error.value = "Please enter a valid code";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await authService.verifyOtp(form.identifier, form.code);

    if (response.data.success) {
      // Store tokens
      await secureStorage.setDeviceToken("mock-device-token"); // In real flow, get from resp
      await secureStorage.setApiToken(response.data.api_token);
      await secureStorage.setUserData(response.data.user);
      await secureStorage.setTokenExpiresAt(response.data.token_expires_at);

      // Navigate
      if (response.data.should_update_profile) {
        // Redirection logic: even if profile update needed, user prefers home for now
        // But normally if profile incomplete, settings is better.
        // User explicitly asked for home redirect on logging in.
        // I will respect the user request to redirect to Home.
        router.push("/home");
      } else {
        router.push("/home");
      }
    }
  } catch (err) {
    error.value =
      err.response?.data?.message || "Invalid code. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 20px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-container {
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header-nav {
  margin-bottom: 20px;
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

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo-wrapper {
  width: 80px;
  height: 80px;
  background: var(--bg-secondary);
  border-radius: 16px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.logo {
  width: 50px;
  height: 50px;
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
  font-size: 15px;
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.4;
}

/* Card */
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

.otp-input {
  letter-spacing: 4px;
  font-weight: 700;
  font-size: 20px;
}

.field-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 22px;
}

.resend-wrapper {
  text-align: right;
  margin-top: 12px;
  font-size: 13px;
  color: #777;
}

.resend-btn {
  background: none;
  border: none;
  color: #42b883;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 18px;
  background: #2b2b2b; /* Dark button for high contrast */
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
  transition: transform 0.1s;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #999;
}

.change-number-btn {
  background: none;
  border: none;
  color: #777;
  font-size: 14px;
  width: 100%;
  margin-top: 20px;
  cursor: pointer;
  text-decoration: underline;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

/* Footer */
.footer-info {
  text-align: center;
  margin-top: auto;
  padding-bottom: 20px;
}

.footer-info p {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #888;
  font-size: 13px;
  font-weight: 500;
}

.small-icon {
  font-size: 16px;
  color: #42b883;
}
</style>
