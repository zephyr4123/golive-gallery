import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'

// Vercel:示范站走平台原生 Git 集成(控制台把 Root Directory 设为 sites/<name>),
// 这里的 plan 给出的是等价的 CLI 手动路径,供 --dry-run 教学对照。
export const vercelAdapter: DeployAdapter = {
  target: 'vercel',
  docsLink: 'docs/guide/01-free-hosting/vercel.md',
  preflight(site) {
    return [
      { ok: commandExists('vercel'), label: 'vercel CLI 已安装', hint: 'npm i -g vercel,或走平台 Git 集成(推荐,见教程)' },
      { ok: Boolean(process.env.VERCEL_TOKEN), label: '环境变量 VERCEL_TOKEN 已配置', hint: '平台 Git 集成模式下本地无需 token' },
      { ok: site.manifest.deploy.target === 'vercel', label: `平台项目名:${(site.manifest.deploy as { project?: string }).project ?? '(未配置)'}` },
    ]
  },
  plan(site) {
    return [
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `vercel deploy --prebuilt --prod  # 或:平台 Git 集成下 push 即部署`,
    ]
  },
}
