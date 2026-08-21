import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base '/' —— 本站用 BrowserRouter(真实路径),资源必须走绝对路径:
// 访问 /work/kestrel-ridge 时,相对路径 './assets/x.js' 会被解析成 /work/assets/x.js 而 404。
// 深链接能直接打开,靠 public/_redirects 让 Cloudflare Pages 把未命中路径回退到 index.html。
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
