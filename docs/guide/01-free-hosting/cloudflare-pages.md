# Cloudflare Pages:平台自己拉代码、自己构建

> 本项目第二个示范站(Acreage)走的就是这条链路。与 [GitHub Pages 篇](github-pages.md) 是刻意的对照:同样免费、同样绑自定义域名,但**谁来构建**这件事完全不同。

## 原理一句话

你把仓库授权给 Cloudflare,它自己 clone、自己跑构建命令、自己托管产物。构建配置填在平台面板里,不进你的版本库——这跟 GitHub Pages 要你在仓库里写一份 workflow YAML 正好相反。

## 一、先确认你点进的是 Pages,不是 Workers

Cloudflare 正在把新项目往 Workers 引,`Create` 的默认落点可能是 Workers 而不是 Pages。两个流程产出的东西不一样(Workers 产出的是一个脚本,Pages 产出的是静态站托管),**别点错了才发现**。

官方路径:**Workers & Pages → Create application → 选「Pages」页签 → Connect to Git**。

一眼分辨:

| 看到这个字段 | 说明你在 |
|---|---|
| **Build output directory** / **Root directory** | ✅ Pages |
| **Deploy command**(`npx wrangler deploy`)/ **API token** | ❌ Workers |

走 Pages 全程不需要创建任何 API token。要是你的面板确实找不到 Pages 页签,可以走 Workers Static Assets 顶上(给站点加 `wrangler.jsonc` 声明 `assets.directory`,Workers 侧的 **Path** 字段等价于 Pages 的 Root directory),一样免费、一样能绑自定义域名,只是配置从面板挪进了代码。

## 二、构建表单逐格填

以本仓库的 `sites/acreage` 为例(monorepo,站点不在仓库根):

| 字段 | 填什么 | 说明 |
|---|---|---|
| Project name | `golive-acreage` | 默认会自动填成仓库名,**要改**;它同时决定免费域名 `<项目名>.pages.dev` |
| Production branch | `main` | |
| Framework preset | `None` | Vite 项目选 None 即可,预设只是帮你预填下面两格 |
| Build command | `npm run build` | |
| Build output directory | `dist` | 左边的 `/` 是界面前缀,别自己再打斜杠 |
| **Root directory (advanced)** | `sites/acreage` | **monorepo 的命门**,见下 |
| Environment variables | `NODE_VERSION` = `22.16.0` | 见下 |

### Root directory:monorepo 不填这格必挂

不填的话 Cloudflare 会在仓库根构建。本仓库根的 `package.json` 是 CLI 不是站点,`npm run build` 直接失败。填上之后,`npm ci` 和构建命令都在这个子目录里跑。

构建日志里出现这一行,说明它生效了:

```
Using v2 root directory strategy
```

### Build output directory 相对谁?

**官方文档没写清楚。** 我查了 [build-configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) 和 [monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/) 两篇,都没有说明设了 Root directory 之后输出目录的基准。

按惯例填 `dist`(相对 Root directory),本项目实测通过——日志里 `Validating asset output directory` 不报错即为对。**万一报找不到输出目录**,不用重建项目,去 Settings → Builds 改成 `sites/acreage/dist` 重跑一次。

### Node 版本:别赌 `.node-version` 从哪读

Cloudflare 读 `.nvmrc` / `.node-version` 来决定 Node 版本,但**同样没写清 monorepo 下是从仓库根读还是从 Root directory 读**。本仓库根的 `.node-version` 写的是 `26`(CLI 需要 Node ≥ 24 才能原生跑 TS),站点却只需要 22——两份要求不一样,读错哪一份都可能出事。

确定生效的做法是**加 `NODE_VERSION` 环境变量**,它不依赖那个模糊点。取值从依赖的硬要求反推:

```bash
# 站点构建工具链声明的 node 门槛
node -p "require('./node_modules/vite/package.json').engines.node"
# => ^20.19.0 || >=22.12.0
```

所以 22.16.0 满足。顺带一提,Cloudflare 当前 v3 构建镜像的默认值也正好是 Node 22.16.0,日志里能看到:

```
Detected the following tools from environment: nodejs@22.16.0, npm@10.9.2
```

填完点 **Save and Deploy**,先用 `<项目名>.pages.dev` 确认站点内容是对的,再往下绑域名。

## 三、绑自定义子域名

项目 → **Custom domains → Set up a custom domain** → 输入 `acreage.<BASE_DOMAIN>` → 确认。

**如果这个域名的 DNS 已经托管在同一个 Cloudflare 账号下,你不需要去 DNS 那边加任何记录**——Cloudflare 会自己写 CNAME、自己签证书。这是它相对 GitHub Pages 最省事的地方:那边要你手填 CNAME、再等平台签发证书。

### 记录写入有延迟,别急着判故障

面板显示 `Active` / `SSL enabled` 之后,DNS 记录**可能还没真的写进去**。本项目实测约 **80 秒**才出现。

这跟 [Cloudflare 解析篇](custom-domain-cloudflare.md) 讲的「缓存分层」现象很像,但成因完全不同,判别方法也不一样:

| | 缓存未过期 | 尚未写入 |
|---|---|---|
| 现象 | 公共解析器给旧值 / 空 | 各层都给不出值 |
| **判别** | 问权威 NS **有**正确答案 | 问权威 NS 也是 **NXDOMAIN** |
| 怎么办 | 等 TTL,或换解析器验证 | 等平台写入,几十秒级 |

```bash
# 绕开一切缓存,直接问权威 NS
dig @$(dig +short NS <BASE_DOMAIN> | head -1) acreage.<BASE_DOMAIN>
```

拿同域下**已经生效**的另一个子域名做对照组,能立刻分清是「整个 zone 有问题」还是「这一条还没写」。

## 四、验证

```bash
D=acreage.<BASE_DOMAIN>

# 解析:权威与各公共解析器是否一致
dig @1.1.1.1 $D +short
dig @8.8.8.8 $D +short

# 证书:签给谁、谁签的、有效期
echo | openssl s_client -connect $D:443 -servername $D 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# 协议与状态
curl -s -o /dev/null -w "HTTP/%{http_version} %{http_code} TLS校验:%{ssl_verify_result}\n" "https://$D/"

# HTTP 是否自动升级
curl -sI "http://$D/" | head -1
```

本项目上线时的实测值,可以作为「正常长什么样」的参照:

- 解析:权威 NS 与 1.1.1.1 / 8.8.8.8 / 223.5.5.5 / 本机五层一致,都是 Cloudflare 代理 IP
- 证书:`CN=acreage.<BASE_DOMAIN>`,签发方 Google Trust Services WE1,`ssl_verify_result: 0`
- 协议:HTTP/2 200;`http://` 自动 301 到 `https://`

这一档**不需要**像 GitHub Pages 那样手动关掉源站的「强制 HTTPS」防回源循环——Cloudflare 端到端自己管,不存在跨平台回源。

## 硬限制与边界

- **免费档每个项目 100 个自定义域名**,项目数无硬性上限——所以规模化挂多个子域名站点,这一档比 GitHub Pages 合适得多(那边一个仓库只能一个站)
- 构建配置**不在版本库里**。好处是改配置不用提交代码,坏处是仓库里看不出这个站是怎么构建的——所以本仓库把它登记在 `sites/acreage/site.yaml` 的 `deploy` 段里,`golive check` 会校验项目名一致
- 平台自己构建,意味着**构建环境由平台决定**:Node 版本、可用工具链、超时,都是它的规则。锁死版本(`.node-version` + `NODE_VERSION`)是唯一可靠的自保

## 与 GitHub Pages 的机制对照

两个站上线走的是两条根本不同的路,放在一起才看得清各自适合什么:

| | GitHub Pages(第一站 Reverie) | Cloudflare Pages(第二站 Acreage) |
|---|---|---|
| 谁构建 | 你的 CI(Actions 官方三件套 workflow) | 平台自己拉代码构建 |
| 配置写在哪 | 仓库里的 YAML,**进版本库** | 平台面板表单,**不进版本库** |
| monorepo 怎么处理 | workflow 里 `cd` 到子目录 | Root directory 一格 |
| 站点数量 | **一个仓库只能一个站** | 一个账号多个项目 |
| 自定义域名 | 手填 CNAME,等平台签证书 | 同账号下自动写记录 + 自动签 |
| 构建环境 | 你在 workflow 里指定 | 平台镜像决定,靠版本文件锁 |
| 适合 | 旗舰站、构建流程要留痕 | 批量挂子域名站点 |

## 学会原理后,一条命令搞定

```bash
npx golive deploy acreage --dry-run
```

输出与本篇正文一致——前置检查(wrangler 是否就位、项目名是否与 `site.yaml` 登记的一致)加上底层命令:

```
cd sites/acreage && npm ci && npm run build
wrangler pages deploy dist --project-name golive-acreage
```

走平台 Git 集成时本地**不需要** wrangler 和 `CLOUDFLARE_API_TOKEN`,前置检查里这两项报 ✗ 是正常的;那条 wrangler 命令是给「不接 Git、手动直传」这条路准备的。
