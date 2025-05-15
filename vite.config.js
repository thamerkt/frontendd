import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['dcef-197-27-63-126.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
})