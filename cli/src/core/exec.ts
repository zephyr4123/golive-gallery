import fs from 'node:fs'
import path from 'node:path'
import { execa } from 'execa'
import which from 'which'
import pc from 'picocolors'

// 在站点自己的目录内执行 npm 生命周期——CLI 永不全局安装任何东西,
// "依赖装项目局部"这条红线由这里机器化执行。
export async function runInSite(siteDir: string, command: string, args: string[]): Promise<void> {
  if (!fs.existsSync(path.join(siteDir, 'node_modules'))) {
    console.log(pc.yellow(`⚠ ${path.basename(siteDir)} 还没装依赖,先执行:cd ${path.relative(process.cwd(), siteDir) || '.'} && npm i`))
    process.exitCode = 1
    return
  }
  await execa(command, args, { cwd: siteDir, stdio: 'inherit' })
}

// which 处理各平台可执行判定(含 Windows 的 PATHEXT .exe/.cmd),不自己拼 PATH
export function commandExists(cmd: string): boolean {
  return which.sync(cmd, { nothrow: true }) !== null
}
