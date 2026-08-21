/**
 * 客户跑马灯 —— 结构与动效照 Acreage 落地页原样:黑底窄条、无限左移、两端羽化。
 *
 * 原 prompt 的素材是 Canva / Webflow / zendesk / pendo / Glide 五个真实公司的 logo。
 * 那是 MotionSites 模板里的占位素材,但本站会真的公开发布 —— 把真实公司挂成一家虚构
 * 农机公司的客户等于伪造背书,所以只换素材、不换机制:用站内已有的虚构种植户字标。
 */
const CLIENTS = [
  'Kestrel Ridge',
  'Valley Wheat',
  'HarvestYield',
  'Red Fork Grain',
  'GreenAcres',
  'Palouse Co-op',
  'Blackland Union',
]

function Row() {
  return (
    <>
      {CLIENTS.map((name) => (
        <span
          key={name}
          className="shrink-0 whitespace-nowrap px-10 font-accent text-2xl italic text-white/45 md:px-14 md:text-3xl"
        >
          {name}
        </span>
      ))}
    </>
  )
}

export default function LogoMarquee() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10 bg-black py-7"
      aria-label="Growers we work with"
    >
      {/* 两端羽化,让条带看起来是无始无终的 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent" />

      {/* 轨道复制一份,位移满一份宽度即回到原点,循环处看不出接缝 */}
      <div className="flex w-max animate-[marquee_38s_linear_infinite] items-center motion-reduce:animate-none">
        <Row />
        <Row />
      </div>
    </section>
  )
}
