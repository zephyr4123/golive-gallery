import { useRef } from 'react'
import { assets } from '../lib/assets'
import { useImageWidth, useMaskPositions } from '../lib/useMaskedMosaic'
import { useIsMobile } from '../lib/useIsMobile'
import { useStaggeredReveal } from '../lib/useStaggeredReveal'
import { MaskedCard } from './MaskedCard'

/** 三条卖点横幅,内容是这个 app 真正在做的三件事 */
const FEATURE_BARS = ['Book in 30 seconds', 'Live video consults', 'Your whole chart, one tap']

export function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const { containerRef, getAnimStyle } = useStaggeredReveal()

  const positions = useMaskPositions(sectionRef, cardRefs)
  const sectionHeight = positions[0]?.sh ?? 0
  const imageWidth = useImageWidth(assets.heroMosaic, sectionHeight)
  const isMobile = useIsMobile()
  // 宽屏能装下整张底图,focalX 实际不起作用(横向没有溢出可推)。
  // 窄屏只看得到底图约 28% 的宽度 —— 白背景和人脸进不来同一个窗口,试过往左收就只剩头发。
  // 所以窄屏索性让人脸当主体(0.62),文字对比度改由下面的遮罩解决。
  const focalX = isMobile ? 0.62 : 0.8

  const attachSection = (element: HTMLElement | null) => {
    sectionRef.current = element
    containerRef.current = element
  }

  return (
    <section
      id="overview"
      ref={attachSection}
      className="flex h-screen w-full flex-col gap-1.5 overflow-hidden px-3 pt-24 pb-1.5 md:gap-2 md:px-5 md:pb-2"
    >
      {FEATURE_BARS.map((label, i) => (
        <MaskedCard
          key={label}
          bgImage={assets.heroMosaic}
          position={positions[i]}
          imageWidth={imageWidth}
          focalX={focalX}
          cardRef={(el) => {
            cardRefs.current[i] = el
          }}
          style={getAnimStyle(i)}
          className="relative h-14 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:rounded-2xl"
        >
          {/* 窄屏窗口整个落在人脸上,得压一层白纱才读得清;宽屏能看到照片的白背景,不需要 */}
          <span className="absolute inset-0 bg-white/55 md:hidden" />
          {/* 原稿这行是居中的,但底图里人在右侧,居中会把字压在脸上读不清。
              左对齐落在照片的留白区,和主卡的文字同一条基线,反而更整。 */}
          <span className="relative z-10 flex h-full items-center pl-5 font-display text-lg font-light text-ink md:pl-8 md:text-3xl">
            {label}
          </span>
        </MaskedCard>
      ))}

      <MaskedCard
        bgImage={assets.heroMosaic}
        position={positions[3]}
        imageWidth={imageWidth}
        focalX={focalX}
        cardRef={(el) => {
          cardRefs.current[3] = el
        }}
        style={getAnimStyle(3)}
        className="relative min-h-0 w-full flex-1 overflow-hidden rounded-xl md:rounded-2xl"
      >
        {/* 窄屏的三段式遮罩:顶部提亮托住深色小字,中段透明让脸露出来,底部压暗托住白色大标题 */}
        <span className="absolute inset-0 bg-gradient-to-b from-white/75 via-transparent via-30% to-black/60 md:hidden" />

        <p className="absolute top-4 left-4 z-10 max-w-[200px] text-xs leading-4 font-semibold text-ink md:top-7 md:left-7 md:max-w-[300px] md:text-sm md:leading-5">
          A dentist's chair is never where you want to be.
          <br />
          Denta makes everything before it painless.
        </p>

        <div className="absolute bottom-5 left-3 z-10 md:bottom-8 md:left-4">
          <span className="mb-1 block text-xs font-semibold text-white md:mb-2 md:text-sm md:text-ink">Dental care app · iOS &amp; Android</span>
          {/* 轻字重 + 描边:Denta 原稿大标题的写法,只加粗形不加粗色 */}
          <h1
            className="font-display text-[clamp(3rem,11vw,11rem)] leading-[0.79] font-light tracking-tight text-white md:text-ink"
            style={{ WebkitTextStroke: '0.6px currentColor' }}
          >
            Denta
          </h1>
        </div>

        <span className="absolute right-4 bottom-6 z-10 text-xs font-semibold text-white md:right-8 md:bottom-10 md:text-sm">
          First consult is free
        </span>
      </MaskedCard>
    </section>
  )
}
