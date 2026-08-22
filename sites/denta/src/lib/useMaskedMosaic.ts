import { useEffect, useState, type RefObject } from 'react'

/** 一张卡片在共享底图上开的那扇「窗」:x/y 是卡片相对区块的偏移,sw/sh 是区块尺寸 */
export interface MaskPosition {
  x: number
  y: number
  sw: number
  sh: number
}

/**
 * 马赛克的第一半:量出每张卡片相对区块左上角的偏移。
 *
 * 之所以不能只靠 ResizeObserver 观察区块:本站加载四套 Google Fonts,字体换上后
 * 文字尺寸变化会推着卡片挪位,而区块本身是 h-screen 高度不变——观察不到。
 * 所以额外挂一次 document.fonts.ready 重量,否则首屏会定格在字体未就位时的错位上。
 */
export function useMaskPositions(
  sectionRef: RefObject<HTMLElement | null>,
  cardRefs: RefObject<(HTMLElement | null)[]>,
): MaskPosition[] {
  const [positions, setPositions] = useState<MaskPosition[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const measure = () => {
      const s = section.getBoundingClientRect()
      setPositions(
        (cardRefs.current ?? []).map((card) => {
          if (!card) return { x: 0, y: 0, sw: s.width, sh: s.height }
          const c = card.getBoundingClientRect()
          return { x: c.left - s.left, y: c.top - s.top, sw: s.width, sh: s.height }
        }),
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    document.fonts?.ready.then(measure).catch(() => {
      // 字体接口不可用时退回已量到的位置:马赛克会略有错位,但不该让整屏挂掉
      console.warn('[denta] document.fonts.ready 不可用,马赛克跳过字体就位后的重量')
    })

    return () => observer.disconnect()
  }, [sectionRef, cardRefs])

  return positions
}

/**
 * 马赛克的另一半:算出底图按区块高度等比铺满时会有多宽。
 * 卡片靠 backgroundPosition 各取一段,这个宽度决定了横向还剩多少可平移的余量。
 */
export function useImageWidth(src: string, sectionHeight: number): number {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setNatural({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      // 底图挂了卡片会退化成透明,页面还能读——但必须留下能定位的日志,不静默
      console.error(`[denta] 马赛克底图加载失败,卡片将无背景: ${src}`)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  if (!natural || sectionHeight <= 0) return 0
  return natural.width * (sectionHeight / natural.height)
}
