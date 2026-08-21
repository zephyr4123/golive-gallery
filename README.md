<div align="center">

# 🌐 GoLive Gallery

**高审美网站示范 × 三档部署教学**

每个子域名是一个活的示范站,每个示范站背后是一篇能照做的部署教程。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Release](https://img.shields.io/github/v/release/zephyr4123/golive-gallery?label=release&color=blue)](https://github.com/zephyr4123/golive-gallery/releases)
![Status](https://img.shields.io/badge/status-%E4%B8%A4%E7%AB%99%E5%B7%B2%E4%B8%8A%E7%BA%BF-brightgreen)

[🖼 已上线站点](#-已上线站点) · [🔌 MCP 建站法](#-mcp--motionsites把-prompt-库变成-ai-能检索的能力) · [部署教程](docs/) · [站点清单](sites/)

</div>

---

## 这是什么

一个开源教学项目,做两件事:

1. **收集高审美网站**——每个站点一个明确主题,归档成可独立运行的代码;
2. **教你把网站部署上线**——覆盖三档主流部署方式,每档都有活的示范站可访问、有教程可照做。

| 档位 | 方式 | 花费 | 难度 | 示范 |
|---|---|---|---|---|
| 🆓 免费托管 | GitHub Pages / Cloudflare Pages / Vercel | 0 元 | ⭐~⭐⭐ | [Reverie ✅](https://dreamcore.golive-gallery.art) · [Acreage ✅](https://acreage.golive-gallery.art) |
| 🚇 内网穿透 | Cloudflare Tunnel / cpolar(ngrok 作临时演示) | 0 元起 | ⭐⭐~⭐⭐⭐ | 本机服务 → 公网子域名 |
| 🏭 工业级 | 云服务器 + 域名 + Caddy + HTTPS | 真金白银 | ⭐⭐⭐⭐+ | VPS 上的完整链路 |

## 🖼 已上线站点

**点站名直接进站**;右边三列回答"它是怎么上去的"。

| 站点 | 看点 | 部署档位 | 难度 | 上线教程 | 源码 |
|---|---|---|---|---|---|
| **[Reverie ↗](https://dreamcore.golive-gallery.art)**<br><sub>贩卖梦境的旅行社</sub> | 传送门穿越动效、九条梦境航线,滚动叙事多页 SPA | 🆓 GitHub Pages<br><sub>CI 构建后推 artifact</sub> | ⭐ | [dreamcore 实战](docs/sites/dreamcore.md) | [`sites/dreamcore`](sites/dreamcore) |
| **[Acreage ↗](https://acreage.golive-gallery.art)**<br><sub>精准农业收割服务</sub> | 视频首屏、深浅交替、Logo 跑马灯、逐字校验表单,单页锚点站 | 🆓 Cloudflare Pages<br><sub>平台直连 Git 自建</sub> | ⭐⭐ | [acreage 实战](docs/sites/acreage.md) | [`sites/acreage`](sites/acreage) |

> 内网穿透档与工业级档的示范站在建。本表登记的是各站 `site.yaml` 里 `status: live` 的站点,机器可读的完整清单跑 `npx golive list`。

## 🔌 MCP × MotionSites:把 prompt 库变成 AI 能检索的能力

这个项目最大的收获不是两个网站,是一件更底层的事:**当 AI 能直接检索整个 prompt 库,建站的协作方式就变了。**

**没有 MCP 的时候**,流程是人肉的:打开 prompt 库 → 一页页翻预览图 → 挑中一个 → 复制正文 → 粘给 AI → 得到一个页面。想要更多区块就再翻一遍。挑什么全凭预览图好不好看,翻到哪算哪——库里到底有什么、哪几个能拼成一套,你不知道。

**接上 MCP 之后**,AI 手里多了四件工具:

| 工具 | 干什么 |
|---|---|
| `search_prompts` | 按风格描述全库检索,带相关度排序 |
| `list_prompts` | 按分类 / 热度 / 新旧浏览 |
| `get_prompt` | 拉某个 prompt 的**完整规格正文** |
| `get_related_prompts` | 按视觉风格反查相似条目 |

于是「挑一个抄下来」变成了「**检索 → 读规格 → 判断 → 组合**」。本仓库两个站,恰好是这套方法的两个相反方向。

### 实证一:1 个 prompt,摊成 8 页

`dreamcore-landing` 是一份规格极密的整页 prompt,照它实现出来是个很漂亮的落地页——但也就一页。**滚是能滚,导航点不动、卡片点不动,像一张纸。**

补页面的办法不是回库里再挑几个抄,而是让 AI 带着「这个站还缺什么」去检索:

```
search_prompts("gallery grid showcase collection detail cards elegant")  ← 目录页与详情卡怎么做
search_prompts("booking contact form elegant minimal luxury travel")     ← 预约表单页怎么做
```

注意 `search_prompts` **只返回元数据,不返回正文**——但这已经够了。检索结果告诉 AI:库里存在哪些页面类型、什么风格能和主站配得上。剩下的在主 prompt 那套设计系统(字体、配色、动效语汇)上扩展。最终 **8 个页面、9 条路由、全站零死链**,而 `get_prompt` 全程只调用过一次。

### 实证二:5 个 prompt,收成 1 页

第二站反过来。`acreage-farming-hero` 的规格正文只有**一句话**:

> Precision farming landing page with dark/light sections, hero video background, stats grid, logo marquee, and service cards.

一行 CSS 都没有。真正的实现散在另外四个区块 prompt 里——而且它们的 id 前缀被作者拼错成了 `arceage`:**搜 `acreage` 一个都搜不到,搜 `arceage` 才出来。**

```
get_related_prompts("custom-spaces")  ← 顺藤摸到这个家族的入口
search_prompts("arceage")             ← Services / Stats / Testimonial / Contact 四件套
search_prompts("acreage harvest farm agriculture crops tractor landing hero")  ← 补上整页规格
```

五份规格同时在上下文里,才拼得出这一页:视频首屏 → 黑底数字 → Logo 跑马灯 → 全幅田野图上的服务区 → 白底证言 → 白底表单。**人翻预览图,很难把拼写都不一样的五个条目联系成一套。**

### 这层抽象改变了什么

| | 人工浏览 + 复制粘贴 | 接上 MCP |
|---|---|---|
| 发现 | 翻预览图,看到什么算什么 | 全库关键词检索 + 相似风格反查 |
| 判断 | 凭预览图好不好看 | 读完整规格,按**规格密度**选主 prompt |
| 组合 | 一次一个,粘完手工缝合 | 多份规格同时在上下文里,按内容需要伸缩 |
| 产出 | 一个 prompt ≈ 一个页面 | 1 个摊成 8 页,或 5 个收成 1 页 |

一句话:**prompt 库从「给人浏览的目录」,变成了「AI 能检索、能读懂、能组合的能力」**。页面数不再由 prompt 数决定,由内容需要决定。

### 这条路的坑:检索不到 = 不存在

第二站第一次搜索只试了 `arceage` 这个拼错的前缀,**漏掉了 `acreage-farming-hero` 这条整页规格**。看不到整页规格的后果是:自己编了首屏、编了四个原设计里根本不存在的页面、还给服务区加了一层压暗遮罩把那块绿压成近黑——视觉上和原设计差出一大截,全部返工重做。

沉淀成两条判据:

1. **动手前先确认「整页规格」是否存在。** 区块 prompt 只说这一块长什么样,整页规格才说区块之间怎么排、哪里深哪里浅。
2. **搜索要把拼写变体一起试。** 库是人建的,id 会拼错;检索不到的东西,对 AI 而言就等于不存在。

完整复盘见 [Acreage 实战](docs/sites/acreage.md)。

### 自己接上

```bash
claude mcp add --transport http motionsites https://xgdzyqfalbibzelpdpvr.supabase.co/functions/v1/mcp
```

首次调用走 OAuth 授权。免费账号经本集成最多打开 3 个免费 prompt,premium prompt 需要 MotionSites 订阅。

## 仓库结构

```
sites/      展品:一站 = 一目录 = 一个子域名 = 一种部署方式(自包含,cd 进去 npm i 就能跑)
docs/       讲解词:三档部署原理 + 每站一篇实战教程(与 sites/ 机器校验一一对应)
gallery/    展厅入口:<BASE_DOMAIN> 主站,由各站 site.yaml 自动生成
cli/        讲解员:golive 命令行,统一管理站点的开发/校验/部署
infra/      后厨配方:VPS 的 Caddy 配置、隧道配置模板、DNS 记录(全部占位符化,零密钥)
```

## 快速开始

```bash
git clone <本仓库> && cd golive_gallery
npm i                  # 安装 golive CLI(需要 Node ≥ 24)
cp .env.example .env   # 填入你自己的根域名(GOLIVE_BASE_DOMAIN),.env 不进仓库
npx golive list        # 看看有哪些站
npx golive check       # 校验站点清单与教程对应关系(CI 跑的就是这条)

cd sites/<某个站>       # 每个站都是自包含的普通 npm 项目
npm i && npm run dev   # 与仓库其余部分零耦合
```

## 设计原则

- **手动路径是正文,CLI 是章末奖励**——教程永远先教手动步骤,`golive deploy --dry-run` 会打印出与教程一致的底层命令;
- **一份 site.yaml 派生一切**——部署配置、画廊索引、教程互链、CI 校验,都从每站的清单文件生成,人工维护必然漂移;
- **静态站不上容器**——依赖隔离靠每站独立 node_modules + lockfile;Docker 只在 VPS 教程里作为教学内容出现;
- **配置注入,仓库泛化**——token 走环境变量,根域名走 .env(`GOLIVE_BASE_DOMAIN`),任何人 fork 后配上自己的域名即可用;本仓库的官方示范实例部署在 golive-gallery.art,各站在线地址见站点清单。

## License

代码 [MIT](LICENSE)。站点视觉素材的来源与授权在各站 `site.yaml` 中逐一登记。
