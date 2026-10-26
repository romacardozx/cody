import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 3D hero (Three.js) is a ~550 kB chunk loaded lazily after the page shows; that is expected
  build: { chunkSizeWarningLimit: 600 },
  // In development, /api calls are proxied to Spring Boot (port 8080)
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
