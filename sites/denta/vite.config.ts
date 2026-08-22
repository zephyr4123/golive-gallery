import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  // 隧道档专属:vite preview 默认按 Host 白名单校验,隧道域名会被 403 Blocked request。
  // 以点开头是后缀通配,一次覆盖该服务商所有随机子域;自有域名要逐个写。
  // 三家的域名形态见 docs/guide/02-tunneling/README.md。
  preview: {
    allowedHosts: ['.cpolar.cn', '.cpolar.top', '.trycloudflare.com', '.ngrok-free.app', '.ngrok-free.dev', 'denta.golive-gallery.art'],
  },
})
