import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root')
// 挂载点缺失说明 index.html 被改坏了,静默失败会让人对着白屏查半天
if (!root) throw new Error('找不到 #root 挂载点,检查 index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
