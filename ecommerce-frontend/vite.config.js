import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000', // 127.0.0.1 instead of localhost — avoids IPv6 resolution issues on Windows
        changeOrigin: true,
        secure: false,
        ws: false,
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('[proxy error]', err.message))
          proxy.on('proxyReq', (_, req) => console.log('[proxy]', req.method, req.url))
          proxy.on('proxyRes', (res, req) => console.log('[proxy]', res.statusCode, req.url))
        },
      },
    },
  },
})
