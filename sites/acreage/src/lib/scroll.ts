/**
 * 单页锚点跳转 —— 导航胶囊是悬浮的,直接 scrollIntoView 会把区块顶端压在胶囊底下,
 * 所以统一减去一个偏移量。尊重系统的「减少动态效果」设置。
 */
const NAV_OFFSET = 96

export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
}
