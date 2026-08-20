import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' 让产物同时兼容 GitHub Pages 项目路径与自定义域名根路径
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
