# GitHub Pages:仓库即站点

> 适合:纯静态站(构建产物是一堆文件)。费用:0。前提:公开仓库(免费账号)。
> 本篇的活例子:本仓库的 `sites/dreamcore`,线上地址 `dreamcore.<BASE_DOMAIN>`。

## 原理一句话

GitHub 把你仓库里(或 CI 构建出的)静态文件,放到它的全球 CDN 上按域名分发。你不用管服务器、带宽、扩容——代价是只能放静态内容,且**一个仓库只能有一个 Pages 站**。

## 一、开启 Pages(source 选 GitHub Actions)

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。命令行等价操作:

```bash
gh api repos/<用户名>/<仓库>/pages -X POST -f 'build_type=workflow'
```

老式的 "Deploy from a branch" 模式要求产物提交进仓库;Actions 模式在云端现场构建,仓库只放源码——现代前端项目一律选后者。

## 二、部署 workflow:官方三件套

完整可运行的文件就在本仓库:[`.github/workflows/deploy-pages.yml`](../../../.github/workflows/deploy-pages.yml)(顶部带逐段教学注释)。骨架是三个官方 Action 各司其职:

```yaml
- uses: actions/configure-pages@v5        # 声明本仓库启用 Pages
- uses: actions/upload-pages-artifact@v3  # 把构建产物(dist/)打包成 Pages 专用产物
  with: { path: sites/dreamcore/dist }
- uses: actions/deploy-pages@v4           # 发布(走 OIDC,需 pages+id-token 写权限)
```

权限三行是新手最常漏的:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

push 到 main(且命中 paths 过滤)即自动部署;也可在 Actions 页手动触发(workflow_dispatch)。部署完成后,站点先出现在 `https://<用户名>.github.io/<仓库名>/`。

> 构建产物里的资源路径注意:项目页挂在子路径下,Vite 项目把 `base` 设为 `'./'` 可同时兼容子路径与自定义域名根路径。单页应用的前端路由用 Hash 路由最省事——纯静态托管没有服务端回退,`/#/xxx` 天然免配置。

## 三、绑自定义子域名

两边各做一件事:

1. **GitHub 侧**:Settings → Pages → Custom domain 填 `dreamcore.<BASE_DOMAIN>`(或 `gh api repos/<用户名>/<仓库>/pages -X PUT -f cname=...`)
2. **DNS 侧**:在你的解析商加一条 CNAME:

| 主机记录 | 类型 | 记录值 |
|---|---|---|
| `dreamcore` | CNAME | `<用户名>.github.io` |

**为什么记录值不带仓库名**?这是每个人第一次绑域名都会卡住的问题:DNS 的 CNAME 只能指向域名,指不了路径([模型二](../00-basics/README.md))。真正的分流靠 Host 头——访客带着 `dreamcore.<BASE_DOMAIN>` 到达 GitHub 边缘,GitHub 查"哪个仓库登记了这个域名"(就是第 1 步填的那格),回的自然是那个仓库的站。以后再加十个项目站,CNAME 记录值全都是 `<用户名>.github.io`,靠各自仓库的登记互相区分。

**顺序建议:先把 DNS 记录加好、确认能解析,再去 GitHub 填 Custom domain**——GitHub 会在你填的时刻验证域名,DNS 还没就绪会导致验证失败。

## 四、验证

```bash
gh run list --workflow deploy-pages.yml --limit 1        # 部署 workflow 绿了吗
curl -sI https://<用户名>.github.io/<仓库名>/ | head -1   # 平台默认域名通了吗
dig +short dreamcore.<BASE_DOMAIN>                        # 自定义域名解析对了吗
curl -s -o /dev/null -w '%{http_code}\n' --compressed http://dreamcore.<BASE_DOMAIN>/
```

> 探活加 `--compressed`:让 curl 带上与浏览器一致的 Accept-Encoding 请求头。CDN 按这个头分缓存桶,不带它你可能探到与浏览器不同的结果——"我这 200 你那 404"的灵异现场多半源于此。

## 硬限制与边界

- **一仓一站一域**:多站点要么多仓库,要么像本项目一样只给一个站 Pages 名额,其余走 Cloudflare Pages / Vercel
- 软限额:站点 ≤1GB,月流量 ≤100GB(静态展示站远用不满)
- HTTPS 证书:用 GitHub 代管证书要等它给自定义域名签发;本项目的 HTTPS 由 Cloudflare 边缘提供(见[下一篇](custom-domain-cloudflare.md)),不依赖这一步

---

**学会原理后,一条命令搞定**:本仓库读者可跑 `npx golive deploy dreamcore --dry-run`,它打印的底层命令与本篇正文一一对应。
