import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In development, /api calls are proxied to Spring Boot (port 8080)
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
