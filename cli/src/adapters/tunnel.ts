import type { Site } from '../core/registry.ts'
import type { DeployAdapter } from './types.ts'
import { commandExists } from '../core/exec.ts'
import { BASE_DOMAIN } from '../core/config.ts'

// 内网穿透档:与其他档位是不同物种——"本机长驻进程"而非"一次性发布动作"。
// 所以它不走 golive deploy,由 golive tunnel 命令单独承载;本文件只提供
// 各 provider 的前置检查与命令计划,供 tunnel 命令与 --dry-run 复用。
//
// 三家的免费档边界写在代码里而不只在教程里,是因为读者会先跑命令、后读文档。
// 事实核于 2026-08-22,出处逐条登记在 docs/guide/02-tunneling/README.md。

type TunnelDeploy = Extract<Site['manifest']['deploy'], { target: 'tunnel' }>
type TunnelProvider = TunnelDeploy['provider']

// 每家最该在动手前知道的那一条(不是功能列表,是会让人白干的那个前提)
const PROVIDER_CAVEAT: Record<TunnelProvider, string> = {
  cloudflared: '自有子域名与 HTTPS 证书都免费,前提是该域名的 DNS 已托管在 Cloudflare',
  cpolar: '绑自有域名需专业版及以上;域名未备案时必须显式写 region 到海外节点(默认 cn_top 是大陆,强制备案),且 HTTPS 证书要自备 crt/key',
  ngrok: '免费档绑不了自有域名——实际地址是账号那个固定的 *.ngrok-free.app;浏览器首访有警告插页(cookie 只压 7 天),配额 1 GB + 20000 请求/月',
}

function tunnelConf(site: Site): TunnelDeploy {
  const { deploy } = site.manifest
  if (deploy.target !== 'tunnel') {
    throw new Error(`站点「${site.name}」的部署方式是 ${deploy.target},不是隧道`)
  }
  return deploy
}

export const tunnelAdapter: DeployAdapter = {
  target: 'tunnel',
  docsLink: 'docs/guide/02-tunneling/README.md',
  preflight(site) {
    const { provider } = tunnelConf(site)
    return [
      { ok: commandExists(provider), label: `${provider} 已安装`, hint: PROVIDER_CAVEAT[provider] },
      {
        ok: site.manifest.availability === 'best-effort',
        label: 'availability 标了 best-effort',
        hint: '隧道站的宿命是本机关机即离线,画廊与 README 靠这个字段诚实标注',
      },
    ]
  },
  plan(site) {
    const { provider, localPort } = tunnelConf(site)
    const bySubdomain = `${site.manifest.subdomain}.${BASE_DOMAIN}`
    // --strictPort:端口被占时 vite 会静默换一个,隧道就指向了空端口。宁可失败得响亮
    const serve = [
      `cd sites/${site.name} && npm ci && ${site.manifest.build.command}`,
      `npm run preview -- --port ${localPort} --strictPort  # 与 golive preview 同一条 npm script`,
      `# 两个必配项:vite preview 会按 Host 校验,隧道域名默认被 403——站点 vite.config.ts 里配 preview.allowedHosts`,
      `# 且它只监听 [::1],隧道回源地址写 localhost 而非 127.0.0.1,否则连不上源站`,
    ]
    switch (provider) {
      case 'cloudflared':
        return [...serve, `cloudflared tunnel run  # 按 infra/tunnel/cloudflared.example.yml,把 ${bySubdomain} 路由到 localhost:${localPort}`]
      case 'cpolar':
        return [...serve, `cpolar start-all  # 按 infra/tunnel/cpolar.example.yml:hostname ${bySubdomain} + 海外 region + 自备 crt/key`]
      case 'ngrok':
        return [
          ...serve,
          `ngrok http ${localPort}  # 落到账号那个固定 dev domain;免费档绑不了 ${bySubdomain}`,
          `# 老免费账号仍是随机域名:起停两次比对 URL,不一致就写信 support@ngrok.com 申请迁到新免费档`,
        ]
    }
  },
}
