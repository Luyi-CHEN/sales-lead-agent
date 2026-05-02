import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { analyticsApiPlugin } from './vite-plugin-analytics-api'

export default defineConfig({
  base: '/sales-lead-agent/',
  plugins: [react(), analyticsApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
