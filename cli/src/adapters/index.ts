import type { DeployAdapter } from './types.ts'
import { githubPagesAdapter } from './github-pages.ts'
import { vercelAdapter } from './vercel.ts'
import { cloudflarePagesAdapter } from './cloudflare-pages.ts'
import { vpsAdapter } from './vps.ts'
import { tunnelAdapter } from './tunnel.ts'

// target 字符串 → 适配器。加一种部署方式 = 加一个适配器文件 + schema 一个 union 分支。
export const adapters: Record<string, DeployAdapter> = {
  'github-pages': githubPagesAdapter,
  vercel: vercelAdapter,
  'cloudflare-pages': cloudflarePagesAdapter,
  vps: vpsAdapter,
  tunnel: tunnelAdapter,
}
