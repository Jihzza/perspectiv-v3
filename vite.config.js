// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',   // avoid IPv6 (::1) localhost quirks
    port: 5173,
    strictPort: true,     // fail fast if 5173 is taken
    hmr: {
      clientPort: 5173,   // keep HMR websocket on the same port
    },
  },
})
