<template>
  <div class="splash-screen">
    <div class="splash-content">
      <div class="logo">⚡</div>
      <h1>JuanCharge</h1>
      <div class="loading-spinner"></div>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/apiServices";
import { secureStorage } from "@/services/secureStorage";

const router = useRouter();
const statusMessage = ref("Checking credentials...");

onMounted(async () => {
  await checkAutoLogin();
});

async function checkAutoLogin() {
  try {
    // 1. Check if we already have a valid API token (already logged in)
    const apiToken = await secureStorage.getApiToken();
    const hasValidApiToken = await secureStorage.hasValidCredentials();
    console.log(
      "[DEBUG] Startup - Stored API token:",
      apiToken,
      "Valid:",
      hasValidApiToken
    );

    if (apiToken && hasValidApiToken) {
      console.log(
        "[DEBUG] Already logged in with valid token, skipping auto-login"
      );
      statusMessage.value = "Welcome back!";
      
      const userData = await secureStorage.getUserData();
      if (!userData?.first_name || !userData?.last_name) {
        setTimeout(() => router.push("/account-setup"), 500);
      } else {
        setTimeout(() => router.push("/home"), 500);
      }
      return;
    }

    // 2. If no valid API token, check if we have a device token for auto-login
    const deviceToken = await secureStorage.getDeviceToken();
    console.log("[DEBUG] Startup - Stored device token:", deviceToken);

    if (!deviceToken) {
      console.log("[DEBUG] No device token found, redirecting to get-started");
      statusMessage.value = "Welcome!";
      setTimeout(() => router.push("/get-started"), 500);
      return;
    }

    // 3. Try auto-login with device token
    statusMessage.value = "Authenticating...";
    console.log("[DEBUG] Attempting auto-login with device token...");

    try {
      const response = await authService.autoLogin(deviceToken);
      console.log("[DEBUG] Auto-login response:", response.data);

      if (response.data.success) {
        await secureStorage.setApiToken(response.data.api_token);
        await secureStorage.setUserData(response.data.user);
        await secureStorage.setTokenExpiresAt(response.data.token_expires_at);

        console.log("✅ Auto-login successful");
        statusMessage.value = "Welcome back!";
        
        const user = response.data.user;
        if (!user?.first_name || !user?.last_name) {
          setTimeout(() => router.push("/account-setup"), 500);
        } else {
          setTimeout(() => router.push("/home"), 500);
        }
      } else {
        console.warn("[DEBUG] Auto-login failed (not success):", response.data);
        statusMessage.value = "Session expired";
        await secureStorage.clearAll();
        setTimeout(() => router.push("/get-started"), 500);
      }
    } catch (apiError) {
      console.error("[DEBUG] Auto-login API error:", apiError.message);
      // If we are offline but have a token, maybe try to let them in anyway?
      if (apiToken) {
        statusMessage.value = "Offline mode";
        setTimeout(() => router.push("/home"), 1000);
      } else {
        statusMessage.value = "Connection error";
        setTimeout(() => router.push("/get-started"), 1000);
      }
    }
  } catch (error) {
    console.error("[DEBUG] Fatal startup error:", error);
    statusMessage.value = "App Error";
    setTimeout(() => router.push("/get-started"), 2000);
  }
}
</script>

<style scoped>
.splash-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  text-align: center;
  color: white;
}

.logo {
  font-size: 100px;
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

h1 {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

p {
  font-size: 16px;
  opacity: 0.9;
}
</style>
