import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['a1a1-197-29-209-95.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
  
})
