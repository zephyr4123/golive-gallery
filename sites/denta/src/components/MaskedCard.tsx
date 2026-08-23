import type { CSSProperties, ReactNode } from 'react'
import type { MaskPosition } from '../lib/useMaskedMosaic'

interface MaskedCardProps {
  bgImage: string
  /** 未量到位置时为 undefined —— 首帧就是这个状态,此时不画背景 */
  position?: MaskPosition
  imageWidth: number
  /** 0–1,底图横向的关注点。人像在右侧就往 1 靠,不然卡片里只剩背景墙 */
  focalX: number
  className?: string
  children?: ReactNode
  cardRef?: (element: HTMLDivElement | null) => void
  style?: CSSProperties
}

/**
 * 一张卡片 = 共享底图上的一扇窗。
 *
 * 整个区块的卡片用同一张图、同一套缩放,各自把 backgroundPosition 偏到自己该在的位置,
 * 于是拼起来仍是完整的一幅照片,只是被卡片间距切成了几块。比每张卡各配一张图省带宽,
 * 视觉上也更整。
 */
export function MaskedCard({ bgImage, position, imageWidth, focalX, className = '', children, cardRef, style }: MaskedCardProps) {
  const mosaic: CSSProperties = position
    ? (() => {
        // 底图铺满区块高度后横向溢出的部分,按 focalX 决定往哪边推
        const overflow = imageWidth > position.sw ? imageWidth - position.sw : 0
        const focalOffset = overflow * focalX
        return {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: `auto ${position.sh}px`,
          backgroundPosition: `-${position.x + focalOffset}px -${position.y}px`,
          backgroundRepeat: 'no-repeat',
        }
      })()
    : {}

  return (
    <div ref={cardRef} className={className} style={{ ...mosaic, ...style }}>
      {children}
    </div>
  )
}
