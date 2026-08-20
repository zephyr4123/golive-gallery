import pc from 'picocolors'
import { getSite } from '../core/registry.ts'
import { adapters } from '../adapters/index.ts'

// --dry-run 是教学功能不是调试功能:打印出与教程正文一致的底层命令,
// 让读者完成"理解 → 自动化"的认知闭环。
export function deployCommand(name: string, options: { dryRun?: boolean }): void {
  const site = getSite(name)
  const target = site.manifest.deploy.target

  if (target === 'tunnel') {
    console.log(pc.yellow('隧道站点是长驻进程不是一次性发布,请用:') + pc.bold(` golive tunnel ${name}`))
    process.exitCode = 1
    return
  }

  const adapter = adapters[target]
  console.log(pc.bold(`\n${site.name} → ${target}(${site.manifest.subdomain}.<BASE_DOMAIN>)\n`))

  console.log(pc.dim('前置检查:'))
  let failed = false
  for (const check of adapter.preflight(site)) {
    console.log(`  ${check.ok ? pc.green('✓') : pc.red('✗')} ${check.label}${check.hint && !check.ok ? pc.dim(`(${check.hint})`) : ''}`)
    if (!check.ok) failed = true
  }

  console.log(pc.dim('\n部署命令(与教程正文一致):'))
  for (const line of adapter.plan(site)) console.log(`  ${line.startsWith('#') ? pc.dim(line) : line}`)
  console.log(pc.dim(`\n教程:${adapter.docsLink}\n`))

  // dry-run 与否,preflight 失败都以非零退出码告知——退出码语义只有一套
  if (failed) process.exitCode = 1
  if (options.dryRun) return

  // 骨架阶段:真实执行随各站点落地时实现——有真实用例才写代码
  console.log(pc.yellow('⚠ 自动执行尚未实现(骨架阶段)。请按上方命令手动执行,或按教程操作。'))
}
