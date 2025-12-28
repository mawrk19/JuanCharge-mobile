import { reactive } from "vue";
import { chargingService } from "./apiServices";
import { secureStorage } from "./secureStorage";

export const sessionState = reactive({
  activeSession: null,
  loading: false,
  lastChecked: null,
  pollingInterval: null,
  countdownInterval: null,
  remainingSeconds: 0,
  totalSeconds: 0,
});

export const checkActiveSession = async () => {
  // Guard: Don't check if we don't have a token
  const token = await secureStorage.getApiToken();
  if (!token) {
    if (sessionState.activeSession) {
      sessionState.activeSession = null;
      stopLocalCountdown();
    }
    return;
  }

  sessionState.loading = true;
  try {
    const response = await chargingService.getActiveSession();
    const resultData = response.data.data || response.data;

    // Check for active session using multiple potential fields
    if (
      resultData &&
      (resultData.active_session_id ||
        resultData.session ||
        resultData.remaining_minutes !== undefined)
    ) {
      sessionState.activeSession = resultData.session || resultData;

      // Initialize or update remaining seconds
      const mins =
        sessionState.activeSession.remaining_minutes ??
        sessionState.activeSession.remaining_time_minutes ??
        0;
      sessionState.remainingSeconds = mins * 60;
      if (sessionState.totalSeconds === 0) {
        sessionState.totalSeconds = mins * 60;
      }

      startLocalCountdown();
      console.log(
        "Global session State: Active session detected",
        sessionState.activeSession
      );
    } else {
      sessionState.activeSession = null;
      stopLocalCountdown();
    }
    sessionState.lastChecked = new Date();
  } catch (error) {
    console.error("Global session State: Error checking session", error);
    sessionState.activeSession = null;
    stopLocalCountdown();
  } finally {
    sessionState.loading = false;
  }
};

const startLocalCountdown = () => {
  if (sessionState.countdownInterval) return;

  sessionState.countdownInterval = setInterval(() => {
    if (sessionState.remainingSeconds > 0) {
      sessionState.remainingSeconds--;
    } else {
      // Small buffer or wait for next poll
    }
  }, 1000);
};

const stopLocalCountdown = () => {
  if (sessionState.countdownInterval) {
    clearInterval(sessionState.countdownInterval);
    sessionState.countdownInterval = null;
  }
  sessionState.totalSeconds = 0;
};

export const startSessionPolling = (intervalMs = 30000) => {
  if (sessionState.pollingInterval) return;

  // Initial check
  checkActiveSession();

  sessionState.pollingInterval = setInterval(checkActiveSession, intervalMs);
};

export const stopSessionPolling = () => {
  stopLocalCountdown();
  if (sessionState.pollingInterval) {
    clearInterval(sessionState.pollingInterval);
    sessionState.pollingInterval = null;
  }
};
