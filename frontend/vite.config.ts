import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['nonpolarizable-nonostensive-marylyn.ngrok-free.dev', '.ngrok-free.dev', 'all'],
  },
})
