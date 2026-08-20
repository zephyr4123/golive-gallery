#!/usr/bin/env node
// CHANGELOG 的机器判据:发版三方(本地 npm version 钩子、CI release 门禁、Release 正文)
// 共用这一份代码,规矩能用一条命令查,才是活的规矩。
//   verify  —— package.json 当前版本在 CHANGELOG.md 里必须有非空条目,否则退出码 1
//   extract —— 把当前版本的条目正文打到 stdout(release.yml 用它生成 Release 说明)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { version } = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const changelog = fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8')

const lines = changelog.split('\n')
const headingRe = /^## \[(.+?)\]/
const start = lines.findIndex((l) => headingRe.exec(l)?.[1] === version)
if (start === -1) {
  console.error(`✗ CHANGELOG.md 缺少版本 ${version} 的条目(需要一行「## [${version}] - YYYY-MM-DD」)`)
  process.exit(1)
}
let end = lines.length
for (let i = start + 1; i < lines.length; i++) {
  if (headingRe.test(lines[i])) { end = i; break }
}
const body = lines.slice(start + 1, end).join('\n').trim()
if (!body) {
  console.error(`✗ CHANGELOG.md 中版本 ${version} 的条目是空的——写清楚改了什么再发版`)
  process.exit(1)
}

const mode = process.argv[2]
if (mode === 'verify') {
  console.log(`✓ CHANGELOG.md 含版本 ${version} 的非空条目`)
} else if (mode === 'extract') {
  console.log(body)
} else {
  console.error('用法:node scripts/changelog.mjs <verify|extract>')
  process.exit(1)
}
