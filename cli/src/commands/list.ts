import pc from 'picocolors'
import { loadRegistry } from '../core/registry.ts'
import { BASE_DOMAIN } from '../core/config.ts'

// status = 生命周期(人工推进);availability = 运行时可达性(随机器开关变)。
// 两根轴正交:隧道站是 live + best-effort——它确实上线了,但不保证此刻开着。
const STATUS_ICON: Record<string, string> = {
  draft: pc.dim('◌ draft'),
  building: pc.yellow('◐ building'),
  live: pc.green('● live'),
  archived: pc.dim('◇ archived'),
}

const AVAILABILITY_TAG: Record<string, string> = {
  always: '',
  'best-effort': pc.yellow('🔌 按需在线'),
}

export function listCommand(options: { json?: boolean }): void {
  const { sites, issues } = loadRegistry()

  if (options.json) {
    // --json 供 CI 生成矩阵与画廊索引消费:stdout 保持纯 JSON,异常走 stderr
    console.log(JSON.stringify(sites.map((s) => s.manifest), null, 2))
    const errorCount = issues.filter((i) => i.level === 'error').length
    if (errorCount > 0) {
      console.error(`⚠ 有 ${errorCount} 个校验错误,输出已排除受影响站点,详见 golive check`)
      process.exitCode = 1
    }
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
    // 无兜底下标查表:枚举加值却漏配图标会静默打印 undefined,所以显式兜底
    const status = STATUS_ICON[m.status] ?? m.status
    const availability = AVAILABILITY_TAG[m.availability] ?? ''
    console.log(`  ${pc.bold(m.name.padEnd(16))} ${status}${availability ? `  ${pc.dim('·')}  ${availability}` : ''}`)
    console.log(`  ${pc.dim('│')} ${m.title} — ${m.description}`)
    console.log(`  ${pc.dim('│')} ${pc.cyan(`${m.subdomain}.${BASE_DOMAIN}`)}  ${pc.dim('·')}  ${m.deploy.target}  ${pc.dim('·')}  难度 ${stars}`)
    console.log(`  ${pc.dim('└')} 教程:${pc.dim(m.docs)}`)
    console.log()
  }
  const errors = issues.filter((i) => i.level === 'error').length
  if (errors > 0) console.log(pc.red(`⚠ 有 ${errors} 个校验错误,详见 golive check`))
}
