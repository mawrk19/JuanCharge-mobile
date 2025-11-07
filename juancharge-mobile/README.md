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

**Note:** If you see `EmulatedEglImage` errors, these are harmless OpenGL warnings and can be ignored. To reduce them:
- In Android Studio: AVD Manager → Edit → Graphics → Change to "Hardware - GLES 2.0"
- Or run: `emulator -avd Pixel_5 -gpu host &`

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
- **Axios** - HTTP client for API calls
- **Lucide Vue** - Icon library

## Backend Integration

This app connects to a Laravel (PHP) backend via RESTful API.

### Setup Backend Connection

1. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

2. Update the Laravel API URL in `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

3. For Android/iOS, use your computer's local IP:
```env
VITE_API_URL=http://192.168.1.100:8000/api
```

### Laravel Backend Requirements

Your Laravel backend should have these API endpoints:

**Authentication:**
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

**Stations:**
- `GET /api/stations` - Get all stations
- `GET /api/stations/{id}` - Get station details
- `GET /api/stations/nearby?lat={lat}&lng={lng}&radius={km}` - Get nearby stations

**Charging:**
- `POST /api/charging/start` - Start charging session
- `POST /api/charging/stop` - Stop charging session
- `GET /api/charging/active` - Get active session
- `GET /api/charging/history` - Get charging history
- `POST /api/charging/scan` - Scan QR code

**User:**
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/achievements` - Get achievements
- `PUT /api/user/settings` - Update settings

### Laravel CORS Configuration

Add to `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173', 'capacitor://localhost', 'http://localhost'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Usage Example

```javascript
import { stationService } from '@/services/apiServices'

// Fetch stations
const response = await stationService.getNearby(14.5995, 120.9842, 10)
const stations = response.data.data
```

See `src/examples/StationsExample.vue` for complete examples.

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
