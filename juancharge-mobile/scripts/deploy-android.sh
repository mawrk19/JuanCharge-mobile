#!/usr/bin/env bash
# scripts/deploy-android.sh
# Build, sync, start emulator, and install the app to Android emulator (Windows/bash)

set -e

echo "🚀 JuanCharge Mobile - Android Build & Deploy Script"
echo "=================================================="
echo ""

# 1. Build web assets
echo "[1/5] 📦 Building web assets..."
npm run build
echo "✅ Build complete"
echo ""

# 2. Sync to Android project
echo "[2/5] 🔄 Syncing web assets to Android..."
npx cap sync android
echo "✅ Sync complete"
echo ""

# 3. Start emulator if not running
echo "[3/5] 📱 Checking for running emulator..."
EMULATOR_NAME="Pixel_5"
ADB_PATH="C:/Users/Mawrk/AppData/Local/Android/Sdk/platform-tools/adb.exe"
EMU_PATH="C:/Users/Mawrk/AppData/Local/Android/Sdk/emulator/emulator.exe"

RUNNING=$($ADB_PATH devices | grep emulator | grep device || true)
if [ -z "$RUNNING" ]; then
  echo "⚠️  No emulator running. Starting $EMULATOR_NAME..."
  "$EMU_PATH" -avd "$EMULATOR_NAME" -gpu host &
  # Wait for device to boot
  echo "⏳ Waiting for emulator to boot..."
  until $ADB_PATH shell getprop sys.boot_completed 2>/dev/null | grep -m 1 '1'; do
    sleep 2
  done
  echo "✅ Emulator booted successfully"
else
  echo "✅ Emulator already running"
fi
echo ""

# 4. Install the app
echo "[4/5] 📲 Installing app to emulator..."
cd android
./gradlew installDebug
cd ..
echo "✅ App installed successfully"
echo ""

echo "[5/5] 🎉 Done! App is ready to test on emulator"
echo ""
echo "Next steps:"
echo "  1. Open the JuanCharge app on the emulator"
echo "  2. Login with: mobile@test.com / password"
echo "  3. Check chrome://inspect for debugging"
echo ""
echo "Test accounts:"
echo "  - mobile@test.com / password (Complete profile, 1500 points)"
echo "  - patron@test.com / password (Incomplete profile)"
echo "  - vip@test.com / password (VIP user, 10000 points)"
echo ""
