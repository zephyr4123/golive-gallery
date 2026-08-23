import { useEffect, useRef, useState, type CSSProperties } from 'react'

/**
 * 区块进入视口时,内部元素按 index 依次上浮。
 *
 * 只触发一次:滚回去再滚回来不重播,否则长页面上会像在闪。
 * 每级延迟 120ms,缓动 cubic-bezier(0.16,1,0.3,1) —— 出自 health-portal 规格。
 */
export function useStaggeredReveal(threshold = 0.15) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // 内容默认是 opacity:0,靠观察器翻开。观察器不可用就直接显示 ——
    // 宁可少一段动效,也不能让整段内容永远隐身(打印、老浏览器、无头截图都撞得上)
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const getAnimStyle = (index: number): CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
  })

  return { containerRef, visible, getAnimStyle }
}

/**
 * 关键帧版的入场:给需要 blur-in / slide-up 这类原稿指定动效的元素用。
 *
 * 关键帧一挂就跑,不看视口——所以未可见时先按 opacity:0 压住,可见了才把 animation 接上。
 * 少了这一步,首屏以下的区块会在你滚到之前就把动画演完。
 */
export function entrance(visible: boolean, keyframes: string, duration: string, delay: string): CSSProperties {
  return visible ? { animation: `${keyframes} ${duration} ease-out ${delay} both` } : { opacity: 0 }
}
