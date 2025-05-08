import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['046d-41-230-62-140.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
  
})
