import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['158b-41-228-214-209.ngrok-free.app'],
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
  
})
