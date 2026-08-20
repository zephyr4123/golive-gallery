import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'

// GitHub Pages:仓内至多一个站(平台硬限制),经官方 Actions 链路部署。
// 本适配器的 plan 描述的是 CI 里发生的事——它由 push 触发,而非本地执行。
export const githubPagesAdapter: DeployAdapter = {
  target: 'github-pages',
  docsLink: 'docs/guide/01-free-hosting/github-pages.md',
  preflight() {
    return [
      { ok: commandExists('git'), label: 'git 已安装' },
      { ok: true, label: '部署经 .github/workflows 由 push 触发,本地无需凭据' },
    ]
  },
  plan(site) {
    return [
      `# 以下由 GitHub Actions 在云端执行(见 .github/workflows/):`,
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `actions/upload-pages-artifact  # 上传 ${site.manifest.build.output}/`,
      `actions/deploy-pages           # 发布到 ${site.manifest.subdomain}.<BASE_DOMAIN>`,
    ]
  },
}
