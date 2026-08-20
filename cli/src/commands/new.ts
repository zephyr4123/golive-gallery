import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { repoRoot, sitesDir, templatesDir, docsDir } from '../core/paths.ts'
import { loadRegistry } from '../core/registry.ts'
import { TUNNEL_PROVIDERS, RESERVED_SUBDOMAINS } from '../core/schema.ts'
import { BASE_DOMAIN } from '../core/config.ts'

interface NewOptions {
  subdomain?: string
  target: string
  title?: string
  difficulty: string
  provider?: string
}

const DNS_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

// 脚手架新站:把正路修得比手拷更好走——目录、site.yaml、教程骨架一次就位。
// 承诺:产出立即能过 golive check,所以 check 的每条规则在这里都有前置校验,
// 坏输入必须在写盘前 fail-fast,不许静默落库。
export function newCommand(name: string, options: NewOptions): void {
  if (!DNS_LABEL.test(name)) throw new Error('站点名须为合法 DNS label:小写字母/数字开头结尾,中间可用连字符,最长 63 字符')
  const siteDir = path.join(sitesDir, name)
  if (fs.existsSync(siteDir)) throw new Error(`sites/${name} 已存在`)

  const subdomain = options.subdomain ?? name
  if (!DNS_LABEL.test(subdomain)) throw new Error('子域名须为合法 DNS label:小写字母/数字开头结尾,中间可用连字符,最长 63 字符')
  if ((RESERVED_SUBDOMAINS as readonly string[]).includes(subdomain)) {
    throw new Error(`子域名「${subdomain}」是保留字(${RESERVED_SUBDOMAINS.join('/')})`)
  }

  const title = options.title ?? name
  if (/[\r\n]/.test(title) || title.length > 80) throw new Error('标题不能含换行,且不超过 80 字符')

  const difficulty = Number(options.difficulty)
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new Error(`难度必须是 1-5 的整数,收到:${options.difficulty}`)
  }

  const { sites } = loadRegistry()
  const clash = sites.find((s) => s.manifest.subdomain === subdomain)
  if (clash) throw new Error(`子域名「${subdomain}」已被站点「${clash.name}」占用`)
  if (options.target === 'github-pages' && sites.some((s) => s.manifest.deploy.target === 'github-pages')) {
    throw new Error('已存在 github-pages 站点,一个仓库只能承载一个 Pages 站(换 cloudflare-pages 或其他方式)')
  }

  const docsRel = `docs/sites/${name}.md`
  const docsPath = path.join(repoRoot, docsRel)
  if (fs.existsSync(docsPath)) throw new Error(`${docsRel} 已存在,如需重建请先手动移走`)

  const deployBlock = renderDeployBlock(name, options)

  fs.cpSync(path.join(templatesDir, 'static-site'), siteDir, { recursive: true })
  const indexPath = path.join(siteDir, 'index.html')
  fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replaceAll('{{TITLE}}', title))
  const pkgPath = path.join(siteDir, 'package.json')
  fs.writeFileSync(pkgPath, fs.readFileSync(pkgPath, 'utf8').replaceAll('{{NAME}}', name))

  // title 是自由文本,经 JSON.stringify 转义(合法 YAML 标量),防冒号/引号破坏清单
  fs.writeFileSync(
    path.join(siteDir, 'site.yaml'),
    `# ${name} —— 站点唯一真相源:部署、画廊索引、教程互链、CI 校验都从这份清单派生
# 字段定义见 cli/src/core/schema.ts;校验:npx golive check
name: ${name}
title: ${JSON.stringify(title)}
description: TODO 一句话说明主题与示范的部署方式
subdomain: ${subdomain} # => ${subdomain}.${BASE_DOMAIN}
difficulty: ${difficulty} # 1-5,驱动画廊排序与学习路线
status: draft # draft | building | live | archived(live 前先把教程写完)
tags: []

source: # 素材溯源;prompt 原文是付费资产只记编号;资产直用素材方 CDN 时标 assets: cdn
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

  // 隧道站不走 deploy 命令(长驻进程),教程骨架的"一条命令"按 target 分流
  const oneLiner = options.target === 'tunnel' ? `golive tunnel ${name}` : `golive deploy ${name} --dry-run`
  fs.mkdirSync(path.join(docsDir, 'sites'), { recursive: true })
  fs.writeFileSync(
    docsPath,
    `# ${title}(${subdomain}.${BASE_DOMAIN})

> 站点:[\`sites/${name}\`](../../sites/${name}) · 部署方式:${options.target}

TODO:实战教程。正文教手动步骤;文末"一条命令搞定"栏目对照 \`${oneLiner}\` 的输出。
`,
  )

  console.log(pc.green(`✓ sites/${name} 已创建(${options.target} → ${subdomain}.${BASE_DOMAIN})`))
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
