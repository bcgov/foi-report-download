import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8000, // keeping your previous port
    proxy: {
      '/api': 'http://localhost:8080' // Adjust '/api' to your actual backend route if needed
    }
  },
  define: {
    'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
  }
})
