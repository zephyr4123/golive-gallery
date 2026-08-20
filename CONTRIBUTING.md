# 贡献指南

欢迎 PR。规则很短:

1. **站点自包含**:`sites/<name>/` 必须是独立 npm 项目,`cd` 进去 `npm i && npm run dev` 就能跑,不依赖仓库其余部分;
2. **一站一清单**:元数据只写 `site.yaml`(字段定义见 `cli/src/core/schema.ts`),画廊索引与教程互链都由它派生;
3. **站↔教程一一对应**:每个站点要有 `docs/sites/<name>.md` 教程,`golive new` 会替你把骨架建好;
4. **不进库的东西**:密钥/token(走环境变量)、MotionSites prompt 原文(只记编号)、node_modules、dist;
5. **提交前过门禁**:`npx golive check` 绿了再提,CI(validate.yml)跑的是同一条命令。
