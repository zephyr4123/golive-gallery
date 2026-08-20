# 贡献指南

欢迎 PR。规则很短:

1. **站点自包含**:`sites/<name>/` 必须是独立 npm 项目,`cd` 进去 `npm i && npm run dev` 就能跑,不依赖仓库其余部分;
2. **一站一清单**:元数据只写 `site.yaml`(字段定义见 `cli/src/core/schema.ts`),画廊索引与教程互链都由它派生;
3. **站↔教程一一对应**:每个站点要有 `docs/sites/<name>.md` 教程,`golive new` 会替你把骨架建好;
4. **不进库的东西**:密钥/token(走环境变量)、MotionSites prompt 原文(只记编号)、node_modules、dist;
5. **提交前过门禁**:`npx golive check` 绿了再提,CI(validate.yml)跑的是同一条命令。

## 发版(维护者)

1. 在 `CHANGELOG.md` 顶部为新版本写好条目(`## [x.y.z] - 日期`);
2. `npm version patch|minor|major` —— 自动跑质量门禁、校验 CHANGELOG、改版本号、提交并打 tag;
3. `git push --follow-tags origin main` —— release.yml 被 tag 触发,校验三道门禁后自动创建 GitHub Release,正文就是你写的 CHANGELOG 条目。

tag 只能由 `npm version` 产生;手打 tag 若与 package.json 不一致,CI 会拒绝发版。
