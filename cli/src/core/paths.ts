import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 仓库根按本文件位置反推(cli/src/core/ 上溯三级),
// 让 golive 在仓库内任意目录执行都能找对家
const here = path.dirname(fileURLToPath(import.meta.url))

export const repoRoot = path.resolve(here, '..', '..', '..')
export const sitesDir = path.join(repoRoot, 'sites')
export const docsDir = path.join(repoRoot, 'docs')
export const templatesDir = path.join(repoRoot, 'cli', 'templates')
