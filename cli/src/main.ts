import { Command } from 'commander'
import pc from 'picocolors'
import { listCommand } from './commands/list.ts'
import { checkCommand } from './commands/check.ts'
import { newCommand } from './commands/new.ts'
import { devCommand, buildCommand, previewCommand } from './commands/site-run.ts'
import { deployCommand } from './commands/deploy.ts'
import { tunnelCommand } from './commands/tunnel.ts'

// golive —— GoLive Gallery 的统一入口。
// 分层:commands(本目录,薄壳)→ core(清单/注册表)→ adapters(每种部署方式一个)。
// 宪法:手动路径永远是教程正文,CLI 只是"学会原理后,一条命令搞定"的效率层。
const program = new Command()

program.name('golive').description('GoLive Gallery:高审美网站示范 × 三档部署教学').version('0.1.0')

program.command('list').description('站点总表:子域名/部署方式/难度/状态').option('--json', '输出 JSON,供 CI 与画廊索引消费').action(listCommand)

program.command('check').description('校验站点清单、子域名唯一性、站↔教程对应(= CI 门禁)').action(checkCommand)

program
  .command('new')
  .description('脚手架新站:目录 + site.yaml + 教程骨架')
  .argument('<name>', '站点名(小写字母/数字/连字符)')
  .option('-s, --subdomain <subdomain>', '子域名,默认同站点名')
  .option('-t, --target <target>', '部署方式:github-pages | vercel | cloudflare-pages | tunnel | vps', 'cloudflare-pages')
  .option('--title <title>', '站点标题')
  .option('-d, --difficulty <n>', '难度 1-5', '1')
  .option('--provider <provider>', '隧道 provider:cloudflared | cpolar | ngrok(仅 --target tunnel)')
  .action(newCommand)

program.command('dev').description('起站点的开发服务器(等价 cd sites/<x> && npm run dev)').argument('<site>').action(devCommand)

program.command('build').description('构建站点').argument('[site]').option('--all', '全量构建,供 CI 冒烟').action(buildCommand)

program.command('preview').description('本地预览构建产物').argument('<site>').action(previewCommand)

program
  .command('deploy')
  .description('部署站点(读 site.yaml 分派到适配器)')
  .argument('<site>')
  .option('--dry-run', '只打印将执行的底层命令(与教程正文一致)')
  .action(deployCommand)

program.command('tunnel').description('内网穿透档:打印/启动 本地伺服 + 隧道').argument('<site>').action(tunnelCommand)

program.parseAsync().catch((err: Error) => {
  console.error(pc.red(`✗ ${err.message}`))
  process.exit(1)
})
