import type { Site } from '../core/registry.ts'
import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'
import { BASE_DOMAIN } from '../core/config.ts'

// 内网穿透档:与其他档位是不同物种——"本机长驻进程"而非"一次性发布动作"。
// 所以它不走 golive deploy,由 golive tunnel 命令单独承载;本文件只提供
// 各 provider 的前置检查与命令计划,供 tunnel 命令与 --dry-run 复用。
//   cloudflared  免费绑自有子域名,长期示范站首选(域名 DNS 须托管在 Cloudflare)
//   cpolar       付费订阅可绑自定义域名(海外节点免备案)
//   ngrok        免费档只有随机 *.ngrok-free.app,仅作临时演示教学
interface TunnelDeploy {
  provider: 'cloudflared' | 'cpolar' | 'ngrok'
  localPort: number
}

function tunnelConf(site: Site): TunnelDeploy {
  return site.manifest.deploy as unknown as TunnelDeploy
}

export const tunnelAdapter: DeployAdapter = {
  target: 'tunnel',
  docsLink: 'docs/guide/02-tunneling/README.md',
  preflight(site) {
    const { provider } = tunnelConf(site)
    const checks = [{ ok: commandExists(provider), label: `${provider} 已安装` }]
    if (provider === 'ngrok') {
      checks.push({ ok: false, label: 'ngrok 免费档不能绑自有子域名,仅作临时演示;长期示范请改用 cloudflared 或 cpolar' })
    }
    return checks
  },
  plan(site) {
    const { provider, localPort } = tunnelConf(site)
    const serve = [
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `npx vite preview --port ${localPort}  # 本地伺服构建产物`,
    ]
    const bySubdomain = `${site.manifest.subdomain}.${BASE_DOMAIN}`
    switch (provider) {
      case 'cloudflared':
        return [...serve, `cloudflared tunnel run  # 按 infra/tunnel/cloudflared.example.yml,将 ${bySubdomain} 路由到 localhost:${localPort}`]
      case 'cpolar':
        return [...serve, `cpolar http ${localPort}  # 付费订阅绑定 ${bySubdomain},见教程`]
      case 'ngrok':
        return [...serve, `ngrok http ${localPort}  # 得到临时的 *.ngrok-free.app 地址(2 小时会话上限)`]
    }
  },
}
