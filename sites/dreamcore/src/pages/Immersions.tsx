import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// 资产直用 MotionSites gateway-portal 规格给定的 CDN URL(项目方针:不本地化)
const PORTAL_BG = 'https://soft-zoom-63098134.figma.site/_assets/v11/4f01f62fc1cd17604f3668ae151c0cdeb0a61f93.png'
const WORLD_BG =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_231253_53c0854c-d13c-42c1-9fc0-17e87cd34091.png&w=1280&q=85'

// 三张 reel 卡图与主页三卡同源,维持视觉血缘
const REEL_SEEDS = [
  {
    slug: 'vivid-drifts',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
    reelTitle: 'Reel I · The Tilt',
    line: 'Filmed where gravity forgets its manners — stairways pour upward and the horizon steps politely aside.',
  },
  {
    slug: 'deep-currents',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
    reelTitle: 'Reel II · Lantern Fathoms',
    line: 'Twenty fathoms below ordinary sleep, unremembered thoughts pass the lens like slow lanterns.',
  },
  {
    slug: 'gilded-dusk',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
    reelTitle: 'Reel III · The Long Evening',
    line: 'One sunset, held open past all reason — amber light pooling on every surface it can find.',
  },
]

interface Reel {
  image: string
  reelTitle: string
  line: string
  voyage: Voyage
}

// 数据源里找不到对应航线就丢弃该区块——绝不渲染指向不存在详情页的死链接
const REELS: Reel[] = REEL_SEEDS.flatMap((seed) => {
  const voyage = VOYAGES.find((v) => v.slug === seed.slug)
  return voyage ? [{ image: seed.image, reelTitle: seed.reelTitle, line: seed.line, voyage }] : []
})

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// 品牌粉彩是 6 位 hex,转 rgba 供发光阴影用;解析失败退回暖白而非让光晕悄悄消失
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return `rgba(255,245,235,${alpha})`
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isMobile
}

// 滚动进入视口时揭示一次;环境缺 IntersectionObserver 时直接显示,不让内容永远隐藏
function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return { ref, visible }
}

const revealStyle = (visible: boolean, delayMs = 0): CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(26px)',
  transition: `opacity 0.9s ease ${delayMs}ms, transform 0.9s ease ${delayMs}ms`,
})

const OVERLINE_STYLE: CSSProperties = {
  fontFamily: "'Imprima', sans-serif",
  fontSize: 11,
  letterSpacing: '0.26em',
  textTransform: 'uppercase',
}

// gateway-portal 签名组件的 Reverie 版:三张 reel 卡骑在下坠的弧线上,居中卡实、两侧卡虚
function ArcReelCarousel({ reels, isMobile }: { reels: Reel[]; isMobile: boolean }) {
  const [active, setActive] = useState(() => Math.floor(reels.length / 2))
  const total = reels.length
  const half = Math.floor(total / 2)

  const cardW = isMobile ? 230 : 300
  const cardH = isMobile ? 330 : 420
  const stepX = isMobile ? 175 : 295
  const dropY = isMobile ? 34 : 52
  const tilt = isMobile ? 7 : 8

  const advance = (dir: number) => setActive((a) => (a + dir + total) % total)
  const current = reels[active]

  return (
    <div style={{ position: 'relative', width: '100%', height: isMobile ? 460 : 560 }}>
      {reels.map((reel, i) => {
        const pos = ((i - active + total + half) % total) - half
        const abs = Math.abs(pos)
        const isCenter = pos === 0
        const glow = hexToRgba(reel.voyage.color, 0.3)
        return (
          <Link
            key={reel.voyage.slug}
            to={`/voyages/${reel.voyage.slug}`}
            aria-hidden={!isCenter}
            tabIndex={isCenter ? 0 : -1}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: cardW,
              height: cardH,
              marginLeft: -cardW / 2,
              transform: `translateX(${pos * stepX}px) translateY(${abs * dropY + (isCenter ? (isMobile ? 22 : 30) : 0)}px) rotate(${pos * tilt}deg)`,
              opacity: isCenter ? 1 : Math.max(0, 0.6 - (abs - 1) * 0.2),
              zIndex: 100 - abs,
              pointerEvents: isCenter ? 'auto' : 'none',
              transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, box-shadow 0.55s ease',
              borderRadius: isMobile ? 22 : 28,
              overflow: 'hidden',
              textDecoration: 'none',
              backgroundImage: `url(${reel.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: isCenter ? `1px solid ${hexToRgba(reel.voyage.color, 0.55)}` : '1px solid rgba(255,255,255,0.16)',
              boxShadow: isCenter
                ? `0 14px 36px rgba(0,0,0,0.5), 0 0 60px ${glow}, 0 0 110px ${hexToRgba(reel.voyage.color, 0.16)}`
                : 'inset 0 1px 1px rgba(255,255,255,0.2)',
              filter: isCenter ? 'none' : 'saturate(0.7) brightness(0.75)',
            }}
          >
            {/* 左上角 View Reel 药丸,呼应主页照片卡 */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 12px 6px 6px',
                borderRadius: 999,
                background: 'rgba(10,6,8,0.45)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="8" height="10" viewBox="0 0 10 12" fill="none">
                  <path d="M1 1l8 5-8 5V1z" fill="#1a0a00" />
                </svg>
              </span>
              <span style={{ fontFamily: "'Imprima', sans-serif", fontSize: 12, color: '#fff' }}>View Reel</span>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '68%',
                background: 'linear-gradient(to top, rgba(6,3,5,0.88) 0%, rgba(6,3,5,0.35) 55%, transparent 100%)',
              }}
            />
            <div style={{ position: 'absolute', left: 18, right: 18, bottom: 18 }}>
              <div style={{ ...OVERLINE_STYLE, color: reel.voyage.color, marginBottom: 8 }}>{reel.reelTitle}</div>
              <h3
                style={{
                  fontFamily: "'Viaoda Libre', serif",
                  fontSize: isMobile ? 24 : 30,
                  color: '#fff',
                  lineHeight: 1.1,
                  margin: '0 0 8px',
                  textShadow: '0 2px 14px rgba(0,0,0,0.6)',
                }}
              >
                {reel.voyage.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Imprima', sans-serif",
                  fontSize: isMobile ? 12 : 13,
                  lineHeight: 1.55,
                  color: 'rgba(255,245,235,0.78)',
                  margin: '0 0 12px',
                }}
              >
                {reel.line}
              </p>
              <span
                style={{
                  fontFamily: "'Imprima', sans-serif",
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: reel.voyage.color,
                }}
              >
                Enter this voyage <span aria-hidden>→</span>
              </span>
            </div>
          </Link>
        )
      })}

      {/* 底部圆钮:左钮玻璃、右钮实白,沿用 gateway-portal 的一虚一实 */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? 24 : 8,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          type="button"
          aria-label="Previous reel"
          onClick={() => advance(-1)}
          className="imm-navbtn"
          style={{
            width: isMobile ? 42 : 46,
            height: isMobile ? 42 : 46,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }}>
            <path d="M8 1L2 7l6 6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span
          style={{
            fontFamily: "'Imprima', sans-serif",
            fontSize: 12,
            letterSpacing: '0.2em',
            color: 'rgba(255,245,235,0.65)',
            minWidth: 64,
            textAlign: 'center',
          }}
        >
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button
          type="button"
          aria-label="Next reel"
          onClick={() => advance(1)}
          className="imm-navbtn"
          style={{
            width: isMobile ? 42 : 46,
            height: isMobile ? 42 : 46,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="9" height="14" viewBox="0 0 9 14" fill="none">
            <path d="M1 1l6 6-6 6" stroke="#2c2420" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 当前 reel 对应航线的时刻信息,数据与详情页同源 */}
      <div
        style={{
          position: 'absolute',
          bottom: isMobile ? -8 : -26,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "'Imprima', sans-serif",
          fontSize: 12,
          letterSpacing: '0.06em',
          color: 'rgba(255,245,235,0.55)',
        }}
      >
        {current.voyage.duration} · {current.voyage.departure}
      </div>
    </div>
  )
}

export default function Immersions() {
  const isMobile = useIsMobile()

  const introRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [uiVisible, setUiVisible] = useState(false)

  const heading = useReveal()
  const carousel = useReveal(0.12)
  const cta = useReveal()

  useEffect(() => {
    const t = setTimeout(() => setUiVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  // 滚动进度:state 驱动透明度渲染,ref 喂 rAF 循环(与主页同一套引擎)
  useEffect(() => {
    const onScroll = () => {
      const intro = introRef.current
      if (!intro) return
      const denom = intro.offsetHeight - window.innerHeight
      const p = denom > 0 ? clamp(window.scrollY / denom, 0, 1) : 0
      progressRef.current = p
      setScrollProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  // 鼠标视差 + rAF 直写 transform:世界与传送门朝光标反方向漂移,幅度 6/7
  useEffect(() => {
    const raw = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      raw.x = (e.clientX / window.innerWidth - 0.5) * 2
      raw.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    let rafId = 0
    const frame = () => {
      smooth.x = lerp(smooth.x, raw.x, 0.07)
      smooth.y = lerp(smooth.y, raw.y, 0.07)
      const rx = -smooth.x
      const ry = -smooth.y
      const ep = easeInOut(progressRef.current)
      if (worldRef.current) {
        const s = lerp(1, 1.18, ep)
        worldRef.current.style.transform = `scale(${s}) translate(${rx * 6}px, ${ry * 6}px)`
      }
      if (portalRef.current) {
        const s = lerp(1, 7.5, ep)
        portalRef.current.style.transform = `scale(${s}) translate(${rx * 7}px, ${ry * 7}px)`
      }
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const p = scrollProgress
  const portalOpacity = p < 0.66 ? 1 : clamp(1 - (p - 0.66) / 0.22, 0, 1)
  const scene1Opacity = clamp(1 - p / 0.22, 0, 1)

  const footerCols: { title: string; links: [string, string][] }[] = [
    {
      title: 'Explore',
      links: [
        ['Voyages', '/voyages'],
        ['Atelier', '/atelier'],
      ],
    },
    {
      title: 'Chronicle',
      links: [
        ['Journal', '/journal'],
        ['Codex', '/codex'],
      ],
    },
    {
      title: 'Begin',
      links: [
        ['Reserve', '/reserve'],
        ['Return home', '/'],
      ],
    },
  ]

  return (
    <div style={{ background: '#0a0608', position: 'relative' }}>
      <style>{`
        @keyframes immBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .imm-navbtn { transition: background 0.25s ease, transform 0.25s ease; }
        .imm-navbtn:hover { transform: scale(1.06); }
        .imm-footlink { transition: opacity 0.25s ease; }
        .imm-footlink:hover { opacity: 0.6; }
        .imm-pill { transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .imm-pill:hover { transform: translateY(-2px); box-shadow: 0 10px 34px rgba(243,205,214,0.35); }
      `}</style>

      <SiteNav />

      {/* 固定世界底图:整页唯一背景,传送门散去后由它托住 reel 陈列区 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        <div ref={worldRef} style={{ width: '100%', height: '100%', transformOrigin: '50% 50%', willChange: 'transform' }}>
          <img src={WORLD_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,6,8,0.4) 0%, transparent 30%, transparent 60%, rgba(10,6,8,0.75) 100%)',
          }}
        />
      </div>

      {/* 钉住的传送门开场:160vh 滚动带里,门放大 7.5 倍后散开,露出身后的世界 */}
      <div ref={introRef} style={{ height: '160vh', position: 'relative', zIndex: 5 }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <div
            ref={portalRef}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: portalOpacity,
              transformOrigin: '52% 38%',
              willChange: 'transform',
            }}
          >
            <img src={PORTAL_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>

          {/* 底部压暗,保证门前白字可读 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '46%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
              pointerEvents: 'none',
              opacity: scene1Opacity,
            }}
          />

          {/* 场景一文案:滚动前 22% 内先行退场 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: scene1Opacity,
              pointerEvents: scene1Opacity < 0.05 ? 'none' : 'auto',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'flex-end',
                justifyContent: 'space-between',
                gap: isMobile ? 28 : 80,
                padding: isMobile ? '0 22px 96px' : '0 48px 64px',
              }}
            >
              <div
                style={{
                  maxWidth: 560,
                  opacity: uiVisible ? 1 : 0,
                  transform: uiVisible ? 'translateY(0)' : 'translateY(24px)',
                  transition: 'opacity 1s ease 0.3s, transform 1s ease 0.3s',
                }}
              >
                <div style={{ ...OVERLINE_STYLE, color: 'rgba(255,245,235,0.7)', marginBottom: 14 }}>
                  REVERIE · Immersions
                </div>
                <h1
                  style={{
                    fontFamily: "'Viaoda Libre', serif",
                    margin: 0,
                    color: '#fff',
                    textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 'clamp(24px, 7vw, 36px)' : 'clamp(30px, 3.4vw, 44px)',
                      letterSpacing: '0.08em',
                      lineHeight: 1.2,
                    }}
                  >
                    STEP <span style={{ color: 'rgba(255,220,180,0.7)', fontSize: '0.8em' }}>›</span> <em>THROUGH</em>
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: isMobile ? 'clamp(44px, 13vw, 68px)' : 'clamp(52px, 6.5vw, 84px)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    IMMERSIONS
                  </span>
                </h1>
                <p
                  style={{
                    fontFamily: "'Imprima', sans-serif",
                    fontSize: isMobile ? 14 : 16,
                    lineHeight: 1.7,
                    color: 'rgba(255,245,235,0.85)',
                    maxWidth: 360,
                    margin: '18px 0 0',
                    textShadow: '0 1px 12px rgba(0,0,0,0.8)',
                  }}
                >
                  Moving windows into dreams already underway. Lean close — the light on the other side is warm, and
                  the door does not mind being used.
                </p>
              </div>

              {!isMobile && (
                <div
                  style={{
                    display: 'flex',
                    gap: 14,
                    maxWidth: 230,
                    opacity: uiVisible ? 1 : 0,
                    transform: uiVisible ? 'translateY(0)' : 'translateY(32px)',
                    transition: 'opacity 1s ease 0.55s, transform 1s ease 0.55s',
                  }}
                >
                  <span style={{ fontFamily: "'Viaoda Libre', serif", fontSize: 64, lineHeight: 0.8, color: '#fff' }}>R.</span>
                  <p
                    style={{
                      fontFamily: "'Imprima', sans-serif",
                      fontSize: 11,
                      lineHeight: 1.6,
                      color: 'rgba(255,245,235,0.6)',
                      margin: 0,
                    }}
                  >
                    Every reel is cut from a living dream. Handle gently — some of them are still dreaming.
                  </p>
                </div>
              )}
            </div>

            {/* 滚动提示 */}
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                opacity: uiVisible ? 1 : 0,
                transition: 'opacity 0.9s ease 0.9s',
              }}
            >
              <span style={{ ...OVERLINE_STYLE, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Descend</span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'immBob 1.8s ease-in-out infinite',
                }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5l5 4.5 5-4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 门后世界:reel 陈列区,滚动逐块揭示 */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <section style={{ padding: isMobile ? '10vh 20px 40px' : '13vh 40px 60px', textAlign: 'center' }}>
          <div ref={heading.ref} style={revealStyle(heading.visible)}>
            <div style={{ ...OVERLINE_STYLE, color: '#f3cdd6', marginBottom: 16 }}>What travelers carried back</div>
            <h2
              style={{
                fontFamily: "'Viaoda Libre', serif",
                fontSize: isMobile ? 'clamp(30px, 9vw, 44px)' : 'clamp(38px, 4.5vw, 58px)',
                color: '#fff',
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}
            >
              REELS FROM
              <br />
              THE FAR SIDE
            </h2>
            <p
              style={{
                fontFamily: "'Imprima', sans-serif",
                fontSize: isMobile ? 14 : 17,
                lineHeight: 1.65,
                color: 'rgba(255,245,235,0.82)',
                maxWidth: 430,
                margin: '16px auto 0',
                textShadow: '0 2px 16px rgba(0,0,0,0.3)',
              }}
            >
              Fragments our travelers brought home — each one still humming with the dream it was cut from. Choose a
              reel and follow it back to its voyage.
            </p>
          </div>

          <div ref={carousel.ref} style={{ ...revealStyle(carousel.visible, 150), marginTop: isMobile ? 36 : 48 }}>
            {REELS.length > 0 ? (
              <ArcReelCarousel reels={REELS} isMobile={isMobile} />
            ) : (
              // 数据源异常导致无 reel 可陈列时,给出真实出口而非空白
              <p style={{ fontFamily: "'Imprima', sans-serif", fontSize: 15, color: 'rgba(255,245,235,0.7)' }}>
                The reels are being rewound.{' '}
                <Link to="/voyages" style={{ color: '#f3cdd6' }}>
                  Browse the voyages instead →
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* CTA:门就开在这一段的尽头 */}
        <section
          ref={cta.ref}
          style={{
            ...revealStyle(cta.visible),
            textAlign: 'center',
            padding: isMobile ? '72px 22px 60px' : '110px 40px 80px',
          }}
        >
          <h3
            style={{
              fontFamily: "'Viaoda Libre', serif",
              fontSize: isMobile ? 'clamp(26px, 8vw, 36px)' : 'clamp(32px, 3.6vw, 46px)',
              color: '#fff',
              margin: 0,
              letterSpacing: '0.02em',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            }}
          >
            The door is ajar.
          </h3>
          <p
            style={{
              fontFamily: "'Imprima', sans-serif",
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.65,
              color: 'rgba(255,245,235,0.8)',
              maxWidth: 400,
              margin: '14px auto 28px',
            }}
          >
            Every reel ends the same way — with you, standing at a threshold. Cross it properly this time.
          </p>
          <Link
            to="/reserve"
            className="imm-pill"
            style={{
              display: 'inline-block',
              fontFamily: "'Imprima', sans-serif",
              fontSize: 14,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#2c1820',
              background: 'linear-gradient(120deg, #f3cdd6 0%, #dcd2f2 100%)',
              borderRadius: 999,
              padding: '15px 34px',
              textDecoration: 'none',
              boxShadow: '0 6px 24px rgba(243,205,214,0.25)',
            }}
          >
            Reserve a Crossing
          </Link>
          <div style={{ marginTop: 18 }}>
            <Link
              to="/voyages"
              className="imm-footlink"
              style={{
                fontFamily: "'Imprima', sans-serif",
                fontSize: 13,
                color: 'rgba(255,245,235,0.65)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,245,235,0.3)',
                paddingBottom: 2,
              }}
            >
              or wander all nine voyages →
            </Link>
          </div>
        </section>

        {/* 页脚:全部指向站内真实路由 */}
        <footer
          style={{
            padding: isMobile ? '80px 22px 40px' : '140px 44px 52px',
            background: 'linear-gradient(to bottom, transparent, rgba(10,6,8,0.55))',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : '1.4fr 1fr 1fr 1fr',
              gap: isMobile ? '32px 20px' : 40,
            }}
          >
            <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
              <Link
                to="/"
                style={{
                  fontFamily: "'Viaoda Libre', serif",
                  fontSize: 30,
                  color: '#fff',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                }}
              >
                REVERIE
              </Link>
              <div
                style={{
                  fontFamily: "'Imprima', sans-serif",
                  fontSize: 12,
                  color: 'rgba(255,245,235,0.55)',
                  marginTop: 10,
                }}
              >
                © 2026 Reverie · a travel agency that sells dreams
              </div>
            </div>
            {footerCols.map((col) => (
              <div key={col.title}>
                <div style={{ ...OVERLINE_STYLE, fontSize: 12, color: 'rgba(255,245,235,0.55)', marginBottom: 18 }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(([label, to]) => (
                    <Link
                      key={to}
                      to={to}
                      className="imm-footlink"
                      style={{
                        fontFamily: "'Imprima', sans-serif",
                        fontSize: 14,
                        color: '#fff',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
