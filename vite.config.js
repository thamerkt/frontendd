import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['135a-165-50-136-134.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
  
})
