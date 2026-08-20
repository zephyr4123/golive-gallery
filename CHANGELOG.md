# Changelog

本项目的版本记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/),版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

发版流程见 [CONTRIBUTING.md](CONTRIBUTING.md);每个版本的条目由人写、由 CI 校验(`scripts/changelog.mjs`),推 `v*` tag 自动创建 GitHub Release。

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
- 域名定为 <BASE_DOMAIN>(腾讯云注册),CLI 侧收敛为 `BASE_DOMAIN` 单一常量
