import fs from 'node:fs'
import path from 'node:path'
import { repoRoot } from './paths.ts'

// 根域名是部署者的私有配置,不硬编码进开源仓库——别人有别人的域名。
// 读取优先级:环境变量 GOLIVE_BASE_DOMAIN > 仓库根 .env(gitignored)> 占位默认值。
// 配置方法见 .env.example。
const envFile = path.join(repoRoot, '.env')
if (!process.env.GOLIVE_BASE_DOMAIN && fs.existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile)
  } catch {
    // .env 格式损坏不致命:回落到占位默认值,check 会给出未配置警告
  }
}

export const BASE_DOMAIN = process.env.GOLIVE_BASE_DOMAIN || 'example.com'
export const BASE_DOMAIN_CONFIGURED = Boolean(process.env.GOLIVE_BASE_DOMAIN)
