import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'

// Cloudflare Pages:规模化默认档(免费档每项目 100 个自定义域、项目数无硬上限,
// 且域名 DNS 托管在 Cloudflare 时接入最顺)。
export const cloudflarePagesAdapter: DeployAdapter = {
  target: 'cloudflare-pages',
  docsLink: 'docs/guide/01-free-hosting/README.md',
  preflight(site) {
    return [
      { ok: commandExists('wrangler'), label: 'wrangler CLI 已安装', hint: 'npm i -g wrangler,或走平台 Git 集成' },
      { ok: Boolean(process.env.CLOUDFLARE_API_TOKEN), label: '环境变量 CLOUDFLARE_API_TOKEN 已配置', hint: '平台 Git 集成模式下本地无需 token' },
      { ok: Boolean((site.manifest.deploy as { project?: string }).project), label: `平台项目名:${(site.manifest.deploy as { project?: string }).project ?? '(未配置)'}`, hint: '在 site.yaml 的 deploy.project 填平台项目名' },
    ]
  },
  plan(site) {
    const project = (site.manifest.deploy as { project?: string }).project ?? ''
    return [
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `wrangler pages deploy ${site.manifest.build.output} --project-name ${project}`,
    ]
  },
}
