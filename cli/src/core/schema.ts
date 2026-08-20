import { z } from 'zod'

// site.yaml 的唯一真相源:全仓所有消费方(check/deploy/画廊索引/CI)都从这里取定义。
// deploy 块是判别联合:每种部署方式只允许携带自己的配置,防止死配置误导读者。

export const TUNNEL_PROVIDERS = ['cloudflared', 'cpolar', 'ngrok'] as const

const deploySchema = z.discriminatedUnion('target', [
  // 免费托管档 —— 注意:GitHub Pages 一个仓库只能承载一个站,全仓至多一个(check 校验)
  z.object({ target: z.literal('github-pages') }),
  z.object({ target: z.literal('vercel'), project: z.string() }),
  z.object({ target: z.literal('cloudflare-pages'), project: z.string() }),
  // 内网穿透档 —— cloudflared/cpolar 可绑自有子域名做长期示范;ngrok 免费档只能临时演示
  z.object({
    target: z.literal('tunnel'),
    provider: z.enum(TUNNEL_PROVIDERS),
    localPort: z.number().int().min(1).max(65535).default(4173),
  }),
  // 工业级档 —— host 是 ~/.ssh/config 里的别名,真实 IP/用户名不进仓库
  z.object({
    target: z.literal('vps'),
    host: z.string(),
    path: z.string().startsWith('/'),
    keepReleases: z.number().int().min(1).default(5),
  }),
])

export const siteSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, '站点名只允许小写字母、数字、连字符'),
  title: z.string().min(1),
  description: z.string().min(1),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, '子域名只允许小写字母、数字、连字符'),
  difficulty: z.number().int().min(1).max(5),
  status: z.enum(['draft', 'building', 'live', 'archived']),
  tags: z.array(z.string()).default([]),

  // 素材溯源:教学项目要能回答"这个页面哪来的"。
  // prompt 原文是 MotionSites 付费资产,只记编号,绝不入库。
  source: z
    .object({
      generator: z.enum(['motionsites', 'custom']),
      promptId: z.string().optional(),
      // localized = 图片已下载进本站 public/;cdn = 仍外链第三方(上线前必须清零)
      assets: z.enum(['localized', 'cdn', 'none']).default('none'),
    })
    .default({ generator: 'custom', assets: 'none' }),

  build: z
    .object({
      command: z.string().default('npm run build'),
      output: z.string().default('dist'),
    })
    .default({ command: 'npm run build', output: 'dist' }),

  deploy: deploySchema,

  // 对应教程路径(相对仓库根),check 校验文件存在——"站↔教程"一一对应是机器约束
  docs: z.string().min(1),

  // 隧道档站点应标 best-effort:画廊会诚实标注"本站随作者本机在线"
  availability: z.enum(['always', 'best-effort']).default('always'),

  verify: z
    .object({
      path: z.string().default('/'),
      expectStatus: z.number().int().default(200),
      expectText: z.string().optional(),
    })
    .optional(),
})

export type SiteManifest = z.infer<typeof siteSchema>
export type DeployTarget = SiteManifest['deploy']['target']
