import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En desarrollo, las llamadas a /api van a Spring Boot (puerto 8080)
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
