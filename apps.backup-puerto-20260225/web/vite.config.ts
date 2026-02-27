import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: process.env.PUBLIC_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
