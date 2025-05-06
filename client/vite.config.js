import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8000, 
    proxy: {
      '/FOI-report': 'http://localhost:8080' 
    }
  },
  define: {
    'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
  }
})
