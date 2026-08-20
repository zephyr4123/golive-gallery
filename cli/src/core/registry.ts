import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { siteSchema, type SiteManifest } from './schema.ts'
import { repoRoot, sitesDir } from './paths.ts'

export interface Site {
  name: string
  dir: string
  manifest: SiteManifest
}

export interface Issue {
  site: string
  level: 'error' | 'warn'
  message: string
}

// 子域名保留字:这些留给项目自身设施,示范站不得占用
const RESERVED_SUBDOMAINS = ['www', 'docs', 'gallery', 'status']

// 疑似凭据的键名黑名单:site.yaml 只写"什么",凭据一律走环境变量
const SECRET_KEY_PATTERN = /token|secret|password|authtoken|apikey|api_key|credential/i

function findSecretKeys(node: unknown, trail: string[], hits: string[]): void {
  if (node === null || typeof node !== 'object') return
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (SECRET_KEY_PATTERN.test(key)) hits.push([...trail, key].join('.'))
    findSecretKeys(value, [...trail, key], hits)
  }
}

// 扫描 sites/*/site.yaml,产出站点注册表与全部问题清单。
// check 命令与 CI 门禁共用这一份逻辑:本地过 = CI 过。
export function loadRegistry(): { sites: Site[]; issues: Issue[] } {
  const sites: Site[] = []
  const issues: Issue[] = []

  if (!fs.existsSync(sitesDir)) return { sites, issues }

  for (const entry of fs.readdirSync(sitesDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name.startsWith('_')) continue
    const dir = path.join(sitesDir, entry.name)
    const manifestPath = path.join(dir, 'site.yaml')

    if (!fs.existsSync(manifestPath)) {
      issues.push({ site: entry.name, level: 'error', message: '缺少 site.yaml' })
      continue
    }

    let raw: unknown
    try {
      raw = YAML.parse(fs.readFileSync(manifestPath, 'utf8'))
    } catch (err) {
      issues.push({ site: entry.name, level: 'error', message: `site.yaml 解析失败:${(err as Error).message}` })
      continue
    }

    const secretHits: string[] = []
    findSecretKeys(raw, [], secretHits)
    for (const hit of secretHits) {
      issues.push({ site: entry.name, level: 'error', message: `site.yaml 出现疑似凭据字段「${hit}」——凭据一律走环境变量,清单里只登记键名` })
    }

    const parsed = siteSchema.safeParse(raw)
    if (!parsed.success) {
      for (const zi of parsed.error.issues) {
        issues.push({ site: entry.name, level: 'error', message: `${zi.path.join('.') || '(根)'}: ${zi.message}` })
      }
      continue
    }

    if (parsed.data.name !== entry.name) {
      issues.push({ site: entry.name, level: 'error', message: `name(${parsed.data.name})与目录名不一致` })
    }
    sites.push({ name: entry.name, dir, manifest: parsed.data })
  }

  crossValidate(sites, issues)
  return { sites, issues }
}

function crossValidate(sites: Site[], issues: Issue[]): void {
  const subdomainOwner = new Map<string, string>()
  let githubPagesCount = 0

  for (const site of sites) {
    const m = site.manifest

    if (RESERVED_SUBDOMAINS.includes(m.subdomain)) {
      issues.push({ site: site.name, level: 'error', message: `子域名「${m.subdomain}」是保留字(${RESERVED_SUBDOMAINS.join('/')})` })
    }
    const owner = subdomainOwner.get(m.subdomain)
    if (owner) {
      issues.push({ site: site.name, level: 'error', message: `子域名「${m.subdomain}」与站点「${owner}」冲突` })
    } else {
      subdomainOwner.set(m.subdomain, site.name)
    }

    if (!fs.existsSync(path.join(repoRoot, m.docs))) {
      issues.push({ site: site.name, level: 'error', message: `教程文件不存在:${m.docs}` })
    }
    if (!fs.existsSync(path.join(site.dir, 'package.json'))) {
      issues.push({ site: site.name, level: 'warn', message: '缺少 package.json(站点应是自包含 npm 项目)' })
    }

    if (m.deploy.target === 'github-pages') githubPagesCount += 1
    if (m.deploy.target === 'tunnel' && m.availability !== 'best-effort') {
      issues.push({ site: site.name, level: 'warn', message: '隧道档站点建议标 availability: best-effort(本机不在线站点即离线)' })
    }
    if (m.status === 'live' && m.source.assets === 'cdn') {
      issues.push({ site: site.name, level: 'warn', message: '状态 live 但资产仍外链第三方 CDN(assets: cdn)——上线前应本地化,防外链腐烂' })
    }
  }

  // GitHub Pages 硬限制:一个仓库只能承载一个 Pages 站、绑一个自定义域
  if (githubPagesCount > 1) {
    issues.push({ site: '(全仓)', level: 'error', message: `github-pages 站点有 ${githubPagesCount} 个,但一个仓库只能承载一个 Pages 站` })
  }
}

export function getSite(name: string): Site {
  const { sites } = loadRegistry()
  const site = sites.find((s) => s.name === name)
  if (!site) {
    const known = sites.map((s) => s.name).join(', ') || '(暂无站点)'
    throw new Error(`站点「${name}」不存在。已收录:${known}`)
  }
  return site
}
