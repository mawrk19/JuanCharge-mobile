#!/bin/bash

echo "🚀 Starting Android Emulator Setup..."
echo ""

# Check if emulator is running
if adb devices | grep -q "emulator.*device"; then
    echo "✅ Emulator already running"
else
    echo "📱 Starting Pixel_5 emulator..."
    emulator -avd Pixel_5 > /dev/null 2>&1 &
    
    echo "⏳ Waiting for emulator to boot..."
    timeout 120 bash -c 'while ! adb devices | grep -q "emulator.*device$"; do sleep 3; done'
    
    if adb devices | grep -q "emulator.*device"; then
        echo "✅ Emulator ready"
    else
        echo "❌ Emulator failed to start within 120 seconds"
        exit 1
    fi
fi

echo ""
echo "📦 Building production app..."
npm run build

echo ""
echo "🔄 Syncing to Android..."
npx cap sync android

echo ""
echo "🔨 Building APK..."
cd android && ./gradlew assembleDebug

echo ""
echo "📲 Installing APK to emulator..."
./gradlew installDebug

echo ""
echo "✅ App installed successfully!"
echo ""
echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🎯 You can now open the JuanCharge app on the emulator"
