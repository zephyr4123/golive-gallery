import pc from 'picocolors'
import { getSite } from '../core/registry.ts'
import { tunnelAdapter } from '../adapters/tunnel.ts'

export function tunnelCommand(name: string): void {
  const site = getSite(name)
  if (site.manifest.deploy.target !== 'tunnel') {
    throw new Error(`站点「${name}」的部署方式是 ${site.manifest.deploy.target},不是隧道`)
  }

  console.log(pc.bold(`\n${site.name} —— 内网穿透(${site.manifest.subdomain}.<BASE_DOMAIN>)\n`))
  console.log(pc.dim('前置检查:'))
  for (const check of tunnelAdapter.preflight(site)) {
    console.log(`  ${check.ok ? pc.green('✓') : pc.yellow('⚠')} ${check.label}`)
  }
  console.log(pc.dim('\n启动步骤(隧道是前台长驻进程,关掉终端站点即离线):'))
  for (const line of tunnelAdapter.plan(site)) console.log(`  ${line.startsWith('#') ? pc.dim(line) : line}`)
  console.log(pc.dim(`\n教程:${tunnelAdapter.docsLink}\n`))
  console.log(pc.yellow('⚠ 一键启动尚未实现(骨架阶段),请按上方步骤手动执行。'))
}
