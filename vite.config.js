import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4073-41-228-211-118.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  },
  build: {
    chunkSizeWarningLimit: 1000, // e.g., set to 1000 kB
  }
})
