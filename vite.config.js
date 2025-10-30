import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443, // Use HTTPS port for HMR through tunnel
      host: 'pixel.edwinlovett.com',
    },
  },
})