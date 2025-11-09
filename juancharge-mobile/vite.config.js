import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 3000,
    strictPort: false, // fail if 3000 is taken when true
    proxy: {
      '/api': {
        target: 'https://juancharge-backend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  }
})