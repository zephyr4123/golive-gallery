import pc from 'picocolors'
import { loadRegistry } from '../core/registry.ts'

const STATUS_ICON: Record<string, string> = {
  draft: pc.dim('◌ draft'),
  building: pc.yellow('◐ building'),
  live: pc.green('● live'),
  archived: pc.dim('◇ archived'),
}

export function listCommand(options: { json?: boolean }): void {
  const { sites, issues } = loadRegistry()

  if (options.json) {
    // --json 供 CI 生成矩阵与画廊索引消费
    console.log(JSON.stringify(sites.map((s) => s.manifest), null, 2))
    return
  }

  if (sites.length === 0) {
    console.log(pc.dim('还没有站点。golive new <name> 创建第一个。'))
    return
  }

  console.log()
  for (const site of sites) {
    const m = site.manifest
    const stars = '⭐'.repeat(m.difficulty)
    console.log(`  ${pc.bold(m.name.padEnd(16))} ${STATUS_ICON[m.status]}`)
    console.log(`  ${pc.dim('│')} ${m.title} — ${m.description}`)
    console.log(`  ${pc.dim('│')} ${pc.cyan(`${m.subdomain}.<BASE_DOMAIN>`)}  ${pc.dim('·')}  ${m.deploy.target}  ${pc.dim('·')}  难度 ${stars}`)
    console.log(`  ${pc.dim('└')} 教程:${pc.dim(m.docs)}`)
    console.log()
  }
  const errors = issues.filter((i) => i.level === 'error').length
  if (errors > 0) console.log(pc.red(`⚠ 有 ${errors} 个校验错误,详见 golive check`))
}
