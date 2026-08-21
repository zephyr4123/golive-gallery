import { lazy, Suspense } from 'react'

// lottie-web 压缩后仍有 ~500 kB,若静态 import 会全部压进首包。
// 懒加载后它独立成 chunk,只有真正滚到服务区块时才下载;首屏不为一个图标买单。
const Player = lazy(() =>
  import('@lottiefiles/react-lottie-player').then((m) => ({ default: m.Player })),
)

/**
 * 服务线图标 —— 素材是彩色 Lottie,用 brightness(0) invert(1) 压成纯白,
 * 保证三个图标在黑底上视觉重量一致(直接用原色会一个抢眼一个发灰)。
 */
export default function LottieIcon({ src, size = 48 }: { src: string; size?: number }) {
  return (
    <div
      className="mb-6 flex items-center justify-center overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* fallback 占位与图标同尺寸,避免 chunk 到货时布局跳动 */}
      <Suspense fallback={<div style={{ width: size, height: size }} />}>
        <Player
          src={src}
          loop
          autoplay
          style={{ width: `${size}px`, height: `${size}px`, filter: 'brightness(0) invert(1)' }}
        />
      </Suspense>
    </div>
  )
}
