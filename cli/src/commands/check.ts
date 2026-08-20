import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import { loadRegistry, type Issue } from '../core/registry.ts'
import { repoRoot } from '../core/paths.ts'
import { adapters } from '../adapters/index.ts'

// check = CI 门禁的本地版:两边跑同一份 registry 代码,本地过 = CI 过
export function checkCommand(): void {
  const { sites, issues } = loadRegistry()

  // 适配器的 docsLink 也是"代码↔教程"对应关系的一部分,同样不许漂移
  for (const adapter of Object.values(adapters)) {
    if (!fs.existsSync(path.join(repoRoot, adapter.docsLink))) {
      issues.push({ site: `(适配器 ${adapter.target})`, level: 'error', message: `docsLink 指向不存在的教程:${adapter.docsLink}` } satisfies Issue)
    }
  }

  const errors = issues.filter((i) => i.level === 'error')
  const warns = issues.filter((i) => i.level === 'warn')

  for (const issue of errors) console.log(`${pc.red('✗')} [${issue.site}] ${issue.message}`)
  for (const issue of warns) console.log(`${pc.yellow('⚠')} [${issue.site}] ${issue.message}`)

  console.log()
  console.log(`站点 ${sites.length} 个,${pc.red(`错误 ${errors.length}`)},${pc.yellow(`警告 ${warns.length}`)}`)
  if (errors.length > 0) {
    process.exitCode = 1
  } else {
    console.log(pc.green('✓ 校验通过'))
  }
}
