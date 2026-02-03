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
        <div v-if="successMessage" class="success-message-container">
            <div class="leaves-container" ref="leavesContainer"></div>
            
            <div class="success-content" ref="successContent">
                <div class="success-icon-circle">
                    <span class="material-icons">local_florist</span>
                </div>
                <h2>Thank You!</h2>
                <p class="community-msg">"Thank you for helping keep the community streets clean instead of just redeeming it."</p>
                
                <div class="points-badge">
                    <span class="plus">+</span>
                    <span class="amount">{{ pointsEarned }}</span>
                    <span class="label">Points</span>
                </div>

                <div class="impact-stat">
                    <span>You saved {{(pointsEarned * 0.05).toFixed(2)}}kg of CO2</span>
                </div>

                <button @click="resetScan" class="primary-btn glow-btn">Scan Another</button>
            </div>
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
            <div class="metric-value">{{ store.userPoints || pointsBalance }}</div>
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
import gsap from 'gsap';
import { qrSecurity } from "@/services/qrSecurity";
import { secureStorage } from "@/services/secureStorage";
import { store } from "@/services/store";
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
const leavesContainer = ref(null);
const successContent = ref(null);


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
    loading.value = true;
    errorMessage.value = '';
    // successMessage.value = ''; // Don't clear immediately if we want smooth transition, but fine here

    console.log('Scanned:', rawValue);

    try {
        // DECISION LOGIC: Is this a PORT QR (active charging) or a VOUCHER QR (offline points)?
        
        let isSignedVoucher = false;
        let voucherPayload = {};

        // 1. Try to verify as a Signed Token (JWT)
        try {
          const payload = await qrSecurity.verifyQrPayload(rawValue);
          
          // Case 1: Standard Action
          if (payload && payload.action === 'store_points') {
             isSignedVoucher = true;
             voucherPayload = payload;
          }
          // Case 2: Legacy/Alternate Format (No action, uses 'points' + 'signature')
          else if (payload && payload.points && payload.signature) {
             isSignedVoucher = true;
             // Map to expected format
             voucherPayload = {
                 ...payload,
                 action: 'store_points',
                 amount: payload.points
             };
          }
        } catch (jwtErr) {
            // Verification failed (wrong key/alg or invalid). 
            // BUT, if it is a valid JWT structure with HS256, we might want to let the Backend verify it.
            // Try to just decode it to check structure.
            const decoded = qrSecurity.decode(rawValue);
            
            if (decoded && decoded.points && decoded.signature) {
                 console.log("Found unverified voucher (likely HS256), sending to backend...");
                 isSignedVoucher = true;
                 voucherPayload = {
                     ...decoded,
                     action: 'store_points',
                     amount: decoded.points
                 };
            } else {
                 // Not a voucher we recognize
                 // console.log("Not a signed token:", jwtErr.message);
            }
        }

        // 2. Fallback: Raw JSON check (Mock/Dev support OR Legacy Signed JSON)
        if (!isSignedVoucher) {
            try {
                const parsed = JSON.parse(rawValue);
                
                // Case A: Mock with explicit flag
                if (parsed.action === 'store_points' && parsed.mock === true) {
                    isSignedVoucher = true;
                    voucherPayload = parsed;
                }
                // Case B: JSON with signature (User provided format)
                else if (parsed.action === 'store_points' && parsed.signature) {
                     isSignedVoucher = true;
                     voucherPayload = parsed;
                }
            } catch (e) { /* Not JSON */ }
        }

        if (isSignedVoucher) {
            // >>> CLAIM SIGNED POINT VOUCHER FLOW
            await claimSignedPoints(rawValue, voucherPayload);
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

async function claimSignedPoints(rawToken, payload) {
    // Get Auth Token
    const apiToken = await secureStorage.getApiToken();
    if (!apiToken) {
        throw new Error('Please login to claim points');
    }
    
    // IF MOCK: We still send to backend to verify signature, 
    // but if you want to skip backend validation for strictly local UI testing, uncomment below:
    /*
    if (payload.mock === true) {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        successMessage.value = `Stored Points: ${payload.amount}`;
        pointsEarned.value = payload.amount;
        store.addPoints(payload.amount);
        currentState.value = 'result';
        return;
    }
    */

    // REAL FLOW: Send the RAW SIGNED TOKEN to the backend
    const apiBase = import.meta.env.VITE_API_URL;

    try {
        const response = await axios.post(`${apiBase}/patron/points/claim-signed`, {
            token: rawToken,
            ...payload // Spread decoded fields (kiosk_code, txn_id, points, signature, etc.)
        }, {
            headers: { Authorization: `Bearer ${apiToken}` }
        });

        if (response.data.success) {
            successMessage.value = `Stored Points: ${payload.amount}`;
            pointsEarned.value = payload.amount;
            // Update local balance (ideally fetch fresh from backend, but incrementing here provides instant feedback)
            // If backend returns new balance, use that. Otherwise, increment.
            if (response.data.new_balance) {
                 store.setPoints(response.data.new_balance);
            } else {
                 store.addPoints(payload.amount);
            }
            currentState.value = 'result';
            
            // Trigger Animation
            setTimeout(() => {
                animateSuccess();
            }, 100);

        } else {
             throw new Error(response.data.message || 'Failed to claim points');
        }
    } catch (err) {
         throw new Error(err.response?.data?.message || err.message || 'Failed to claim points');
    }
}

// Deprecated/Legacy method (kept just in case or can be removed)
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

const animateSuccess = () => {
    // Animate Content Entry
    gsap.fromTo(successContent.value, 
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
    );

    // Create Leaves
    const container = leavesContainer.value;
    if (!container) return;
    
    // Clear previous
    container.innerHTML = '';

    const leafCount = 20;
    const colors = ['#4CAF50', '#81C784', '#A5D6A7', '#66BB6A'];

    for (let i = 0; i < leafCount; i++) {
        const leaf = document.createElement('div');
        leaf.classList.add('leaf');
        leaf.innerHTML = '<span class="material-icons">eco</span>';
        
        // Random Styles
        const size = Math.random() * 20 + 15;
        const left = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        leaf.style.left = `${left}%`;
        leaf.style.fontSize = `${size}px`;
        leaf.style.color = color;
        leaf.style.position = 'absolute';
        leaf.style.top = '-50px';
        leaf.style.opacity = Math.random() * 0.5 + 0.5;
        
        container.appendChild(leaf);

        // Animate falling
        gsap.to(leaf, {
            y: window.innerHeight + 100,
            x: Math.random() * 100 - 50, // Drift
            rotation: Math.random() * 360,
            duration: duration,
            delay: delay,
            ease: "power1.in",
            onComplete: () => {
                if(leaf.parentNode) leaf.parentNode.removeChild(leaf);
            }
        });
    }
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



/* Success State Enhanced */
.result-state {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: white;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.success-message-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

.leaves-container {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 1;
}

.success-content {
    z-index: 2;
    text-align: center;
    padding: 2rem;
    max-width: 320px;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    box-shadow: 0 10px 40px rgba(76, 175, 80, 0.15);
    border: 1px solid rgba(255,255,255,0.6);
}

.success-icon-circle {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #4CAF50 0%, #81C784 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 16px rgba(76, 175, 80, 0.3);
}

.success-icon-circle span {
    font-size: 40px;
    color: white;
}

.success-content h2 {
    font-size: 2rem;
    color: #2E7D32;
    margin-bottom: 0.5rem;
    font-weight: 800;
}

.community-msg {
    font-size: 1rem;
    color: #558B2F;
    line-height: 1.5;
    margin-bottom: 2rem;
    font-style: italic;
}

.points-badge {
    background: #E8F5E9;
    padding: 1rem 2rem;
    border-radius: 20px;
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 1.5rem;
    border: 2px solid #C8E6C9;
}

.points-badge .plus {
    font-size: 1.5rem;
    color: #4CAF50;
    font-weight: 700;
}

.points-badge .amount {
    font-size: 3rem;
    font-weight: 800;
    color: #2E7D32;
    line-height: 1;
}

.points-badge .label {
    font-size: 1rem;
    color: #66BB6A;
    font-weight: 600;
    text-transform: uppercase;
}

.impact-stat {
    margin-bottom: 2rem;
    font-size: 0.9rem;
    color: #7CB342;
    background: white;
    padding: 8px 16px;
    border-radius: 30px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.glow-btn {
    background: linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%);
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
    transition: all 0.3s;
    width: 100%;
}

.glow-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
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

.success-text {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 1rem 0 0.5rem;
}

.community-msg {
    color: #666;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 280px;
    margin: 0 auto 1.5rem;
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
