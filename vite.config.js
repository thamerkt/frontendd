import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ important for correct path resolution in production
  server: {
    allowedHosts: ['4073-41-228-211-118.ngrok-free.app'],
    host: true,
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 1000,
  }
})
