import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['0fc7-197-25-40-46.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
})