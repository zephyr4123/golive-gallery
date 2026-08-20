import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

const SERIF = "'Viaoda Libre', serif"
const SANS = "'Imprima', sans-serif"
const INK = '#0a0608'
const WARM = 'rgba(255, 249, 244, 0.94)'
const WARM_DIM = 'rgba(255, 249, 244, 0.72)'
const PAD_X = 'clamp(24px, 6vw, 64px)'

// 环境氛围视频:MotionSites 视觉基底自带的 CDN 资源,项目方针是直用不下载
const AMBIENT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_202301_db51e299-b2f4-4cea-80de-8a6465b7532a.mp4'

/** 进入视口时 fade + 上浮 + 去模糊,只触发一次(视觉基底的 blurUp 动效,用 IO + CSS 复刻) */
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode
  delay?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    // 为什么:拿不到节点或环境不支持 IO 时直接亮起,宁可没动效也绝不让内容永久隐身
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(40px)',
        filter: shown ? 'blur(0px)' : 'blur(20px)',
        transition: `opacity 1s ease-out ${delay}s, transform 1s ease-out ${delay}s, filter 1s ease-out ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** 下划线式 CTA 链接(视觉基底的 border-b 订阅行改造为路由跳转),hover 时箭头右移 */
function UnderlineLink({ to, color, children }: { to: string; color: string; children: ReactNode }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to={to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 14,
        paddingBottom: 10,
        fontFamily: SANS,
        fontSize: 12,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color,
        textDecoration: 'none',
        borderBottom: `1px solid ${hover ? color : `${color}59`}`,
        transition: 'border-color 0.35s ease',
      }}
    >
      {children}
      <span
        aria-hidden
        style={{ display: 'inline-block', transform: hover ? 'translateX(6px)' : 'none', transition: 'transform 0.35s ease' }}
      >
        →
      </span>
    </Link>
  )
}

/** 页脚 prev/next 航线跳转,hover 时染上目标航线自己的颜色 */
function PagerLink({ voyage, dir }: { voyage: Voyage; dir: 'prev' | 'next' }) {
  const [hover, setHover] = useState(false)
  const isNext = dir === 'next'
  const arrow = (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        transform: hover ? `translateX(${isNext ? 6 : -6}px)` : 'none',
        transition: 'transform 0.35s ease',
      }}
    >
      {isNext ? '→' : '←'}
    </span>
  )
  return (
    <Link
      to={`/voyages/${voyage.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isNext ? 'flex-end' : 'flex-start',
        textAlign: isNext ? 'right' : 'left',
        gap: 12,
        padding: `48px ${PAD_X}`,
        textDecoration: 'none',
        background: hover ? `${voyage.color}0d` : 'transparent',
        transition: 'background 0.35s ease',
      }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: hover ? voyage.color : WARM_DIM,
          transition: 'color 0.35s ease',
        }}
      >
        {isNext ? 'Next dream' : 'Previous dream'}
      </span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 14,
          fontFamily: SERIF,
          fontSize: 'clamp(24px, 3.2vw, 40px)',
          lineHeight: 1.05,
          color: hover ? voyage.color : WARM,
          transition: 'color 0.35s ease',
        }}
      >
        {isNext ? (
          <>
            {voyage.title} {arrow}
          </>
        ) : (
          <>
            {arrow} {voyage.title}
          </>
        )}
      </span>
    </Link>
  )
}

/** 主 CTA 色块:整块可点,大面积铺该航线的粉彩色 */
function ReserveBand({ voyage }: { voyage: Voyage }) {
  const [hover, setHover] = useState(false)
  return (
    <Link
      to="/reserve"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'block', textDecoration: 'none', background: voyage.color, color: INK }}
    >
      <div
        style={{
          maxWidth: 1480,
          margin: '0 auto',
          padding: `clamp(72px, 12vh, 120px) ${PAD_X}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.65 }}>
          Voyage {voyage.title} · Reverie
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '0.35em',
            fontFamily: SERIF,
            fontSize: 'clamp(44px, 8vw, 110px)',
            lineHeight: 0.98,
          }}
        >
          Reserve <em style={{ fontFamily: SANS, fontStyle: 'normal', letterSpacing: '-0.02em' }}>this</em> dream
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              marginLeft: '0.15em',
              transform: hover ? 'translateX(14px)' : 'none',
              transition: 'transform 0.4s ease',
            }}
          >
            →
          </span>
        </span>
        <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, opacity: 0.78, maxWidth: 460 }}>
          {voyage.departure} · {voyage.duration.toLowerCase()}. Our navigators hold a berth open until you wake.
        </span>
      </div>
    </Link>
  )
}

/** 未知 slug 的兜底页:优雅收场,绝不白屏 */
function UnchartedDream() {
  return (
    <div style={{ minHeight: '100vh', background: INK, color: WARM, overflowX: 'hidden' }}>
      <SiteNav />
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 32,
          padding: `140px ${PAD_X} 96px`,
        }}
      >
        <Reveal>
          <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#dcd2f2' }}>
            Voyage unknown
          </span>
        </Reveal>
        <Reveal delay={0.12}>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: 'clamp(38px, 7vw, 92px)',
              lineHeight: 1.05,
              maxWidth: 900,
              margin: 0,
            }}
          >
            This dream has <em style={{ fontStyle: 'italic', color: '#f3cdd6' }}>not</em> been charted
          </h1>
        </Reveal>
        <Reveal delay={0.24}>
          <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: WARM_DIM, maxWidth: 440, margin: 0 }}>
            Our navigators find no such passage in the codex. Perhaps it is still being dreamt — or waiting for you to commission it.
          </p>
        </Reveal>
        <Reveal delay={0.36}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, justifyContent: 'center' }}>
            <UnderlineLink to="/voyages" color="#c3e3f4">
              Return to the charted voyages
            </UnderlineLink>
            <UnderlineLink to="/atelier" color="#f0e4c0">
              Commission it at the atelier
            </UnderlineLink>
          </div>
        </Reveal>
      </main>
    </div>
  )
}

export default function VoyageDetail() {
  const { slug } = useParams<{ slug: string }>()
  const voyage = VOYAGES.find((v) => v.slug === slug)

  // 为什么:prev/next 是同一路由换参数,组件不卸载,浏览器不会自动回到页首
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!voyage) return <UnchartedDream />

  const index = VOYAGES.indexOf(voyage)
  const number = String(index + 1).padStart(2, '0')
  const prev = VOYAGES[(index + VOYAGES.length - 1) % VOYAGES.length]
  const next = VOYAGES[(index + 1) % VOYAGES.length]
  // 标题末词做斜体点缀,复刻视觉基底"serif 大字 + italic span"的编辑排版语言
  const words = voyage.title.split(' ')
  const lead = words.slice(0, -1).join(' ')
  const tail = words[words.length - 1]

  const microLabel: CSSProperties = {
    fontFamily: SANS,
    fontSize: 11,
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    color: voyage.color,
  }

  return (
    <div style={{ minHeight: '100vh', background: INK, color: WARM, overflowX: 'hidden' }}>
      <SiteNav />

      {/* key 换 slug:让 prev/next 跳转后所有 Reveal 重新入场 */}
      <main key={voyage.slug}>
        {/* Hero:底部环境视频 + 巨型编号标题 */}
        <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'cover',
              objectPosition: 'bottom',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          >
            <source src={AMBIENT_VIDEO} type="video/mp4" />
          </video>
          {/* 暗色渐隐罩:把亮色视频压进深梅黑底,视频加载失败时纯色底同样成立 */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, ${INK} 0%, rgba(10,6,8,0.35) 55%, ${INK} 100%)`,
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              maxWidth: 1480,
              margin: '0 auto',
              width: '100%',
              padding: `clamp(120px, 18vh, 180px) ${PAD_X} clamp(64px, 10vh, 120px)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 32,
            }}
          >
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 48px)', color: voyage.color, lineHeight: 1 }}>
                  {number}
                </span>
                <span style={microLabel}>Voyage {number} of 09</span>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <h1 style={{ margin: 0, fontWeight: 400, lineHeight: 0.95 }}>
                <span style={{ display: 'block', fontFamily: SERIF, fontSize: 'clamp(56px, 10.5vw, 150px)', color: WARM }}>
                  {lead ? `${lead} ` : ''}
                  <em style={{ fontStyle: 'italic', color: voyage.color }}>{tail}</em>
                </span>
                <span
                  style={{
                    display: 'block',
                    marginTop: 18,
                    fontFamily: SANS,
                    fontSize: 'clamp(20px, 3vw, 40px)',
                    letterSpacing: '-0.02em',
                    color: WARM_DIM,
                  }}
                >
                  {voyage.desc.toLowerCase()}
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.28}>
              <UnderlineLink to="/reserve" color={voyage.color}>
                Reserve this dream
              </UnderlineLink>
            </Reveal>
          </div>
        </section>

        {/* 信息条:duration / departure / 航线色 */}
        <Reveal>
          <section
            style={{
              borderTop: `1px solid ${voyage.color}40`,
              borderBottom: `1px solid ${voyage.color}40`,
            }}
          >
            <div
              style={{
                maxWidth: 1480,
                margin: '0 auto',
                padding: `36px ${PAD_X}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(28px, 6vw, 96px)',
              }}
            >
              {[
                ['Chart nº', `${number} / 09`],
                ['Duration', voyage.duration],
                ['Departure', voyage.departure],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={microLabel}>{label}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 'clamp(18px, 2vw, 24px)', color: WARM }}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Story:编辑式正文 + 背景巨型编号水印 */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              right: '-0.08em',
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: SERIF,
              fontSize: 'clamp(220px, 42vw, 560px)',
              lineHeight: 1,
              color: voyage.color,
              opacity: 0.07,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {number}
          </span>
          <div
            style={{
              position: 'relative',
              maxWidth: 1480,
              margin: '0 auto',
              padding: `clamp(96px, 16vh, 160px) ${PAD_X}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 36,
            }}
          >
            <Reveal>
              <span style={microLabel}>From the ship's codex</span>
            </Reveal>
            <Reveal delay={0.15}>
              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  fontFamily: SANS,
                  fontSize: 'clamp(19px, 2.1vw, 27px)',
                  lineHeight: 1.72,
                  color: WARM,
                }}
              >
                <span
                  style={{
                    float: 'left',
                    fontFamily: SERIF,
                    fontSize: '3.2em',
                    lineHeight: 0.85,
                    padding: '0.08em 0.18em 0 0',
                    color: voyage.color,
                  }}
                >
                  {voyage.story.charAt(0)}
                </span>
                {voyage.story.slice(1)}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36 }}>
                <UnderlineLink to="/immersions" color={voyage.color}>
                  Sample an immersion first
                </UnderlineLink>
                <UnderlineLink to="/journal" color={voyage.color}>
                  Read dreamers' accounts
                </UnderlineLink>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 主 CTA:整幅航线色块 */}
        <Reveal>
          <ReserveBand voyage={voyage} />
        </Reveal>

        {/* Prev / Next + 回目录 */}
        <nav aria-label="Voyage navigation" style={{ borderTop: '1px solid rgba(255,249,244,0.14)' }}>
          <div style={{ maxWidth: 1480, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
            <PagerLink voyage={prev} dir="prev" />
            <PagerLink voyage={next} dir="next" />
          </div>
          <div
            style={{
              borderTop: '1px solid rgba(255,249,244,0.14)',
              display: 'flex',
              justifyContent: 'center',
              padding: `40px ${PAD_X} 64px`,
            }}
          >
            <UnderlineLink to="/voyages" color={voyage.color}>
              All nine voyages
            </UnderlineLink>
          </div>
        </nav>
      </main>
    </div>
  )
}
