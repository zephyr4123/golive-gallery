# Changelog

本项目的版本记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

发版流程见 [CONTRIBUTING.md](CONTRIBUTING.md);每个版本的条目由人写、由 CI 校验(`scripts/changelog.mjs`),推 `v*` tag 自动创建 GitHub Release。

## [1.0.0] - 2026-08-21

**首个示范站正式上线,项目从"脚手架"进入"可用"。** 0.x 是只有骨架、没有活站的起步阶段;1.0.0 起,任何人都能打开一个真实运行的站点,照着教程把同样的链路走一遍。

### Added
- **首个示范站 Reverie**([dreamcore.golive-gallery.art](https://dreamcore.golive-gallery.art)):贩卖梦境的旅行社,480vh 滚动叙事主页 + 七个子页面,全站零死链;React 18 + TS + Vite + Tailwind v4 + Hash 路由,自包含 npm 项目
- **免费托管档教程成套**:`00 · 基础`(四个心智模型:注册商≠解析商 / CNAME 只认域名靠 Host 头分流 / NS 决定归属与 dig 链路 / 证书跟着域名走,每条配一条自查命令)、`GitHub Pages 篇`、`Cloudflare 解析篇`(含腾讯云 NS 入口在"域名管理"而非 DNSPod 的踩坑、零停机换 NS 的记录先行顺序、四层缓存对照表)
- **站点实战文档** `docs/sites/dreamcore.md`:架构图 + **MCP 自由排列组合的六步法**(按规格密度选主 prompt → 忠实还原并浏览器取证 → 列出"纸片感"死交互 → 叙事化页面地图 → 按风格检索逐页配 prompt 并统一主题 → 交互收口到单一转化终点),比单纯复制一份 prompt 得到的站丰富得多
- **CD 链路** `deploy-pages.yml`:官方三件套构建部署,推送即上线;自定义域名 + Cloudflare 边缘 HTTPS 全链路生效
- 根 README 新增「已上线站点」陈列表:站名直达线上站,并列出档位/难度/教程/源码

### Changed
- 素材方针定型:MotionSites CDN 资源直接引用,不下载入仓(仓库不膨胀,许可清晰);`site.yaml` 的 `source.assets` 只作溯源登记
- DNS 托管从 DNSPod 迁至 Cloudflare,HTTPS 由 CF 边缘终结;`infra/dns/records.md` 同步登记
- 官方示范实例的真实地址公开:教学正文与代码仍用 `<BASE_DOMAIN>` 占位保持可复用,但示范站本就是给人看的,不再藏地址

### Removed
- `sites/hello` 探针站:骨架已由真实站点验证,退场
- `.playwright-mcp/` 与 `*-check.png` 等浏览器验证产物移出版本库并加入忽略

### Fixed
- CJK 语境下的 Markdown 渲染失效:加粗包裸 URL 被 GFM autolink 吞掉 `**`;`**文字。**中文` 因不满足 CommonMark right-flanking 规则而不闭合。全部 md 文件已过 GitHub 渲染 API 复验

## [0.1.0] - 2026-08-20

脚手架首版:仓库骨架 + golive CLI + 教程框架 + CI 门禁。

### Added
- **golive CLI**(Node ≥ 24 原生跑 TS,零构建):`list / check / new / dev / build / preview / deploy --dry-run / tunnel`;commands→core→adapters 三层单向依赖,site.yaml 为每站唯一真相源(zod 校验),五种部署方式各一个适配器
- **sites/hello** 示例站(`golive new` 自举产出,自包含 npm 项目)
- **docs** 三档部署教程骨架(免费托管 / 内网穿透 / VPS),预埋动工前核实的平台硬事实
- **infra** 配置模板:Caddyfile、cloudflared、cpolar、DNS 登记表(全占位符,零密钥)
- **CI**:validate.yml 门禁(与本地 `golive check` 同一份代码);release.yml tag 即发版
- 对抗性审查修复 14 项(循环锚点防护、Windows 兼容、new 前置校验、退出码语义等)

### Changed
- 根域名收敛为 `BASE_DOMAIN` 单一配置:经 `.env` 的 `GOLIVE_BASE_DOMAIN` 注入,不硬编码进仓库
