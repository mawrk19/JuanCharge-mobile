<template>
  <div class="scan-wrapper">
    <!-- STATE 1: LANDING PAGE -->
    <div v-if="currentState === 'landing'" class="landing-state">
      <div class="page-header white-header">
        <h1>Scan QR Code</h1>
        <p>Scan to charge your device</p>
      </div>

      <div class="landing-content">
        <div class="qr-preview-box">
          <div class="qr-box-inner">
            <span class="material-icons qr-large-icon">qr_code_2</span>
          </div>
        </div>

        <h2 class="status-label">Ready to Scan</h2>
        <p class="instruction-text">
          Point your camera at the QR code on the charging port to start your
          session
        </p>

        <button
          class="start-scan-btn"
          @click="startScanning"
          :class="{ 'btn-disabled': !!sessionState.activeSession }"
        >
          <span class="material-icons">{{
            sessionState.activeSession ? "bolt" : "photo_camera"
          }}</span>
          {{
            sessionState.activeSession
              ? "Charging in Progress"
              : "Start Scanning"
          }}
        </button>

        <div class="manual-section" v-if="!showManualInput">
          <button class="text-link-btn" @click="showManualInput = true">
            Trouble scanning? Enter ID manually
          </button>
        </div>

        <div class="manual-input-box" v-else>
          <input
            type="text"
            v-model="manualKioskId"
            placeholder="Enter Kiosk ID (e.g. kiosk-123)"
            class="manual-field"
          />
          <div class="manual-actions">
            <button class="manual-submit-btn" @click="handleManualEntry">
              Continue
            </button>
            <!-- <button class="simulate-btn" @click="simulateSpecificScan">
              Simulate Scan
            </button> -->
            <button class="manual-cancel-btn" @click="showManualInput = false">
              Cancel
            </button>
          </div>
        </div>

        <div class="info-cards">
          <!-- Charging Rates Card -->
          <div class="info-card yellow-card">
            <div class="card-icon-box">
              <span class="material-icons">bolt</span>
            </div>
            <div class="card-text">
              <h4>Charging Rates</h4>
              <p>PET Bottle/Tin Can = 1 Point</p>
              <p>Aluminum Can = 1.5 Points</p>
            </div>
          </div>

          <!-- How to Scan Card -->
          <div class="info-card green-card">
            <div class="card-icon-box">
              <span class="material-icons">qr_code_scanner</span>
            </div>
            <div class="card-text">
              <h4>How to Scan</h4>
              <ol>
                <li>Find a kiosk with available port</li>
                <li>Scan the port's QR code</li>
                <li>Connect your device and charge!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STATE 2: SCANNING OVERLAY -->
    <div v-if="currentState === 'scanning'" class="scanning-state">
      <div id="qr-reader" class="full-screen-scanner"></div>

      <!-- Visual overlay - does not block video -->
      <div class="visual-overlay">
        <div class="scan-frame" :class="{ 'qr-detected': qrDetected }">
          <div class="corners">
            <!-- <div class="corner-item top-left"></div>
            <div class="corner-item top-right"></div>
            <div class="corner-item bottom-left"></div>
            <div class="corner-item bottom-right"></div> -->
          </div>
          <div class="scan-line"></div>

          <!-- Detection indicator -->
          <div v-if="qrDetected" class="detection-pulse">
            <span class="material-icons">check_circle</span>
            <p>QR Code Detected!</p>
          </div>
        </div>

        <div class="scanning-info">
          <p class="guide-text">Position QR code within the frame</p>
          <p class="status-subtext">
            {{ qrDetected ? "Processing..." : "Scanning port QR code..." }}
          </p>
        </div>

        <button class="cancel-scan-btn" @click="stopScanning">
          <span class="material-icons">close</span>
          Cancel
        </button>
      </div>
    </div>

    <!-- STATE 3: REDEMPTION/CONVERSION -->
    <div v-if="currentState === 'redeeming'" class="redeem-state">
      <div class="redeem-header">
        <button class="back-nav-btn" @click="currentState = 'landing'">
          <span class="material-icons">chevron_left</span>
        </button>
        <div class="header-titles">
          <h1>Charging Session</h1>
          <p>{{ scannedPort || "Port-1" }}</p>
        </div>
      </div>

      <div class="redeem-content">
        <!-- Metric Cards -->
        <div class="metrics-grid">
          <div class="metric-card">
            <label>Available Points</label>
            <div class="metric-value">{{ pointsBalance }}</div>
          </div>
          <div class="metric-card">
            <label>Energy Value</label>
            <div class="metric-value">{{ energyValue.toFixed(1) }} Wh</div>
          </div>
        </div>

        <!-- Conversion Row -->
        <div class="conversion-row">
          <div class="conv-item">
            <label>Points to Convert</label>
            <div class="conv-val">{{ pointsToRedeem || "0" }}</div>
          </div>
          <div class="conv-item green-val">
            <label>Energy</label>
            <div class="conv-val">
              {{ (pointsToRedeem * 0.1).toFixed(1) }} Wh
            </div>
          </div>
          <div class="conv-item yellow-val">
            <label>Time</label>
            <div class="conv-val">{{ pointsToRedeem || 0 }} mins</div>
          </div>
        </div>

        <!-- Keypad -->
        <div class="keypad">
          <button
            v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="num"
            class="key-btn"
            @click="appendNumber(num)"
          >
            {{ num }}
          </button>
          <button class="key-btn clear-text" @click="clearPoints">CLEAR</button>
          <button class="key-btn" @click="appendNumber(0)">0</button>
          <button class="key-btn backspace-btn" @click="backspace">
            <span class="material-icons">west</span>
          </button>
        </div>

        <!-- Presets -->
        <div class="presets-row">
          <button
            v-for="preset in [10, 50, 100, 500]"
            :key="preset"
            class="preset-key"
            @click="addPreset(preset)"
          >
            {{ preset }}
          </button>
        </div>

        <button
          class="final-redeem-btn"
          @click="handleRedeem"
          :disabled="!pointsToRedeem || pointsToRedeem > pointsBalance"
        >
          <span class="material-icons">bolt</span>
          Redeem for charging
        </button>

        <!-- Information Tables -->
        <div class="info-tables">
          <div class="how-it-works shadow-sm">
            <div class="info-title">
              <span class="material-icons">info</span>
              How It Works?
            </div>
            <div class="info-body">
              <p>Base: 1 pt = 0.1 Wh = 1 min</p>
              <p>Port: 5V x 2A = 10W</p>
              <p>Min: 10 points = 1 Wh = 10 mins</p>
            </div>
          </div>

          <div class="item-conversion shadow-sm">
            <div class="info-title">
              <span class="material-icons">recycling</span>
              Item Conversion
            </div>
            <table class="conv-table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>PTS</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PET Bottle</td>
                  <td>1</td>
                  <td>1 min</td>
                </tr>
                <tr>
                  <td>Aluminum Can</td>
                  <td>1</td>
                  <td>1 min</td>
                </tr>
                <tr>
                  <td>Tin Can</td>
                  <td>1.5</td>
                  <td>1.5 mins</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- STATE 4: ACTIVE CHARGING SESSION -->
    <div v-if="currentState === 'active-session'" class="active-session-state">
      <div class="session-card">
        <div class="charging-icon-wrapper">
          <!-- Circular progress ring -->
          <svg class="progress-ring" width="100" height="100">
            <circle
              class="progress-ring-bg"
              stroke="#e0e0e0"
              stroke-width="6"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              class="progress-ring-circle"
              :stroke="timerColor"
              stroke-width="6"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
              :style="{ strokeDashoffset: progressOffset }"
            />
          </svg>

          <div class="charging-icon">
            <span class="material-icons battery-icon"
              >battery_charging_full</span
            >
          </div>
        </div>

        <h2 class="session-title">Charging In Progress</h2>
        <p class="port-label">{{ scannedPort || "Port 1" }}</p>

        <div class="session-stats">
          <div class="stat-row">
            <span class="stat-label">Time Remaining</span>
            <span class="stat-value">{{ formatTime(timeRemaining) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Points Used</span>
            <span class="stat-value">{{ sessionPointsUsed }} pts</span>
          </div>
        </div>

        <button class="extend-btn" @click="showExtendOptions = true">
          <span class="material-icons">add_circle</span>
          Extend Time (+1 pt)
        </button>

        <button class="end-session-btn" @click="confirmEndSession">
          <span class="material-icons">close</span>
          End Session
        </button>

        <div class="safety-reminder">
          <span class="material-icons">info</span>
          <div class="reminder-text">
            <strong>Safety Reminder</strong>
            <p>Don't leave your device unattended while charging</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { Html5Qrcode } from "html5-qrcode";
import { pointsService, chargingService } from "@/services/apiServices";
import { useToast } from "@/composables/useToast";
import { sessionState, checkActiveSession } from "@/services/sessionState";

const router = useRouter();
const toast = useToast();

// State Management
const currentState = ref("landing"); // landing, scanning, redeeming, active-session
const pointsBalance = ref(43); // Mock for now
const pointsToRedeem = ref("");
const scannedPort = ref("");
const loading = ref(false);
const redeeming = ref(false);
const qrDetected = ref(false); // Visual feedback for detection

// Active Session State
const timeRemaining = ref(0); // in seconds
const sessionPointsUsed = ref(0);
const showExtendOptions = ref(false);
let sessionTimer = null;

// Computed
const energyValue = computed(() => pointsBalance.value * 0.1);

// Progress ring calculations
const totalTime = computed(() => sessionPointsUsed.value * 60);
const progressPercent = computed(() => {
  if (totalTime.value === 0) return 0;
  return (timeRemaining.value / totalTime.value) * 100;
});

const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 44; // radius = 44
  const offset = circumference - (progressPercent.value / 100) * circumference;
  return offset;
});

const timerColor = computed(() => {
  if (progressPercent.value > 50) return "#4CAF50"; // Green
  if (progressPercent.value > 20) return "#FF9800"; // Orange
  return "#F44336"; // Red
});

// QR Scanner
let html5QrCode = null;

const startScanning = async () => {
  if (sessionState.activeSession) {
    toast.warning("You already have an active charging session.");
    return;
  }
  currentState.value = "scanning";

  // Wait for Vue to render the #qr-reader element
  await nextTick();

  try {
    // 1. Basic security check
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("MEDIA_NOT_SUPPORTED");
    }

    if (html5QrCode) {
      try {
        await html5QrCode.clear();
      } catch (e) {}
    }

    html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
      fps: 20, // Higher FPS for smoother detection
      qrbox: { width: 250, height: 250 }, // Match CSS frame exactly
      aspectRatio: 1.0,
    };

    // Try starting with environment (back camera)
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("✅ QR CODE DETECTED:", decodedText);
          qrDetected.value = true; // Show visual feedback
          scannedPort.value = decodedText;

          // Small delay to show the detection animation
          setTimeout(() => {
            stopScanning();
            currentState.value = "redeeming";
          }, 500);
        },
        () => {}
      );
    } catch (envErr) {
      console.warn(
        "Back camera failed, trying any available camera...",
        envErr
      );
      // Fallback: try any available camera
      await html5QrCode.start(
        { facingMode: "user" }, // Try front if back fails
        config,
        (decodedText) => {
          console.log("✅ QR CODE DETECTED (front camera):", decodedText);
          qrDetected.value = true; // Show visual feedback
          scannedPort.value = decodedText;

          // Small delay to show the detection animation
          setTimeout(() => {
            stopScanning();
            currentState.value = "redeeming";
          }, 500);
        },
        () => {}
      );
    }
  } catch (err) {
    console.error("Camera Error:", err);
    currentState.value = "landing";

    let msg = "Camera initialization failed.";

    if (err.message === "MEDIA_NOT_SUPPORTED") {
      msg =
        "Your browser doesn't support camera access or it's blocked by security settings.";
    } else if (err.toString().includes("NotAllowedError")) {
      msg =
        "Camera permission was denied. Please allow camera access in your browser settings.";
    } else if (err.toString().includes("NotFoundError")) {
      msg = "No camera was found on this device.";
    }

    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      msg +=
        "\n\nCRITICAL: Camera access requires HTTPS unless using localhost.";
    }

    alert(msg);
  }
};

const stopScanning = async () => {
  qrDetected.value = false; // Reset detection state
  if (html5QrCode) {
    try {
      // Use getState() for reliable cleanup
      const state = html5QrCode.getState();
      if (state === 2 || state === 3) {
        // SCANNING or PAIRED
        await html5QrCode.stop();
      }
      await html5QrCode.clear();
    } catch (err) {
      console.warn("Error during scanner cleanup:", err);
    }
  }
  if (currentState.value === "scanning") {
    currentState.value = "landing";
  }
};

// Manual Fallback for testing/unsupported devices
const manualKioskId = ref("");
const showManualInput = ref(false);

const handleManualEntry = () => {
  if (sessionState.activeSession) {
    toast.warning("You already have an active charging session.");
    return;
  }
  if (manualKioskId.value.trim()) {
    scannedPort.value = manualKioskId.value;
    currentState.value = "redeeming";
  }
};

const simulateSpecificScan = () => {
  if (sessionState.activeSession) {
    toast.warning("You already have an active charging session.");
    return;
  }
  scannedPort.value = "kiosk-00:1A:2B:3C:4D:5E";
  currentState.value = "redeeming";
};
// Keypad Logic
const appendNumber = (num) => {
  const newVal = pointsToRedeem.value.toString() + num.toString();
  if (parseInt(newVal) <= pointsBalance.value) {
    pointsToRedeem.value = newVal;
  }
};

const clearPoints = () => {
  pointsToRedeem.value = "";
};

const backspace = () => {
  pointsToRedeem.value = pointsToRedeem.value.toString().slice(0, -1);
};

const addPreset = (amount) => {
  const current = parseInt(pointsToRedeem.value || 0);
  if (current + amount <= pointsBalance.value) {
    pointsToRedeem.value = (current + amount).toString();
  }
};

// API Integration
const handleRedeem = async () => {
  const points = parseInt(pointsToRedeem.value);

  if (!points || points < 10) {
    toast.warning("Minimum redemption is 10 points.");
    return;
  }

  if (points > pointsBalance.value) {
    toast.error("Insufficient points balance.");
    return;
  }

  redeeming.value = true;
  try {
    // Call service to redeem points
    const response = await chargingService.redeemPoints(
      points,
      scannedPort.value
    );

    // On success, redirect to dashboard which will pick up the active session
    if (response.data) {
      const data = response.data.data || response.data;
      const duration = data.duration_minutes || points; // Fallback to points (1 pt = 1 min)

      toast.success(
        `Charging started! You have ${duration} minutes.`,
        "Success"
      );

      // Trigger immediate global session check
      checkActiveSession();

      router.push("/home");
    }
  } catch (err) {
    console.error("Redemption failed", err);
    toast.error("Failed to start charging session. Please try again.");
  } finally {
    redeeming.value = false;
    pointsToRedeem.value = "";
  }
};

// Session Management
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} mins`;
};

const startSessionTimer = () => {
  if (sessionTimer) clearInterval(sessionTimer);

  sessionTimer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      endSession();
    }
  }, 1000);
};

const confirmEndSession = () => {
  if (confirm("Are you sure you want to end this charging session?")) {
    endSession();
  }
};

const endSession = () => {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }

  timeRemaining.value = 0;
  sessionPointsUsed.value = 0;
  scannedPort.value = "";

  // Return to landing/scanning
  currentState.value = "landing";

  alert("Charging session ended. Thank you!");
};

// Initialization
onMounted(async () => {
  try {
    const response = await pointsService.getBalance();
    pointsBalance.value = response.data.data.points_balance;
  } catch (err) {
    console.warn("Using mock points balance");
  }
});

onBeforeUnmount(() => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop();
  }
  if (sessionTimer) {
    clearInterval(sessionTimer);
  }
});
</script>

<style scoped>
.scan-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
  padding-bottom: 100px;
}

/* LANDING STATE */
.white-header {
  padding: 40px 20px 20px;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}

.white-header h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}
.white-header p {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 8px 0 0;
}

.landing-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-preview-box {
  width: 180px;
  height: 180px;
  background: #f0fff4;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0;
}

.qr-box-inner {
  color: #4caf50;
}
.qr-large-icon {
  font-size: 80px;
}

.status-label {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}
.instruction-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  max-width: 280px;
  margin-bottom: 40px;
  line-height: 1.5;
}

.start-scan-btn {
  width: 100%;
  max-width: 320px;
  padding: 16px;
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.btn-disabled {
  background: #f5f5f5 !important;
  color: #999 !important;
  border-color: #eee !important;
  cursor: not-allowed !important;
}

.info-cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 20px;
  border-radius: 20px;
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color);
}

.yellow-card {
  background: white;
  border: 1px solid #fdf6b2;
}
.green-card {
  background: white;
  border: 1px solid #def7ec;
}

.card-icon-box {
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yellow-card .card-icon-box {
  background: #fdf6b2;
  color: #facc15;
}
.green-card .card-icon-box {
  background: #def7ec;
  color: #31c48d;
}

.card-text h4 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
}
.card-text p,
.card-text li {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 2px 0;
  font-weight: 500;
}
.card-text ol {
  padding-left: 20px;
  margin: 0;
}

@keyframes scan-moving {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

/* SCANNING STATE */
.scanning-state {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 10000;
}

.full-screen-scanner {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  inset: 0;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10001;
}

.scan-frame {
  width: 250px;
  height: 250px;
  position: relative;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: transparent !important;
  box-shadow: none !important;
  top: 62px;
}

.scan-frame.qr-detected {
  background: rgba(76, 175, 80, 0.2);
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
}

.scan-frame.qr-detected .corner-item {
  border-color: #8bc34a;
  border-width: 5px;
}

.detection-pulse {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: pulse-fade 0.5s ease-in-out;
  z-index: 10;
}

.detection-pulse .material-icons {
  font-size: 48px;
  color: #4caf50;
  filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.8));
}

.detection-pulse p {
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
}

@keyframes pulse-fade {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.corner-item {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 4px solid #4caf50;
}

.top-left {
  top: 0;
  left: 0;
  border-right: 0;
  border-bottom: 0;
  border-radius: 24px 0 0 0;
}
.top-right {
  top: 0;
  right: 0;
  border-left: 0;
  border-bottom: 0;
  border-radius: 0 24px 0 0;
}
.bottom-left {
  bottom: 0;
  left: 0;
  border-right: 0;
  border-top: 0;
  border-radius: 0 0 0 24px;
}
.bottom-right {
  bottom: 0;
  right: 0;
  border-left: 0;
  border-top: 0;
  border-radius: 0 0 24px 0;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(76, 175, 80, 0.8);
  box-shadow: 0 0 8px #4caf50;
  animation: scan-moving 2s linear infinite;
  z-index: 5;
}

.ghost-qr {
  font-size: 80px;
  color: rgba(255, 255, 255, 0.1);
}

.scanning-info {
  margin-top: 80px;
  text-align: center;
}
.guide-text {
  color: white;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}
.status-subtext {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 8px 0 0;
}

.cancel-scan-btn {
  position: absolute;
  bottom: 80px;
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  pointer-events: auto;
}

/* REDEEM STATE */
.redeem-state {
  min-height: 100vh;
  background: #2d6a3e; /* Dark green background */
}

.redeem-header {
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.back-nav-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
.header-titles h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 700;
}
.header-titles p {
  font-size: 14px;
  margin: 4px 0 0;
  opacity: 0.8;
}

.redeem-content {
  background: #fdfdfd;
  border-radius: 40px 40px 0 0;
  padding: 30px 20px 40px;
  flex: 1;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: #76a07e;
  padding: 16px;
  border-radius: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.metric-card label {
  font-size: 12px;
  opacity: 0.9;
  display: block;
  margin-bottom: 4px;
}
.metric-card .metric-value {
  font-size: 24px;
  font-weight: 800;
}

.conversion-row {
  background: #1b4332;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 30px;
}

.conv-item label {
  color: white;
  opacity: 0.8;
  font-size: 10px;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: block;
}
.conv-val {
  color: white;
  font-size: 18px;
  font-weight: 800;
}
.green-val .conv-val {
  color: #8deb9d;
}
.yellow-val .conv-val {
  color: #facc15;
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.key-btn {
  padding: 16px;
  background: #4d5d4d;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
}

.clear-text {
  font-size: 14px;
  background: #3d4a3d;
}
.orange-btn {
  background: #facc15;
  color: #333;
}
.backspace-btn {
  background: #facc15;
  color: white;
}

.presets-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.preset-key {
  padding: 12px;
  background: #4d5d4d;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 700;
  font-size: 13px;
}

.text-link-btn {
  background: none;
  border: none;
  color: #4caf50;
  font-weight: 600;
  text-decoration: underline;
  margin-bottom: 20px;
  cursor: pointer;
}

.manual-input-box {
  width: 100%;
  max-width: 320px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manual-field {
  padding: 12px;
  border: 2px solid #def7ec;
  border-radius: 10px;
  font-size: 15px;
}

.manual-actions {
  display: flex;
  gap: 10px;
}

.manual-submit-btn {
  flex: 2;
  padding: 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.simulate-btn {
  flex: 2;
  padding: 10px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.manual-cancel-btn {
  flex: 1;
  padding: 10px;
  background: #eee;
  color: #666;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}

.final-redeem-btn {
  width: 100%;
  padding: 18px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.final-redeem-btn:disabled {
  opacity: 0.5;
}

.info-tables {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.how-it-works,
.item-conversion {
  background: #f3faf4;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #def7ec;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #333;
  margin-bottom: 12px;
}

.info-title .material-icons {
  font-size: 18px;
  color: #4caf50;
}

.info-body p {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
  font-weight: 500;
}

.conv-table {
  width: 100%;
  border-collapse: collapse;
}
.conv-table th {
  text-align: left;
  font-size: 11px;
  color: #999;
  padding-bottom: 8px;
}
.conv-table td {
  font-size: 12px;
  color: #555;
  padding: 6px 0;
  font-weight: 600;
}
.conv-table tr {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.conv-table tr:last-child {
  border-bottom: none;
}

/* Custom Scanner Adjustments */
:deep(#qr-reader) {
  position: absolute !important;
  inset: 0 !important;
}

:deep(#qr-reader video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

:deep(#qr-reader__scan_region) {
  border: none !important;
}

:deep(#qr-reader__dashboard),
:deep(#qr-reader__dashboard_section),
:deep(#qr-reader__dashboard_section_csr) {
  display: none !important;
}

:deep(img[alt="Camera menu symbol"]) {
  display: none !important;
}

/* ACTIVE SESSION STATE */
.active-session-state {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e88e5 0%, #43a047 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  padding-bottom: 120px;
}

.session-card {
  background: white;
  border-radius: 24px;
  padding: 40px 30px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.charging-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
  stroke-dasharray: 276.46; /* 2 * PI * 44 */
  stroke-linecap: round;
}

.charging-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.battery-icon {
  font-size: 48px;
  color: white;
}

.session-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.port-label {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.session-stats {
  width: 100%;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  color: #333;
  font-weight: 700;
}

.extend-btn {
  width: 100%;
  padding: 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.end-session-btn {
  width: 100%;
  padding: 14px;
  background: white;
  color: #e53935;
  border: 1px solid #ffebee;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.safety-reminder {
  width: 100%;
  background: #fff3e0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #ffe0b2;
}

.safety-reminder .material-icons {
  color: #ff9800;
  font-size: 20px;
}

.reminder-text {
  flex: 1;
}

.reminder-text strong {
  font-size: 13px;
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.reminder-text p {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}
</style>
