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
        >
          <span class="material-icons">photo_camera</span>
          Start Scanning
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
      <div class="scanner-container">
        <div class="camera-frame">
            <div class="scan-area">
                <div class="corner top-left"></div>
                <div class="corner top-right"></div>
                <div class="corner bottom-left"></div>
                <div class="corner bottom-right"></div>
                <div class="scan-line" v-if="!cameraError && currentState === 'scanning'"></div>
            </div>

            <qrcode-stream
                v-if="!cameraError"
                @detect="onDetect"
                @error="onError"
                :paused="paused"
                class="qr-stream"
            >
                <div v-if="loading" class="camera-placeholder">
                    <div class="camera-icon">⌛</div>
                    <p>Initializing camera...</p>
                </div>
            </qrcode-stream>

             <div v-if="cameraError" class="camera-placeholder error">
                <div class="camera-icon">❌</div>
                <p>{{ cameraError }}</p>
                <button @click="retryCamera">Retry</button>
            </div>

            <button class="cancel-scan-btn overlay-cancel" @click="stopScanning">
                <span class="material-icons">close</span>
                Cancel
            </button>
        </div>
      </div>
    </div>

     <!-- STATE: SUCCESS/ERROR MESSAGE -->
    <div v-if="currentState === 'result'" class="result-state">
       <div v-if="successMessage" class="success-message">
            <h2>🎉 Success!</h2>
            <p>{{ successMessage }}</p>
            <div class="points-earned">+{{ pointsEarned }} Points</div>
            <button @click="resetScan" class="primary-btn">Scan Another</button>
        </div>

        <div v-if="errorMessage" class="error-message">
            <h2>⚠️ Error</h2>
            <p>{{ errorMessage }}</p>
            <button @click="resetScan" class="dgr-btn">Try Again</button>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { QrcodeStream } from "vue-qrcode-reader";
import axios from 'axios';
// sessionState not defined in the snippet given, assuming it might be needed for active sessions
// If sessionState is not used, we can remove imports or add placeholder.
// For now, I will keep local state to make the component functional standalone.

const router = useRouter();

// State Management
const currentState = ref("landing"); // landing, scanning, redeeming, result
const pointsBalance = ref(43); // Mock for now
const pointsToRedeem = ref("");
const scannedPort = ref("");
const manualKioskId = ref("");
const showManualInput = ref(false);

const loading = ref(false);
const cameraError = ref(null);
const paused = ref(false);

// Result State
const successMessage = ref("");
const errorMessage = ref("");
const pointsEarned = ref(0);


// Computed
const energyValue = computed(() => pointsBalance.value * 0.1);

// --- CAM & QR LOGIC ---

function startScanning() {
    currentState.value = 'scanning';
    paused.value = false;
    cameraError.value = null;
    successMessage.value = '';
    errorMessage.value = '';
}

function stopScanning() {
    currentState.value = 'landing';
    paused.value = false;
}

function retryCamera() {
    cameraError.value = null;
    paused.value = false;
}

function onError(err) {
    cameraError.value = err.message;
}

async function onDetect(detectedCodes) {
    if (detectedCodes.length === 0) return;

    const result = detectedCodes[0];
    const rawValue = result.rawValue;

    // Pause scanning immediately
    paused.value = true;
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    console.log('Scanned:', rawValue);

    try {
        // DECISION LOGIC: Is this a PORT QR (active charging) or a VOUCHER QR (offline points)?
        // Simple heuristic: If it parses as JSON with 'kiosk_code' and 'signature', it's a voucher.
        // Otherwise, assume it's a port ID string for redemption.

        let isVoucher = false;
        let voucherPayload = {};

        try {
            const parsed = JSON.parse(rawValue);
            if (parsed.kiosk_code && parsed.signature) {
                isVoucher = true;
                voucherPayload = parsed;
            }
        } catch (e) {
            // Not JSON
        }

        if (isVoucher) {
            // >>> CLAIM VOUCHER FLOW
            await claimVoucher(voucherPayload);
        } else {
            // >>> REDEEM CHARGING FLOW
            // Assume rawValue is the port ID e.g., "KIOSK-001-PORT-1"
            scannedPort.value = rawValue;
            currentState.value = 'redeeming';
        }

    } catch (err) {
        console.error(err);
        errorMessage.value = err.message || 'Failed to process QR code';
        currentState.value = 'result';
    } finally {
        loading.value = false;
    }
}

async function claimVoucher(payload) {
    // Get Auth Token
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('Please login to claim points');
    }

    const apiBase = 'http://localhost:8000/api'; // Replace with env var in prod

    // Claim Signed Voucher
    const response = await axios.post(`${apiBase}/mobile/vouchers/claim-signed`, payload, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
        successMessage.value = 'Points claimed successfully!';
        pointsEarned.value = response.data.data.points_earned;
        currentState.value = 'result';
        // Optionally update global points balance here
    } else {
         throw new Error(response.data.message || 'Failed to claim');
    }
}

function resetScan() {
    successMessage.value = '';
    errorMessage.value = '';
    paused.value = false;
    currentState.value = 'landing';
}


// --- MANUAL ENTRY LOGIC ---

const handleManualEntry = async () => {
    if (manualKioskId.value.trim()) {
        const input = manualKioskId.value.trim();
        // Simulate scan
        await onDetect([{ rawValue: input }]);
        manualKioskId.value = '';
        showManualInput.value = false;
    }
};

// --- REDEMPTION LOGIC ---

const appendNumber = (num) => {
  // Prevent leading zeros unless it's just '0'
  const currentValStr = pointsToRedeem.value.toString();
  if (currentValStr === '0') {
      pointsToRedeem.value = num.toString();
  } else {
      const newVal = currentValStr + num.toString();
       if (parseInt(newVal) <= pointsBalance.value) {
        pointsToRedeem.value = newVal;
      }
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

const handleRedeem = async () => {
    // Implement API call for charging redemption
    alert(`Redeeming ${pointsToRedeem.value} points for charging on ${scannedPort.value}`);
    // Reset or navigate
    currentState.value = 'landing';
    pointsToRedeem.value = "";
};

</script>

<style scoped>
.scan-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* Landing Page Styles */
.landing-state {
  padding: 1rem;
}

.white-header {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.white-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.white-header p {
  color: #666;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.landing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Preview Box Animation */
.qr-preview-box {
  background: white;
  width: 160px;
  height: 160px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  position: relative;
}

.qr-preview-box::after {
  content: '';
  position: absolute;
  top: -5px; right: -5px; bottom: -5px; left: -5px;
  border: 2px dashed #4CAF50;
  border-radius: 24px;
  animation: spin 10s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.qr-large-icon {
  font-size: 4rem;
  color: #1a1a1a;
}

.status-label {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.instruction-text {
  text-align: center;
  color: #666;
  max-width: 260px;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Main Action Button */
.start-scan-btn {
  background: #1a1a1a;
  color: white;
  width: 100%;
  max-width: 320px;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
}

.start-scan-btn:active {
  transform: scale(0.98);
}

/* Manual Input Section */
.manual-section {
  margin-top: 1rem;
}

.text-link-btn {
  background: none;
  border: none;
  color: #666;
  text-decoration: underline;
  font-size: 0.9rem;
}

.manual-input-box {
  width: 100%;
  max-width: 320px;
  margin-top: 1rem;
}

.manual-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  outline: none;
}

.manual-field:focus {
  border-color: #4CAF50;
}

.manual-actions {
  display: flex;
  gap: 0.5rem;
}

.manual-submit-btn, .manual-cancel-btn {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
}

.manual-submit-btn {
  background: #4CAF50;
  color: white;
}

.manual-cancel-btn {
  background: #f1f3f5;
  color: #666;
}

/* Info Cards */
.info-cards {
  margin-top: 2rem;
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-card {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.yellow-card {
  background: #FFF9C4; /* Light Yellow */
}

.green-card {
  background: #DCEDC8; /* Light Green */
}

.card-icon-box {
  background: rgba(255,255,255,0.6);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
}

.card-text p {
  margin: 0;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.4;
}

.card-text ol {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  color: #555;
}

/* Scanner Overlay */
.scanning-state {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: black;
    z-index: 999;
}

.scanner-container {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.camera-frame {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.qr-stream {
    width: 100%;
    height: 100%;
}

.scan-area {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 250px;
    height: 250px;
    border: 2px solid rgba(255,255,255,0.3);
    z-index: 10;
    pointer-events: none;
}

.scan-line {
    width: 100%;
    height: 2px;
    background: #00ff00;
    animation: scan 2s infinite;
    box-shadow: 0 0 10px #00ff00;
}

@keyframes scan {
    0% { transform: translateY(0); }
    100% { transform: translateY(250px); }
}

.overlay-cancel {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.4);
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 30px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.camera-placeholder {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    color: white;
}

.camera-placeholder.error {
    background: #2a1a1a;
    padding: 2rem;
    text-align: center;
}

/* Result State */
.result-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    height: 100vh;
}

.success-message {
    text-align: center;
}

.success-message h2 {
    color: #4CAF50;
    font-size: 2rem;
}

.points-earned {
    font-size: 3rem;
    font-weight: bold;
    color: #FF9800;
    margin: 1rem 0;
}

.primary-btn {
    background: #1a1a1a;
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    border: none;
    font-size: 1.1rem;
    margin-top: 1rem;
}

.error-message h2 {
    color: #F44336;
}

/* Redemption State (Simplified for brevity, can be expanded) */
.redeem-state {
    padding: 1rem;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.redeem-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-nav-btn {
    background: white;
    border: 1px solid #eee;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
}

.metric-card {
    background: white;
    padding: 1rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
}

.conversion-row {
    background: white;
    padding: 1rem;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
}

.keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    max-width: 320px;
    margin: 0 auto;
}

.key-btn {
    padding: 1.2rem;
    border: none;
    background: white;
    border-radius: 16px;
    font-size: 1.25rem;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.key-btn:active {
    background: #f0f0f0;
}

.final-redeem-btn {
    margin-top: 2rem;
    background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
    color: white;
    width: 100%;
    padding: 1.2rem;
    border-radius: 16px;
    border: none;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.final-redeem-btn:disabled {
    opacity: 0.6;
    background: #ccc;
}
</style>
