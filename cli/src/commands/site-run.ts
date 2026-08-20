import path from 'node:path'
import pc from 'picocolors'
import { getSite, loadRegistry } from '../core/registry.ts'
import { runInSite } from '../core/exec.ts'

// dev/build/preview 都是同一件事:在站点自己的目录内跑它自己的 npm script。
// CLI 只是编排者,站点脱离 CLI 也能用一模一样的命令独立运行。
export async function devCommand(name: string): Promise<void> {
  const site = getSite(name)
  await runInSite(site.dir, 'npm', ['run', 'dev'])
}

export async function buildCommand(name: string | undefined, options: { all?: boolean }): Promise<void> {
  if (options.all) {
    const { sites } = loadRegistry()
    for (const site of sites) {
      console.log(pc.bold(`\n▶ 构建 ${site.name}`))
      await runInSite(site.dir, 'npm', ['run', 'build'])
    }
    return
  }
  if (!name) throw new Error('用法:golive build <site> 或 golive build --all')
  const site = getSite(name)
  await runInSite(site.dir, 'npm', ['run', 'build'])
}

export async function previewCommand(name: string): Promise<void> {
  const site = getSite(name)
  console.log(pc.dim(`伺服 ${path.join('sites', name, site.manifest.build.output)}(先 golive build ${name})`))
  await runInSite(site.dir, 'npm', ['run', 'preview'])
}
