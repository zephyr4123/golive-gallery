import fs from 'node:fs'
import path from 'node:path'
import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'
import { repoRoot } from '../core/paths.ts'
import { BASE_DOMAIN } from '../core/config.ts'

// GitHub Pages:仓内至多一个站(平台硬限制),经官方 Actions 链路部署。
// 本适配器的 plan 描述的是 CI 里发生的事——它由 push 触发,而非本地执行。

// 前置检查要检查真命题:部署 workflow 是否真的存在,而不是恒报 ✓
function hasPagesWorkflow(): boolean {
  const dir = path.join(repoRoot, '.github', 'workflows')
  if (!fs.existsSync(dir)) return false
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .some((f) => fs.readFileSync(path.join(dir, f), 'utf8').includes('actions/deploy-pages'))
}

export const githubPagesAdapter: DeployAdapter = {
  target: 'github-pages',
  docsLink: 'docs/guide/01-free-hosting/README.md',
  preflight() {
    return [
      { ok: commandExists('git'), label: 'git 已安装' },
      {
        ok: hasPagesWorkflow(),
        label: '.github/workflows 存在 Pages 部署 workflow(actions/deploy-pages)',
        hint: '骨架阶段尚未创建;就位前 push 不会发布',
      },
    ]
  },
  plan(site) {
    return [
      `# 以下由 GitHub Actions 在云端执行(见 .github/workflows/):`,
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `actions/upload-pages-artifact  # 上传 ${site.manifest.build.output}/`,
      `actions/deploy-pages           # 发布到 ${site.manifest.subdomain}.${BASE_DOMAIN}`,
    ]
  },
}
