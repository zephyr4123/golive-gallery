# 部署教程总纲

> 目标读者:会写点前端、想把网站放到公网上的人。按下面的顺序走,就是学习路线。

| 章节 | 内容 | 难度 |
|---|---|---|
| [00 基础](guide/00-basics/) | 域名、DNS、HTTPS 到底是什么 | ⭐ |
| [01 免费托管](guide/01-free-hosting/) | GitHub Pages / Vercel / Cloudflare Pages | ⭐~⭐⭐ |
| [02 内网穿透](guide/02-tunneling/) | Cloudflare Tunnel / cpolar / ngrok | ⭐⭐~⭐⭐⭐ |
| [03 工业级](guide/03-vps/) | 云服务器 + Caddy + HTTPS + 原子回滚 | ⭐⭐⭐⭐+ |

每个示范站另有一篇实战教程,在 [`sites/`](sites/) 目录,与仓库 `sites/` 里的站点一一对应(由 `golive check` 机器校验)。

**写作纪律**:正文永远教手动步骤;`golive` CLI 只出现在每章末尾的"学会原理后,一条命令搞定"栏目,其 `--dry-run` 输出与正文命令一致。
