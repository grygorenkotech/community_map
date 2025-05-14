import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/community_map/', // для локального розробки
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
