import { assets } from '../lib/assets'

/**
 * 客户跑马灯 —— 黑底窄条、无限左移、两端羽化,照 Acreage 落地页原样。
 * 字标是 prompt 素材仓提供的 SVG,各自带原色,统一用 brightness(0) invert(1) 压成纯白,
 * 与三个 Lottie 图标同一套处理,保证一条带子上视觉重量一致。
 */
function Row({ hidden }: { hidden?: boolean }) {
  return (
    <>
      {assets.logos.map((logo) => (
        <img
          key={logo.name}
          src={logo.src}
          alt={hidden ? '' : logo.name}
          aria-hidden={hidden}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-6 w-auto shrink-0 px-10 opacity-70 md:h-7 md:px-14"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ))}
    </>
  )
}

export default function LogoMarquee() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10 bg-black py-7"
      aria-label="Trusted by"
    >
      {/* 两端羽化,让条带看起来无始无终 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

      {/* 轨道是内容的两份,位移满一份宽度即回到原点,循环处看不出接缝;
          第二份对辅助技术隐藏,免得屏幕阅读器把同一串字标念两遍 */}
      <div className="flex w-max animate-[marquee_38s_linear_infinite] items-center motion-reduce:animate-none">
        <Row />
        <Row hidden />
      </div>
    </section>
  )
}
