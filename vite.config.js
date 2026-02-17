import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/jerry-os-dashboard/overview/',
  server: {
    host: '0.0.0.0', // Bind to all interfaces
    port: 5173,
    proxy: {
      '/jerry-os-dashboard/overview/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/jerry-os-dashboard\/overview/, ''),
      }
    }
  }
})
