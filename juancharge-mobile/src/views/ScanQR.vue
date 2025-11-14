<template>
  <div class="scan-page">
    <div class="page-header">
      <h1>⚡ Redeem Points</h1>
      <p>{{ selectedKiosk ? selectedKiosk.kiosk_code : 'Select a station to charge' }}</p>
    </div>

    <div class="scanner-container">
      <div class="camera-frame">
        <div class="scan-area" v-if="isScanning">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
          <div class="scan-line"></div>
        </div>
        <!-- QR Reader renders camera here -->
        <div id="qr-reader"></div>
        <!-- Show placeholder only when NOT scanning and NO error -->
        <div class="camera-placeholder" v-if="!isScanning && !scanError">
          <div class="camera-icon">📷</div>
          <p>Initializing camera...</p>
        </div>
        <!-- Show error message if camera fails -->
        <div class="camera-placeholder" v-if="scanError">
          <div class="camera-icon">⚠️</div>
          <p>{{ scanError }}</p>
          <small>Please allow camera access</small>
        </div>
      </div>
    </div>

    <!-- Active Session Already Exists -->
    <div v-else-if="activeSession" class="active-session-alert">
      <div class="alert-icon">⚡</div>
      <h3>You have an active session</h3>
      <p>Complete or cancel your current session first</p>
      <div class="session-details">
        <p><strong>Station:</strong> {{ activeSession.kiosk.kiosk_code }}</p>
        <p><strong>Remaining:</strong> {{ getRemainingTime() }} minutes</p>
      </div>
      <button @click="cancelCurrentSession" class="cancel-btn" :disabled="cancelling">
        {{ cancelling ? 'Cancelling...' : 'Cancel Session' }}
      </button>
      <button @click="$router.push('/')" class="back-btn">Go to Home</button>
    </div>

    <!-- Redeem Points Form -->
    <div v-else class="redeem-container">
      <!-- Points Balance -->
      <div class="balance-card">
        <div class="balance-label">Available Points</div>
        <div class="balance-value">{{ pointsBalance }}</div>
      </div>

      <!-- Points Input -->
      <div class="input-section">
        <label>Points to Redeem</label>
        <input 
          type="number" 
          v-model.number="pointsToRedeem" 
          :min="MIN_POINTS"
          :max="Math.min(MAX_POINTS, pointsBalance)"
          placeholder="Enter points"
          class="points-input"
        />
        <div class="range-hint">
          Min: {{ MIN_POINTS }} • Max: {{ Math.min(MAX_POINTS, pointsBalance) }}
        </div>
      </div>

      <!-- Energy Preview -->
      <div v-if="pointsToRedeem >= MIN_POINTS" class="preview-card">
        <h3>⚡ Charging Preview</h3>
        <div class="preview-item">
          <span class="label">Duration:</span>
          <span class="value">{{ pointsToRedeem }} minutes</span>
        </div>
        <div class="preview-item">
          <span class="label">Energy:</span>
          <span class="value">{{ formatEnergy(calculateEnergy(pointsToRedeem)) }}</span>
        </div>
        <div class="preview-item">
          <span class="label">Station:</span>
          <span class="value">{{ selectedKiosk.kiosk_code }}</span>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Redeem Button -->
      <button 
        @click="redeemPoints" 
        class="redeem-btn"
        :disabled="!canRedeem || redeeming"
      >
        {{ redeeming ? 'Starting Session...' : 'Start Charging' }}
      </button>

      <!-- Quick Select Buttons -->
      <div class="quick-select">
        <button 
          v-for="preset in presetPoints" 
          :key="preset"
          @click="pointsToRedeem = preset"
          class="preset-btn"
          :disabled="preset > pointsBalance"
        >
          {{ preset }} pts
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const showManualEntry = ref(false)
const manualCode = ref('')
const isScanning = ref(false)
const scanError = ref('')
let html5QrCode = null

const recentScans = ref([
  { id: 1, station: 'SM Mall Station', time: '2 hours ago' },
  { id: 2, station: 'Ayala Center', time: 'Yesterday' },
  { id: 3, station: 'Capitol Commons', time: '2 days ago' }
])

const onScanSuccess = (decodedText, decodedResult) => {
  console.log(`QR scanned: ${decodedText}`, decodedResult)
  
  recentScans.value.unshift({
    id: Date.now(),
    station: decodedText,
    time: 'Just now'
  })

  alert(`QR Code Accepted: ${decodedText}`)
}

const onScanError = (errorMessage) => {
  // Ignore frequent scan errors
}

const startScanning = async () => {
  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("qr-reader")
    }
    
    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 350, height: 250 }
      },
      onScanSuccess,
      onScanError
    )
    
    isScanning.value = true
    scanError.value = ''
  } catch (err) {
    console.error("Unable to start scanning", err)
    scanError.value = "Camera access denied or unavailable"
    isScanning.value = false
  }
}

const stopScanning = async () => {
  if (html5QrCode && isScanning.value) {
    try {
      await html5QrCode.stop()
      isScanning.value = false
    } catch (err) {
      console.error("Error stopping scanner", err)
    }
  }
}

const submitCode = () => {
  if (manualCode.value.trim()) {
    recentScans.value.unshift({
      id: Date.now(),
      station: manualCode.value,
      time: 'Just now'
    })
    alert(`Code submitted: ${manualCode.value}`)
    manualCode.value = ''
    showManualEntry.value = false
  }
}

// Auto-start camera when page loads
onMounted(() => {
  startScanning()
})

// Clean up when leaving page
onBeforeUnmount(async () => {
  await stopScanning()
})
</script>

<style scoped>
.scan-page {
  width: 100%;
  max-width: 100vw;
  padding: 0;
  padding-bottom: 100px;
  overflow-x: hidden;
  box-sizing: border-box;
  background: #f8f8f8;
}

.page-header {
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  text-align: center;
  padding: 32px 20px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.page-header h1 {
  font-size: 28px;
  color: white;
  margin-bottom: 8px;
  font-weight: 800;
}

.page-header p {
  color: white;
  font-size: 15px;
  opacity: 0.95;
  font-weight: 600;
}

/* No Kiosk Selected */
.no-kiosk {
  text-align: center;
  padding: 60px 20px;
}

.camera-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 270px;
  margin: 0 auto;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  border: 4px solid white;
}

#qr-reader {
  width:  350px;
  height:  350px;
}

#qr-reader video {
  width: 350px;
  height:  350px;
}

.scan-area {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;
  z-index: 2;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 4px solid #7fdb9f;
}

.corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.no-kiosk p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
  font-weight: 600;
}

.select-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

/* Active Session Alert */
.active-session-alert {
  margin: 20px 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 2px solid #7fdb9f;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #7fdb9f;
  animation: scan 2s linear infinite;
  box-shadow: 0 0 10px rgba(127, 219, 159, 0.5);
}

.active-session-alert h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 800;
}

.active-session-alert > p {
  font-size: 14px;
  color: #666;
  z-index: 1;
  background: #292929;
}

.session-details {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.scan-instructions {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin: 0 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #eee;
}

.session-details p:last-child {
  margin-bottom: 0;
}

.session-details strong {
  color: #333;
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  margin-bottom: 12px;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.manual-entry-btn {
  width: calc(100% - 32px);
  margin: 0 16px 24px;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.3);
  transition: all 0.2s ease;
}

/* Redeem Container */
.redeem-container {
  padding: 20px 16px;
}

.manual-entry {
  display: flex;
  gap: 10px;
  margin: 0 16px 30px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 8px;
  font-weight: 600;
}

.code-input:focus {
  border-color: #7fdb9f;
  box-shadow: 0 0 0 3px rgba(127, 219, 159, 0.1);
}

.input-section label {
  display: block;
  font-size: 15px;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
}

.points-input {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  border: 2px solid #7fdb9f;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(127, 219, 159, 0.3);
  transition: all 0.2s ease;
}

.submit-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(127, 219, 159, 0.3);
}

.recent-scans {
  padding: 0 16px;
}

.range-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
  font-weight: 600;
}

/* Preview Card */
.preview-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 2px solid #7fdb9f;
}

.preview-card h3 {
  font-size: 17px;
  color: #42b883;
  margin-bottom: 16px;
  font-weight: 800;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-item .label {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.preview-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(127, 219, 159, 0.3);
}

/* Error Message */
.error-message {
  background: #fee;
  color: #e74c3c;
  padding: 14px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

/* Redeem Button */
.redeem-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
  margin-bottom: 20px;
}

.redeem-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quick Select */
.quick-select {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.preset-btn {
  padding: 12px;
  background: white;
  color: #42b883;
  border: 2px solid #42b883;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s;
}

.preset-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.preset-btn:not(:disabled):active {
  background: #42b883;
  color: white;
}

#qr-reader > div {
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

/* Hide the default scan region box */
#qr-reader__scan_region {
  border: none !important;
}

/* Hide the default dashboard/UI elements */
#qr-reader__dashboard,
#qr-reader__dashboard_section,
#qr-reader__dashboard_section_csr {
  display: none !important;
}

/* Hide canvas overlay */
#qr-reader canvas {
  display: none !important;
}

/* Remove all borders and backgrounds from qr-reader children */
#qr-reader * {
  border: none !important;
  outline: none !important;
}
</style>