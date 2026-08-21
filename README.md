<div align="center">

# 🌐 GoLive Gallery

**高审美网站示范 × 三档部署教学**

每个子域名是一个活的示范站,每个示范站背后是一篇能照做的部署教程。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Release](https://img.shields.io/github/v/release/zephyr4123/golive-gallery?label=release&color=blue)](https://github.com/zephyr4123/golive-gallery/releases)
![Status](https://img.shields.io/badge/status-%E9%A6%96%E7%AB%99%E5%B7%B2%E4%B8%8A%E7%BA%BF-brightgreen)

[🖼 已上线站点](#-已上线站点) · [部署教程](docs/) · [站点清单](sites/)

</div>

---

## 这是什么

一个开源教学项目,做两件事:

1. **收集高审美网站**——每个站点一个明确主题,归档成可独立运行的代码;
2. **教你把网站部署上线**——覆盖三档主流部署方式,每档都有活的示范站可访问、有教程可照做。

| 档位 | 方式 | 花费 | 难度 | 示范 |
|---|---|---|---|---|
| 🆓 免费托管 | GitHub Pages / Vercel / Cloudflare Pages | 0 元 | ⭐~⭐⭐ | [dreamcore ✅ 已上线](https://dreamcore.golive-gallery.art) |
| 🚇 内网穿透 | Cloudflare Tunnel / cpolar(ngrok 作临时演示) | 0 元起 | ⭐⭐~⭐⭐⭐ | 本机服务 → 公网子域名 |
| 🏭 工业级 | 云服务器 + 域名 + Caddy + HTTPS | 真金白银 | ⭐⭐⭐⭐+ | VPS 上的完整链路 |

## 🖼 已上线站点

**点站名直接进站**;右边三列回答"它是怎么上去的"。

| 站点 | 看点 | 部署档位 | 难度 | 上线教程 | 源码 |
|---|---|---|---|---|---|
| **[Reverie ↗](https://dreamcore.golive-gallery.art)**<br><sub>贩卖梦境的旅行社</sub> | 传送门穿越动效、九条梦境航线,滚动叙事多页 SPA | 🆓 GitHub Pages + Cloudflare 免费 HTTPS | ⭐ | [dreamcore 实战](docs/sites/dreamcore.md) | [`sites/dreamcore`](sites/dreamcore) |

> 内网穿透档与工业级档的示范站在建。本表登记的是各站 `site.yaml` 里 `status: live` 的站点,机器可读的完整清单跑 `npx golive list`。

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
