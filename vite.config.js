import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    allowedHosts: ['135a-165-50-136-134.ngrok-free.app'],
=======
    allowedHosts: ['158b-41-228-214-209.ngrok-free.app'],
>>>>>>> ce9abef8cf731a045e942d71b3faba59b763d615
    host: true, // allow external access
    port: 5173  // or your preferred port
  }
  
})
