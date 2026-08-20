#!/usr/bin/env node
// Node 版本闸:低版本用户拿到人话报错,而不是".ts 扩展名不认识"的密语。
// 版本判断必须发生在 import main.ts 之前,所以这层 shim 是纯 JS。
const major = Number(process.versions.node.split('.')[0])
if (major < 24) {
  console.error(`golive 需要 Node >= 24(当前 ${process.version})。用 nvm/fnm/mise 切换后重试。`)
  process.exit(1)
}
await import('../src/main.ts')
