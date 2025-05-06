import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Crucial for external access
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'ebb3-41-228-243-244.ngrok-free.app',
      port: 443,
      clientPort: 443
    },
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    }
  },
  define: {
    global: {},
    'process.env': {}
  }
})