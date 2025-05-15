import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['cebe-41-230-62-140.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
})