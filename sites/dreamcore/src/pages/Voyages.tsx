import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// 视觉基底:MotionSites「orbis-cards」——液态玻璃卡阵 + 超大标题行 + 卡下信息条与圆形箭头。
// 此处把它的太空蓝语言改造成 Reverie 的深梅黑 + 粉彩:视频位换成每条航线专属的呼吸光晕,
// 因为九条航线各有一个契约色,用色彩本身作画面比复用三段太空视频更贴「贩卖梦境」的题。

const WARM_WHITE = '#f6efe9'
const SERIF = "'Viaoda Libre', serif"
const SANS = "'Imprima', sans-serif"

// 入场 reveal:进视口才显形,SSR/老环境没有 IntersectionObserver 就直接显示,不让页面空白
function useReveal<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
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
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, visible]
}

// 卡片阵列的 grid 断点与 hover 规则没法全写内联,集中放在这一段页面级样式里
const PAGE_CSS = `
  .rv-liquid-glass {
    background: rgba(255, 255, 255, 0.015);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
    position: relative;
    overflow: hidden;
  }
  .rv-liquid-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.4px;
    background: linear-gradient(180deg,
      rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 20%,
      rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
      rgba(255,255,255,0.12) 80%, rgba(255,255,255,0.38) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .rv-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  @media (min-width: 720px) { .rv-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1120px) { .rv-grid { grid-template-columns: repeat(3, 1fr); } }

  @keyframes rv-aura-drift {
    0%   { transform: translate(-6%, -4%) scale(1); }
    50%  { transform: translate(5%, 6%) scale(1.12); }
    100% { transform: translate(-6%, -4%) scale(1); }
  }
  .rv-card { transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1); }
  .rv-card:hover { transform: translateY(-6px); }
  .rv-card:hover .rv-card-shell { background: rgba(255, 255, 255, 0.045); }
  .rv-card .rv-card-shell { transition: background 0.35s ease; }
  .rv-card .rv-aura { animation: rv-aura-drift 14s ease-in-out infinite; }
  .rv-card:hover .rv-aura { animation-duration: 7s; }
  .rv-card .rv-chevron { transition: transform 0.35s ease, background 0.35s ease; }
  .rv-card:hover .rv-chevron { transform: translateX(4px); background: rgba(255, 255, 255, 0.08); }
  .rv-card .rv-num { transition: opacity 0.45s ease, letter-spacing 0.45s ease; }
  .rv-card:hover .rv-num { opacity: 0.9; letter-spacing: 0.08em; }

  .rv-underline-link .rv-bar { transform: scaleX(1); transform-origin: left; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
  .rv-underline-link:hover .rv-bar { transform: scaleX(0.55); }

  @media (prefers-reduced-motion: reduce) {
    .rv-card .rv-aura { animation: none; }
    .rv-card, .rv-card .rv-chevron, .rv-underline-link .rv-bar { transition: none; }
  }
`

// 单卡:整卡即链接,玻璃壳里是航线色的呼吸光晕,下方信息条给 duration 与前进箭头
function VoyageCard({ voyage, index }: { voyage: Voyage; index: number }) {
  const [ref, visible] = useReveal<HTMLDivElement>()
  const num = String(index + 1).padStart(2, '0')
  return (
    <div
      ref={ref}
      className="rv-card"
      style={{
        opacity: visible ? 1 : 0,
        translate: visible ? '0 0' : '0 32px',
        // stagger 只按列内位次延迟,行与行之间靠各自进视口的时机拉开
        transition: `opacity 0.7s ease ${(index % 3) * 0.1}s, translate 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${(index % 3) * 0.1}s`,
      }}
    >
      <Link
        to={`/voyages/${voyage.slug}`}
        aria-label={`${voyage.title} — view route`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div className="rv-liquid-glass rv-card-shell" style={{ borderRadius: 32, padding: 16 }}>
          <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', paddingBottom: '72%', background: '#0d080b' }}>
            <div
              className="rv-aura"
              style={{
                position: 'absolute',
                inset: '-25%',
                background: `radial-gradient(circle at 32% 38%, ${voyage.color}52 0%, ${voyage.color}1f 34%, transparent 62%),
                             radial-gradient(circle at 72% 74%, ${voyage.color}30 0%, transparent 52%)`,
                filter: 'blur(2px)',
              }}
            />
            <span
              className="rv-num"
              style={{
                position: 'absolute',
                top: 18,
                left: 22,
                fontFamily: SERIF,
                fontSize: 15,
                letterSpacing: '0.04em',
                color: voyage.color,
                opacity: 0.75,
              }}
            >
              N° {num}
            </span>
            <div style={{ position: 'absolute', left: 22, right: 22, bottom: 18 }}>
              <h3 style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 400, lineHeight: 1.1, margin: 0, color: WARM_WHITE }}>
                {voyage.title}
              </h3>
              <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, margin: '8px 0 0', color: 'rgba(246,238,233,0.72)' }}>
                {voyage.desc}
              </p>
            </div>
          </div>
        </div>

        <div
          className="rv-liquid-glass"
          style={{ borderRadius: 20, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(246,238,233,0.55)',
                marginBottom: 3,
              }}
            >
              Duration
            </span>
            <span style={{ fontFamily: SERIF, fontSize: 17, color: WARM_WHITE }}>{voyage.duration}</span>
          </div>
          <span
            className="rv-liquid-glass rv-chevron"
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={voyage.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  )
}

export default function Voyages() {
  const [headerRef, headerVisible] = useReveal<HTMLDivElement>()
  const [ctaRef, ctaVisible] = useReveal<HTMLDivElement>()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: WARM_WHITE }}>
      <style>{PAGE_CSS}</style>
      <SiteNav />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '150px 24px 96px' }}>
        {/* 页头:orbis 的双栏头排——左侧超大标题(一个词破格换风格),右侧堆叠式大字链接 */}
        <div
          ref={headerRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 32,
            marginBottom: 64,
            opacity: headerVisible ? 1 : 0,
            translate: headerVisible ? '0 0' : '0 24px',
            transition: 'opacity 0.8s ease, translate 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 12,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(246,238,233,0.55)',
                margin: '0 0 18px',
              }}
            >
              Reverie · Route Catalogue
            </p>
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(38px, 6.2vw, 76px)',
                lineHeight: 1.02,
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Nine routes
              <br />
              <span style={{ marginLeft: 'clamp(36px, 8vw, 120px)', display: 'inline-block' }}>
                out of the{' '}
                <em style={{ fontStyle: 'italic', textTransform: 'none', color: '#f3cdd6' }}>Real</em>
              </span>
            </h1>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 16,
                lineHeight: 1.7,
                color: 'rgba(246,238,233,0.7)',
                maxWidth: 460,
                margin: '26px 0 0',
              }}
            >
              Every departure leaves from the same quiet harbour — the moment before sleep.
              Choose the current, and REVERIE will carry you the rest of the way.
            </p>
          </div>

          <Link
            to="/atelier"
            className="rv-underline-link"
            style={{ textDecoration: 'none', color: WARM_WHITE, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <span style={{ fontFamily: SERIF, textTransform: 'uppercase', lineHeight: 1.05, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 'clamp(30px, 4vw, 52px)' }}>Visit</span>
              <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.95 }}>
                <span style={{ fontSize: 'clamp(19px, 2.4vw, 30px)' }}>the</span>
                <span style={{ fontSize: 'clamp(19px, 2.4vw, 30px)' }}>Atelier</span>
              </span>
            </span>
            <span className="rv-bar" style={{ width: '100%', height: 7, background: '#dcd2f2', marginTop: 12, display: 'block' }} />
          </Link>
        </div>

        {/* 九卡阵列 */}
        <div className="rv-grid">
          {VOYAGES.map((v, i) => (
            <VoyageCard key={v.slug} voyage={v} index={i} />
          ))}
        </div>

        {/* 底部 CTA:引去预订 */}
        <div
          ref={ctaRef}
          style={{
            marginTop: 110,
            textAlign: 'center',
            opacity: ctaVisible ? 1 : 0,
            translate: ctaVisible ? '0 0' : '0 28px',
            transition: 'opacity 0.8s ease, translate 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 3.6vw, 44px)', lineHeight: 1.25, margin: '0 auto', maxWidth: 720 }}>
            Every itinerary ends where you wake.
          </p>
          <p style={{ fontFamily: SANS, fontSize: 15, color: 'rgba(246,238,233,0.65)', margin: '16px auto 36px', maxWidth: 480, lineHeight: 1.7 }}>
            Departures are held nightly. A navigator will meet you at the edge of sleep.
          </p>
          <Link
            to="/reserve"
            className="rv-underline-link"
            style={{ textDecoration: 'none', color: WARM_WHITE, display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <span style={{ fontFamily: SERIF, fontSize: 'clamp(24px, 3vw, 38px)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reserve a departure
            </span>
            <span className="rv-bar" style={{ width: '100%', height: 8, background: '#f3cdd6', marginTop: 12, display: 'block' }} />
          </Link>
        </div>
      </main>
    </div>
  )
}
