import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'

// VPS(工业级档):releases/<sha> 不可变目录 + current 符号链接。
// 发布 = rsync 新目录后切一次链接;回滚 = 把链接切回上一个 release,原子且秒级。
export const vpsAdapter: DeployAdapter = {
  target: 'vps',
  docsLink: 'docs/guide/03-vps/README.md',
  preflight(site) {
    const deploy = site.manifest.deploy as { host?: string; path?: string }
    return [
      { ok: commandExists('rsync'), label: 'rsync 已安装' },
      { ok: commandExists('ssh'), label: 'ssh 已安装' },
      { ok: Boolean(deploy.host), label: `SSH 别名:${deploy.host ?? '(未配置)'}`, hint: '真实 IP/用户配在 ~/.ssh/config,不进仓库' },
    ]
  },
  plan(site) {
    const deploy = site.manifest.deploy as { host: string; path: string; keepReleases: number }
    const release = `${deploy.path}/releases/$(git rev-parse --short HEAD)`
    return [
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `rsync -az --delete ${site.manifest.build.output}/ ${deploy.host}:${release}/`,
      `ssh ${deploy.host} 'ln -sfn ${release} ${deploy.path}/current'  # 原子切换,Caddy 的 root 指向 current`,
      `ssh ${deploy.host} 'ls -dt ${deploy.path}/releases/* | tail -n +${deploy.keepReleases + 1} | xargs rm -rf'  # 只保留最近 ${deploy.keepReleases} 个`,
    ]
  },
}
