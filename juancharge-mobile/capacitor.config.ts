import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.juancharge.mobile',
  appName: 'JuanCharge',
  webDir: 'dist',
  // Optional server override: set CAPACITOR_SERVER_URL env var when you want the
  // emulator to load a dev server (e.g. http://10.0.2.2:5173). Example:
  // CAPACITOR_SERVER_URL=http://10.0.2.2:5173 npm run build
  server: (() => {
    const url = process.env.CAPACITOR_SERVER_URL;
    if (!url) return undefined as any;
    const s: any = { url };
    // allow cleartext when using http
    if (url.startsWith('http://')) s.cleartext = true;
    return s as any;
  })(),
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
