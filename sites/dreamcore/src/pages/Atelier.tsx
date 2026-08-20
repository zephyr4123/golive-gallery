import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// 统一缓动:视觉基底 prompt 全站用同一条曲线,保持动效语言一致
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

const INK = '#0a0608'
const WARM_WHITE = '#f6efe8'
const WARM_DIM = 'rgba(246, 239, 232, 0.72)'
const WARM_FAINT = 'rgba(246, 239, 232, 0.45)'
const HAIRLINE = 'rgba(246, 239, 232, 0.14)'

const SERIF: React.CSSProperties = { fontFamily: "'Viaoda Libre', serif", fontWeight: 400 }
const SANS: React.CSSProperties = { fontFamily: "'Imprima', sans-serif" }

const LABEL: React.CSSProperties = {
  ...SANS,
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}

// 三道工序:造梦所的流水线叙事
const CRAFT_STEPS = [
  {
    numeral: 'I',
    name: 'Charting',
    color: '#c3e3f4',
    body: 'Before a dream can be worn, it must be found. We sit with the sleeper and survey the longing itself — sounding its depths, noting its weather — until we can draw the coastline of a country that does not exist yet.',
    instruments: 'Longing interviews · Depth soundings · Coastlines in pencil',
  },
  {
    numeral: 'II',
    name: 'Tailoring',
    color: '#f3cdd6',
    body: 'The chart becomes cloth. Bolts of raw night are cut on the bias of memory; horizons are hemmed, silences are lined, and every seam is pressed flat so the dreamer never feels the join.',
    instruments: 'Bias of memory · Hemmed horizons · Seams pressed flat',
  },
  {
    numeral: 'III',
    name: 'Waking',
    color: '#dcd2f2',
    body: 'The gentlest room in the house. A finished dream must end without tearing, so we ease the sleeper back across the waterline and press the final hour carefully, that it may keep its crease well into morning.',
    instruments: 'Waterline crossings · The pressed last hour · Morning fittings',
  },
]

// 三个「职位」:团队以角色示人,不以真人示人;各挂一条它经手的航线
const ROLES = [
  {
    title: 'The Cartographer',
    color: '#c3e3f4',
    body: 'Draws coastlines for countries that appear only after you close your eyes. Keeps every chart in pencil — dreams have always objected to ink.',
    voyageSlug: 'hidden-realms',
    glyph: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        <path d="M20 8v24M8 20h24M12 12l16 16M28 12L12 28" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
        <circle cx="20" cy="20" r="2.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: 'The Tailor',
    color: '#f3cdd6',
    body: 'Cuts night to the measure of a single sleeper. Refuses all patterns on principle — every longing arrives in a different size.',
    voyageSlug: 'bespoke-quests',
    glyph: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M10 30L30 10" stroke="currentColor" strokeWidth="1.2" />
        <ellipse cx="29" cy="11" rx="3" ry="4.5" transform="rotate(45 29 11)" stroke="currentColor" strokeWidth="1" />
        <path d="M10 30c4-1 8 1 6 4" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: 'The Ferryman',
    color: '#dcedc2',
    body: 'Carries the finished dream across the waterline, then waits at the far bank — oar raised — to bring the dreamer home before morning.',
    voyageSlug: 'deep-currents',
    glyph: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 26c4 3 8 3 12 0s8-3 12 0" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        <path d="M14 26l4-16 8 4" stroke="currentColor" strokeWidth="1" />
        <circle cx="18" cy="8" r="1.6" stroke="currentColor" strokeWidth="0.9" />
      </svg>
    ),
  },
]

function findVoyage(slug: string): Voyage | undefined {
  return VOYAGES.find((v) => v.slug === slug)
}

// 逐字母入场:基底 prompt 的 StaggeredFade,用纯 CSS animation-delay 复刻,免依赖 framer-motion
function StaggeredLetters({
  text,
  baseDelay = 0,
  step = 0.045,
  style,
}: {
  text: string
  baseDelay?: number
  step?: number
  style?: React.CSSProperties
}) {
  return (
    <span aria-label={text} style={{ display: 'inline-block', whiteSpace: 'pre', ...style }}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: 'inline-block',
            animation: `atelier-rise 0.55s ${EASE} both`,
            animationDelay: `${baseDelay + i * step}s`,
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

// 滚动显现:进入视口一次性上浮;无 IntersectionObserver 的环境直接显示,绝不让内容永远隐身
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
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
        transform: shown ? 'none' : 'translateY(28px)',
        transition: `opacity 0.9s ${EASE} ${delay}s, transform 0.9s ${EASE} ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function ArrowUpRight({ size = 13 }: { size?: number }) {
  return (
    <svg
      className="glass-arrow"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transition: `transform 0.3s ${EASE}` }}
    >
      <path d="M7 17L17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Atelier() {
  // 视频是外部 CDN,加载失败时退到静态夜色渐变,页面不能因此开天窗
  const [videoOk, setVideoOk] = useState(true)

  return (
    <div className="atelier-page" style={{ minHeight: '100vh', background: INK, color: WARM_WHITE, ...SANS }}>
      <style>{`
        @keyframes atelier-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes atelier-drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .atelier-glass {
          background: rgba(255, 255, 255, 0.01);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
          transition: background 0.3s ${EASE};
        }
        .atelier-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .atelier-glass:hover { background: rgba(255, 255, 255, 0.06); }
        .atelier-glass:hover .glass-arrow { transform: translate(2px, -2px); }
        .atelier-ghost {
          transition: border-color 0.3s ${EASE}, color 0.3s ${EASE};
        }
        .atelier-ghost:hover { border-color: ${WARM_WHITE} !important; color: ${WARM_WHITE} !important; }
        .atelier-craft .craft-rule {
          display: block;
          height: 1px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.7s ${EASE};
        }
        .atelier-craft:hover .craft-rule { transform: scaleX(1); }
        .atelier-role {
          transition: transform 0.45s ${EASE}, border-color 0.45s ${EASE}, background 0.45s ${EASE};
        }
        .atelier-role:hover {
          transform: translateY(-6px);
          border-color: var(--accent) !important;
          background: rgba(255, 255, 255, 0.02);
        }
        .atelier-role .role-link { transition: opacity 0.3s ${EASE}; opacity: 0.65; }
        .atelier-role:hover .role-link { opacity: 1; }
        .atelier-footlink { transition: opacity 0.3s ${EASE}; opacity: 0.6; }
        .atelier-footlink:hover { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .atelier-page *, .atelier-page *::before {
            animation-duration: 0.01ms !important;
            animation-delay: 0s !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0s !important;
          }
        }
      `}</style>

      <SiteNav />

      {/* ————— Hero:满屏夜航视频 + 底部超大双栏标题(基底 prompt 的布局骨架) ————— */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 620, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {videoOk ? (
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260717_084049_407d831b-67ef-4e76-9330-45386e0a9915.mp4"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoOk(false)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(120% 90% at 50% 0%, #241320 0%, ${INK} 70%), radial-gradient(60% 40% at 80% 90%, rgba(220,210,242,0.12) 0%, transparent 100%)`,
            }}
          />
        )}
        {/* 底部压暗,保证大字对比度 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, ${INK} 0%, rgba(10,6,8,0.55) 28%, rgba(10,6,8,0.15) 55%, rgba(10,6,8,0.35) 100%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          className="px-6 md:px-12"
          style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 36 }}
        >
          <p style={{ ...LABEL, color: WARM_DIM, marginBottom: 18 }}>
            <StaggeredLetters text="THE ATELIER OF REVERIE" baseDelay={0.2} step={0.03} />
          </p>

          {/* 大标题双栏:左「Where Night Is / MEASURED」右「& SEWN」,合读成一句 */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between" style={{ marginBottom: 40 }}>
            <div>
              <p style={{ ...SERIF, fontSize: 'clamp(20px, 3vw, 42px)', lineHeight: 0.95, color: WARM_DIM, marginBottom: 14 }}>
                <StaggeredLetters text="Where Night Is" baseDelay={0.45} step={0.05} />
              </p>
              <h1 style={{ ...SERIF, fontSize: 'clamp(58px, 10.5vw, 168px)', lineHeight: 0.85, letterSpacing: '-0.01em' }}>
                <StaggeredLetters text="MEASURED" baseDelay={0.7} step={0.05} />
              </h1>
            </div>
            <div className="md:text-right" style={{ marginTop: 12 }}>
              <h1 style={{ ...SERIF, fontSize: 'clamp(58px, 10.5vw, 168px)', lineHeight: 0.85, letterSpacing: '-0.01em' }}>
                <StaggeredLetters text="& SEWN" baseDelay={1.15} step={0.06} />
              </h1>
            </div>
          </div>

          {/* 底栏:徽记 + 两列信息 + 玻璃 CTA(基底 prompt 的 bottom bar) */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 22 }}
          >
            <div className="flex items-start gap-6 md:gap-12">
              <Reveal delay={1.5}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    border: '1px solid rgba(246,239,232,0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f0e4c0',
                    animation: 'atelier-drift 6s ease-in-out infinite',
                    flexShrink: 0,
                  }}
                >
                  {/* 针与星:造梦所的徽记 */}
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <path d="M7 27L25 9" stroke="currentColor" strokeWidth="1.1" />
                    <ellipse cx="24.5" cy="9.5" rx="2.4" ry="3.6" transform="rotate(45 24.5 9.5)" stroke="currentColor" strokeWidth="0.9" />
                    <path d="M27 22l0.9 2.6L30.5 25l-2.6 0.9L27 28.5l-0.9-2.6L23.5 25l2.6-0.4L27 22z" fill="currentColor" opacity="0.85" />
                  </svg>
                </div>
              </Reveal>

              <div className="hidden sm:flex items-start gap-8 md:gap-14">
                <Reveal delay={1.65} style={{ maxWidth: 250 }}>
                  <p style={{ ...LABEL, marginBottom: 7 }}>01 — The House</p>
                  <p style={{ ...SANS, fontSize: 11, lineHeight: 1.7, color: WARM_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    A workshop moored between midnight and memory, where raw night is bolted, pinned and pressed into voyages.
                  </p>
                </Reveal>
                <Reveal delay={1.8} style={{ maxWidth: 250 }}>
                  <p style={{ ...LABEL, marginBottom: 7 }}>02 — The Method</p>
                  <p style={{ ...SANS, fontSize: 11, lineHeight: 1.7, color: WARM_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Charted by the Cartographer. Cut by the Tailor. Carried home by the Ferryman.
                  </p>
                </Reveal>
              </div>
            </div>

            <Reveal delay={1.95}>
              <Link
                to="/reserve"
                className="atelier-glass"
                style={{
                  ...LABEL,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: WARM_WHITE,
                  textDecoration: 'none',
                  borderRadius: 999,
                  padding: '15px 30px',
                  letterSpacing: '0.2em',
                }}
              >
                Commission a Dream
                <ArrowUpRight />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ————— The Craft:三道工序 ————— */}
      <section className="px-6 md:px-12" style={{ paddingTop: 130, paddingBottom: 110, maxWidth: 1160, margin: '0 auto' }}>
        <Reveal>
          <p style={{ ...LABEL, color: WARM_FAINT, marginBottom: 16 }}>The Craft</p>
          <h2 style={{ ...SERIF, fontSize: 'clamp(32px, 4.5vw, 60px)', lineHeight: 1.05, maxWidth: 640, marginBottom: 26 }}>
            Three rooms, one seam.
          </h2>
          <p style={{ ...SANS, fontSize: 16, lineHeight: 1.75, color: WARM_DIM, maxWidth: 520 }}>
            Every voyage that leaves this house passes through the same three pairs of hands. Nothing is rushed; a dream
            hurried at any bench will fray at all of them.
          </p>
        </Reveal>

        <div style={{ marginTop: 80 }}>
          {CRAFT_STEPS.map((step, i) => (
            <Reveal key={step.name} delay={0.08 * i}>
              <article
                className="atelier-craft grid md:grid-cols-[140px_1fr] gap-x-10 gap-y-4"
                style={{ borderTop: `1px solid ${HAIRLINE}`, padding: '44px 0 52px' }}
              >
                <div>
                  <span style={{ ...SERIF, fontSize: 44, color: step.color, opacity: 0.9 }}>{step.numeral}</span>
                </div>
                <div>
                  <h3 style={{ ...SERIF, fontSize: 'clamp(26px, 3vw, 38px)', marginBottom: 16 }}>{step.name}</h3>
                  <p style={{ ...SANS, fontSize: 15.5, lineHeight: 1.8, color: WARM_DIM, maxWidth: 560, marginBottom: 20 }}>
                    {step.body}
                  </p>
                  <p style={{ ...LABEL, fontSize: 10, color: WARM_FAINT }}>{step.instruments}</p>
                  <span className="craft-rule" style={{ background: step.color, maxWidth: 560, marginTop: 26, opacity: 0.75 }} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ————— The Hands of the House:角色而非真人 ————— */}
      <section className="px-6 md:px-12" style={{ paddingBottom: 130, maxWidth: 1160, margin: '0 auto' }}>
        <Reveal>
          <p style={{ ...LABEL, color: WARM_FAINT, marginBottom: 16 }}>The Hands of the House</p>
          <h2 style={{ ...SERIF, fontSize: 'clamp(32px, 4.5vw, 60px)', lineHeight: 1.05, maxWidth: 700, marginBottom: 26 }}>
            No names. No faces. Only offices.
          </h2>
          <p style={{ ...SANS, fontSize: 16, lineHeight: 1.75, color: WARM_DIM, maxWidth: 520 }}>
            The offices are older than anyone who has ever held them. You will not be introduced to a person here — only
            to a pair of hands, and to what those hands have made.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6" style={{ marginTop: 64 }}>
          {ROLES.map((role, i) => {
            const voyage = findVoyage(role.voyageSlug)
            return (
              <Reveal key={role.title} delay={0.1 * i}>
                <div
                  className="atelier-role"
                  style={
                    {
                      '--accent': role.color,
                      border: `1px solid ${HAIRLINE}`,
                      borderRadius: 20,
                      padding: '38px 30px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    } as React.CSSProperties
                  }
                >
                  <div style={{ color: role.color, marginBottom: 26 }}>{role.glyph}</div>
                  <h3 style={{ ...SERIF, fontSize: 27, marginBottom: 14 }}>{role.title}</h3>
                  <p style={{ ...SANS, fontSize: 14.5, lineHeight: 1.8, color: WARM_DIM, marginBottom: 28, flex: 1 }}>
                    {role.body}
                  </p>
                  {/* 数据里查不到对应航线时退回目录页,不放死链 */}
                  <Link
                    to={voyage ? `/voyages/${voyage.slug}` : '/voyages'}
                    className="role-link"
                    style={{ ...LABEL, fontSize: 10, color: role.color, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    {voyage ? `Latest commission — ${voyage.title}` : 'Browse the voyages'}
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ————— 尾部 CTA ————— */}
      <section className="px-6 md:px-12" style={{ paddingBottom: 140, textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ ...SERIF, fontSize: 'clamp(34px, 5.5vw, 76px)', lineHeight: 1.1, maxWidth: 820, margin: '0 auto 22px' }}>
            Bring us a longing you cannot explain.
          </h2>
          <p style={{ ...SANS, fontSize: 16, lineHeight: 1.7, color: WARM_DIM, marginBottom: 46 }}>
            The atelier will build the country it belongs to.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reserve"
              className="atelier-glass"
              style={{
                ...LABEL,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: WARM_WHITE,
                textDecoration: 'none',
                borderRadius: 999,
                padding: '16px 34px',
                letterSpacing: '0.2em',
              }}
            >
              Commission a Dream
              <ArrowUpRight />
            </Link>
            <Link
              to="/voyages"
              className="atelier-ghost"
              style={{
                ...LABEL,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: WARM_DIM,
                textDecoration: 'none',
                borderRadius: 999,
                padding: '16px 34px',
                letterSpacing: '0.2em',
                border: `1px solid ${HAIRLINE}`,
              }}
            >
              Browse the Nine Voyages
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ————— 页脚:全部指向站内真实路由 ————— */}
      <footer
        className="px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: 34, paddingBottom: 34 }}
      >
        <Link to="/" style={{ ...SERIF, fontSize: 20, color: WARM_WHITE, textDecoration: 'none', letterSpacing: '0.08em' }}>
          REVERIE
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {(
            [
              ['Voyages', '/voyages'],
              ['Immersions', '/immersions'],
              ['Journal', '/journal'],
              ['Codex', '/codex'],
              ['Reserve', '/reserve'],
            ] as const
          ).map(([label, path]) => (
            <Link key={path} to={path} className="atelier-footlink" style={{ ...LABEL, fontSize: 10, color: WARM_WHITE, textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
        <p style={{ ...SANS, fontSize: 11, color: WARM_FAINT, letterSpacing: '0.06em' }}>
          The Atelier · open between midnight and memory
        </p>
      </footer>
    </div>
  )
}
