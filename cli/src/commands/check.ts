import pc from 'picocolors'
import { loadRegistry } from '../core/registry.ts'

// check = CI 门禁的本地版:两边跑同一份 registry 代码,本地过 = CI 过
export function checkCommand(): void {
  const { sites, issues } = loadRegistry()
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
