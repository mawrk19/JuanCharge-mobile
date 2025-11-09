<template>
  <div class="scan-page">
    <div class="page-header">
      <h1>📱 Scan QR Code</h1>
      <p>Scan the QR code at the charging station</p>
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

    <div class="scan-instructions">
      <h3>How to scan:</h3>
      <ol>
        <li>Point your camera at the QR code</li>
        <li>Keep the QR code within the frame</li>
        <li>Wait for automatic detection</li>
      </ol>
    </div>

    <button class="manual-entry-btn" @click="showManualEntry = !showManualEntry">
      ✏️ Enter Code Manually
    </button>

    <div v-if="showManualEntry" class="manual-entry">
      <input 
        type="text" 
        v-model="manualCode" 
        placeholder="Enter station code"
        class="code-input"
      />
      <button class="submit-btn" @click="submitCode">Submit</button>
    </div>

    <div class="recent-scans">
      <h3>Recent Scans</h3>
      <div class="scan-history">
        <div class="scan-item" v-for="scan in recentScans" :key="scan.id">
          <div class="scan-icon">✓</div>
          <div class="scan-details">
            <div class="scan-station">{{ scan.station }}</div>
            <div class="scan-time">{{ scan.time }}</div>
          </div>
        </div>
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
  background: linear-gradient(135deg, #42b883 0%, #7fdb9f 100%);
  text-align: center;
  padding: 30px 16px 24px;
  box-shadow: 0 4px 12px rgba(218, 41, 28, 0.2);
}

.page-header h1 {
  font-size: 1.8rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.page-header p {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.scanner-container {
  padding: 16px;
  margin-bottom: 24px;
}

.camera-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 300px;
  margin: 0 auto;
  background: #292929;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  border: 4px solid white;
}

#qr-reader {
  width: 100%;
  height: 100%;
}

#qr-reader video {
  width: 100%;
  height: 100%;
  
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

.corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
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

@keyframes scan {
  0%, 100% { top: 0; }
  50% { top: 100%; }
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  z-index: 1;
  background: #292929;
}

.camera-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.scan-instructions {
  background: white;
  padding: 20px;
  border-radius: 16px;
  margin: 0 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #eee;
}

.scan-instructions h3 {
  color: #42b883;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 800;
}

.scan-instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #333;
  font-weight: 600;
}

.scan-instructions li {
  margin-bottom: 8px;
}

.manual-entry-btn {
  width: calc(100% - 32px);
  margin: 0 16px 24px;
  padding: 16px;
  background: linear-gradient(135deg, #42b883 0%, #2c8c63 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.3);
  transition: all 0.2s ease;
}

.manual-entry-btn:active {
  transform: translateY(2px);
  box-shadow: 0 3px 8px rgba(66, 184, 131, 0.3);
}

.manual-entry {
  display: flex;
  gap: 10px;
  margin: 0 16px 30px;
}

.code-input {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  font-weight: 600;
}

.code-input:focus {
  border-color: #7fdb9f;
  box-shadow: 0 0 0 3px rgba(127, 219, 159, 0.1);
}

.submit-btn {
  padding: 14px 28px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  border: none;
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

.recent-scans h3 {
  font-size: 20px;
  color: #42b883;
  margin-bottom: 16px;
  font-weight: 800;
}

.scan-history {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scan-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.scan-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #7fdb9f 0%, #5fc98e 100%);
  color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(127, 219, 159, 0.3);
}

.scan-details {
  flex: 1;
}

.scan-station {
  font-weight: 700;
  color: #333;
  font-size: 15px;
  margin-bottom: 4px;
}

.scan-time {
  font-size: 13px;
  color: #666;
  font-weight: 500;
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