# JuanCharge Mobile App ⚡

A Vue 3 + Capacitor mobile application for finding and managing EV charging stations.

## Features

- **🏠 Home** - Dashboard with stats and quick actions
- **🗺️ Map** - Find nearby charging stations
- **📱 Scan QR** - Quick access to charging via QR code
- **🏆 Achievements** - Track your charging milestones and earn rewards
- **⚙️ Settings** - Customize your charging preferences

## Development

### Prerequisites
- Node.js
- Android Studio (for Android development)
- Java JDK 17

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run in browser (development):
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Sync with Capacitor:
```bash
npx cap sync android
```

### Running on Android

1. Start an emulator:
```bash
emulator -avd Pixel_5 &
```

2. Run the app:
```bash
npx cap run android
```

Or open in Android Studio:
```bash
npx cap open android
```

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Vite** - Next generation frontend tooling
- **Capacitor** - Cross-platform native runtime

## Project Structure

```
src/
├── components/
│   └── BottomNav.vue       # Bottom navigation component
├── views/
│   ├── Home.vue            # Home page
│   ├── Map.vue             # Map/stations page
│   ├── ScanQR.vue          # QR scanner page
│   ├── Achievements.vue    # Achievements page
│   └── Settings.vue        # Settings page
├── router/
│   └── index.js            # Vue Router configuration
├── App.vue                 # Root component
└── main.js                 # Application entry point
```
