import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { repoRoot, sitesDir, templatesDir, docsDir } from '../core/paths.ts'
import { loadRegistry } from '../core/registry.ts'
import { TUNNEL_PROVIDERS } from '../core/schema.ts'

interface NewOptions {
  subdomain?: string
  target: string
  title?: string
  difficulty: string
  provider?: string
}

// 脚手架新站:把正路修得比手拷更好走——目录、site.yaml、教程骨架一次就位,
// 且产出立即能过 golive check。
export function newCommand(name: string, options: NewOptions): void {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('站点名只允许小写字母、数字、连字符')
  const siteDir = path.join(sitesDir, name)
  if (fs.existsSync(siteDir)) throw new Error(`sites/${name} 已存在`)

  const subdomain = options.subdomain ?? name
  const title = options.title ?? name
  const { sites } = loadRegistry()
  const clash = sites.find((s) => s.manifest.subdomain === subdomain)
  if (clash) throw new Error(`子域名「${subdomain}」已被站点「${clash.name}」占用`)

  const deployBlock = renderDeployBlock(name, options)
  const docsRel = `docs/sites/${name}.md`

  fs.cpSync(path.join(templatesDir, 'static-site'), siteDir, { recursive: true })
  const indexPath = path.join(siteDir, 'index.html')
  fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replaceAll('{{TITLE}}', title))
  const pkgPath = path.join(siteDir, 'package.json')
  fs.writeFileSync(pkgPath, fs.readFileSync(pkgPath, 'utf8').replaceAll('{{NAME}}', name))

  fs.writeFileSync(
    path.join(siteDir, 'site.yaml'),
    `# ${name} —— 站点唯一真相源:部署、画廊索引、教程互链、CI 校验都从这份清单派生
# 字段定义见 cli/src/core/schema.ts;校验:npx golive check
name: ${name}
title: ${title}
description: TODO 一句话说明主题与示范的部署方式
subdomain: ${subdomain} # => ${subdomain}.<BASE_DOMAIN>
difficulty: ${Number(options.difficulty)} # 1-5,驱动画廊排序与学习路线
status: draft # draft | building | live | archived(live 前先把教程写完)
tags: []

source: # 素材溯源;prompt 原文是付费资产只记编号,图片上线前必须 localized
  generator: custom
  assets: none

build:
  command: npm run build
  output: dist

deploy:
${deployBlock}

docs: ${docsRel}
availability: ${options.target === 'tunnel' ? 'best-effort # 隧道档:本机在线站点才在线,画廊会诚实标注' : 'always'}
`,
  )

  fs.mkdirSync(path.join(docsDir, 'sites'), { recursive: true })
  fs.writeFileSync(
    path.join(repoRoot, docsRel),
    `# ${title}(${subdomain}.<BASE_DOMAIN>)

> 站点:[\`sites/${name}\`](../../sites/${name}) · 部署方式:${options.target}

TODO:实战教程。正文教手动步骤;文末"一条命令搞定"栏目对照 \`golive deploy ${name} --dry-run\` 的输出。
`,
  )

  console.log(pc.green(`✓ sites/${name} 已创建(${options.target} → ${subdomain}.<BASE_DOMAIN>)`))
  console.log(pc.dim(`  下一步:cd sites/${name} && npm i && npm run dev;教程骨架在 ${docsRel}`))
}

function renderDeployBlock(name: string, options: NewOptions): string {
  switch (options.target) {
    case 'github-pages':
      return `  target: github-pages # 注意:一个仓库只能承载一个 Pages 站`
    case 'vercel':
      return `  target: vercel\n  project: golive-${name}`
    case 'cloudflare-pages':
      return `  target: cloudflare-pages\n  project: golive-${name}`
    case 'tunnel': {
      const provider = options.provider ?? 'cloudflared'
      if (!(TUNNEL_PROVIDERS as readonly string[]).includes(provider)) {
        throw new Error(`未知隧道 provider:${provider}(可选:${TUNNEL_PROVIDERS.join('/')})`)
      }
      return `  target: tunnel\n  provider: ${provider}\n  localPort: 4173`
    }
    case 'vps':
      return `  target: vps\n  host: golive-vps # ~/.ssh/config 里的别名,真实 IP 不进仓库\n  path: /srv/sites/${name}\n  keepReleases: 5`
    default:
      throw new Error(`未知部署方式:${options.target}(可选:github-pages/vercel/cloudflare-pages/tunnel/vps)`)
  }
}
