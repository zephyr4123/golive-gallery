import type { Site } from '../core/registry.ts'

export interface CheckResult {
  ok: boolean
  label: string
  hint?: string
}

// 部署适配器:宁窄勿宽,骨架阶段只定义三件事——
//   preflight  部署前置检查(凭据/工具/配置是否齐全),可独立执行
//   plan       将执行的底层命令清单(--dry-run 的输出,与教程正文一一对应)
//   docsLink   对应教程路径:报错时把人引回教材,这是教学项目 CLI 的本分
// 真正的 deploy() 等首个真实站点接入该目标时再实现——有真实用例才写代码。
export interface DeployAdapter {
  target: string
  docsLink: string
  preflight(site: Site): CheckResult[]
  plan(site: Site): string[]
}
