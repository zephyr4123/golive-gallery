import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// ————— 品牌常量:与全站视觉契约一致 —————
const INK = '#241019' // 粉彩卡片上的深梅色文字
const INK_SOFT = 'rgba(36,16,25,0.55)'
const SERIF = "'Viaoda Libre', serif"
const SANS = "'Imprima', sans-serif"
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// 台阶点阵图:算法沿用视觉基底的规则(base = floor(c*0.55),奇数列加一格,c>4 补低一格),
// 模块级算一次即可,不必每次渲染重算
const DOT_COLS = 26
const DOT_ROWS = 15
const dotColumns: boolean[][] = Array.from({ length: DOT_COLS }, (_, c) => {
  const base = Math.floor(c * 0.55)
  const active = new Set<number>([base])
  if (c % 2 === 1) active.add(base + 1)
  if (c > 4 && base - 1 >= 0) active.add(base - 1)
  return Array.from({ length: DOT_ROWS }, (_, r) => active.has(r))
})

// 航线卡上的散落方块:沿用基底给定的百分比坐标
const SCATTER_SQUARES: Array<{ left: string; top: string; size: number }> = [
  { left: '55%', top: '2%', size: 30 },
  { left: '80%', top: '0%', size: 24 },
  { left: '70%', top: '28%', size: 16 },
  { left: '92%', top: '18%', size: 14 },
  { left: '58%', top: '22%', size: 10 },
  { left: '88%', top: '36%', size: 10 },
  { left: '46%', top: '14%', size: 8 },
]

// 词典卡:词条挂在真实航线上,slug 必须能在 VOYAGES 里找到,否则整卡不渲染(宁缺勿死链)
const GLOSSARY_ENTRIES: Array<{ slug: string; term: string; numeral: string }> = [
  { slug: 'vivid-drifts', term: 'drift, n.', numeral: 'Entry V' },
  { slug: 'deep-currents', term: 'current, n.', numeral: 'Entry VII' },
  { slug: 'glassy-tides', term: 'stillness, n.', numeral: 'Entry IX' },
]

const findVoyage = (slug: string): Voyage | undefined => VOYAGES.find((v) => v.slug === slug)

// 星野卡的微光点:手摆位置比随机数稳定,SSR/复跑不闪
const STARFIELD: Array<{ left: string; top: string; size: number; delay: string }> = [
  { left: '12%', top: '18%', size: 2, delay: '0s' },
  { left: '28%', top: '9%', size: 1.5, delay: '0.8s' },
  { left: '44%', top: '22%', size: 2.5, delay: '1.6s' },
  { left: '63%', top: '12%', size: 1.5, delay: '0.4s' },
  { left: '81%', top: '26%', size: 2, delay: '2.1s' },
  { left: '17%', top: '41%', size: 1.5, delay: '1.2s' },
  { left: '52%', top: '38%', size: 2, delay: '2.6s' },
  { left: '74%', top: '46%', size: 1.5, delay: '0.2s' },
  { left: '35%', top: '55%', size: 2, delay: '1.9s' },
  { left: '88%', top: '58%', size: 1.5, delay: '3s' },
  { left: '22%', top: '68%', size: 2, delay: '0.6s' },
  { left: '60%', top: '64%', size: 1.5, delay: '2.4s' },
]

// 布局与动效走 <style>:内联 style 写不了媒体查询 / hover / keyframes
const PAGE_CSS = `
  .cx-grid { display: flex; flex-direction: column; gap: 16px; }
  @media (min-width: 900px) {
    .cx-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: repeat(14, minmax(46px, auto));
      gap: 16px;
    }
    .cx-a  { grid-column: 1 / 3; grid-row: 1 / 5; }
    .cx-b  { grid-column: 3 / 5; grid-row: 1 / 6; }
    .cx-c  { grid-column: 5 / 7; grid-row: 1 / 5; }
    .cx-d  { grid-column: 1 / 3; grid-row: 5 / 11; }
    .cx-e  { grid-column: 3 / 5; grid-row: 6 / 11; }
    .cx-f  { grid-column: 5 / 7; grid-row: 5 / 11; }
    .cx-g1 { grid-column: 1 / 3; grid-row: 11 / 14; }
    .cx-g2 { grid-column: 3 / 5; grid-row: 11 / 14; }
    .cx-g3 { grid-column: 5 / 7; grid-row: 11 / 14; }
  }
  .cx-reveal {
    opacity: 0;
    transform: translateY(18px) scale(0.96);
    transition: opacity 0.65s ${EASE}, transform 0.65s ${EASE};
  }
  .cx-reveal.is-in { opacity: 1; transform: none; }
  .cx-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-radius: 6px;
    color: inherit;
    text-decoration: none;
    transition: transform 0.35s ${EASE}, box-shadow 0.35s ease, border-color 0.35s ease;
  }
  a.cx-card:hover { transform: translateY(-4px); box-shadow: 0 16px 44px rgba(0, 0, 0, 0.38); }
  a.cx-card:focus-visible { outline: 2px solid rgba(243, 205, 214, 0.85); outline-offset: 3px; }
  .cx-hint { display: inline-flex; align-items: center; gap: 6px; opacity: 0.7; transition: opacity 0.3s ease, transform 0.3s ${EASE}; }
  a.cx-card:hover .cx-hint { opacity: 1; transform: translateX(4px); }
  .cx-glossary { border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03); }
  a.cx-glossary:hover { border-color: rgba(255, 255, 255, 0.28); box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3); }
  .cx-cta { color: #fff; text-decoration: none; border-bottom: 1px solid rgba(255, 255, 255, 0.3); padding-bottom: 3px; transition: border-color 0.3s ease, opacity 0.3s ease; opacity: 0.85; }
  .cx-cta:hover { border-color: #f3cdd6; opacity: 1; }
  @keyframes cx-twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
  .cx-star { animation: cx-twinkle 3.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .cx-reveal { transition: none; opacity: 1; transform: none; }
    .cx-card, .cx-hint, .cx-cta { transition: none; }
    a.cx-card:hover { transform: none; }
    .cx-star { animation: none; }
  }
`

// 视觉基底的 Plus 角标,dark 变体用于粉彩底
function PlusMark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${dark ? 'rgba(36,16,25,0.25)' : 'rgba(255,255,255,0.3)'}`,
        color: dark ? INK : '#fff',
        fontSize: 12,
        fontWeight: 300,
        fontFamily: SANS,
      }}
    >
      +
    </span>
  )
}

const STAR_PATH = 'M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.2L6 9.3 2.4 11.3l.7-4.2L0 4.2l4.2-.6z'

const statStyle: CSSProperties = {
  fontFamily: SERIF,
  fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
  fontWeight: 400,
  lineHeight: 1,
  letterSpacing: '-0.01em',
}

const bodyStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 13,
  lineHeight: 1.7,
}

export default function Codex() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    // 旧环境没有 IntersectionObserver 时直接显示,内容不能被动效挡住
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((t) => t.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '-60px 0px' },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={rootRef} style={{ minHeight: '100vh', background: '#0a0608', color: '#fdf8f4' }}>
      <style>{PAGE_CSS}</style>
      <SiteNav />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(120px, 16vh, 160px) clamp(20px, 4vw, 48px) 96px' }}>
        <div className="cx-grid">
          {/* 卡 1 · 页头卡(无底色) */}
          <div className="cx-a cx-reveal" data-reveal>
            <div className="cx-card" style={{ justifyContent: 'flex-end', paddingBottom: 16, paddingRight: 16 }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontSize: 13,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(253,248,244,0.65)',
                  marginBottom: 18,
                }}
              >
                The Dream Codex
              </span>
              <h1
                style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}
              >
                <span style={{ color: '#fdf8f4' }}>An Index of</span>
                <br />
                <span style={{ color: 'rgba(253,248,244,0.4)' }}>the Sleeping</span>
                <br />
                <span style={{ color: 'rgba(253,248,244,0.4)' }}>World</span>
              </h1>
              <p style={{ ...bodyStyle, color: 'rgba(253,248,244,0.5)', marginTop: 18, maxWidth: 300 }}>
                Every figure below is entered by our keepers of record and reconciled against the morning.
              </p>
            </div>
          </div>

          {/* 卡 2 · 黄昏卡(琥珀粉彩,同心圆图示)→ Gilded Dusk 航线详情 */}
          <div className="cx-b cx-reveal" data-reveal style={{ transitionDelay: '0.12s' }}>
            <Link to="/voyages/gilded-dusk" className="cx-card" style={{ background: '#f0e4c0', padding: 28 }}>
              <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                <svg viewBox="0 0 200 180" style={{ width: '100%', maxWidth: 240, height: 'auto' }} aria-hidden="true">
                  <circle cx="110" cy="80" r="75" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.2" />
                  <circle cx="110" cy="80" r="50" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.3" />
                  <circle cx="110" cy="80" r="25" stroke={INK} strokeWidth="0.8" fill="none" opacity="0.4" />
                  <rect x="68" y="42" width="16" height="16" fill={INK} />
                  <text x="76" y="53.5" textAnchor="middle" fill="#f0e4c0" fontSize="11" fontWeight="300">+</text>
                  <rect x="102" y="36" width="20" height="20" fill={INK} />
                  <circle cx="112" cy="46" r="5.5" fill="none" stroke="#f0e4c0" strokeWidth="1.2" />
                  <rect x="82" y="128" width="14" height="14" fill={INK} />
                  <text x="89" y="138.5" textAnchor="middle" fill="#f0e4c0" fontSize="11" fontWeight="300">&minus;</text>
                  <rect x="138" y="128" width="14" height="14" fill={INK} />
                  <rect x="142" y="132" width="6" height="6" fill="#f0e4c0" />
                </svg>
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <div style={{ ...statStyle, fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: INK }}>217</div>
                <p style={{ ...bodyStyle, color: INK_SOFT, marginTop: 4, marginBottom: 0 }}>
                  hours of dusk held open past their hour.
                </p>
                <span className="cx-hint" style={{ ...bodyStyle, color: INK, marginTop: 10 }}>
                  From the Gilded Dusk route <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 卡 3 · 文字卡(深底)→ Atelier */}
          <div className="cx-c cx-reveal" data-reveal style={{ transitionDelay: '0.18s' }}>
            <Link to="/atelier" className="cx-card" style={{ background: '#140b10', padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PlusMark />
              </div>
              <div style={{ marginTop: 'auto', paddingBottom: 4 }}>
                <p style={{ ...bodyStyle, color: 'rgba(253,248,244,0.6)', margin: 0 }}>
                  The Codex is our ledger of the intangible &mdash; every route, patron, and held-open hour entered in ink
                  that dries only at dawn.
                </p>
                <p style={{ ...bodyStyle, color: 'rgba(253,248,244,0.6)', margin: '20px 0 0' }}>
                  Entries are counted while you sleep. Discrepancies are always resolved in the dreamer&rsquo;s favour.
                </p>
                <span className="cx-hint" style={{ ...bodyStyle, color: '#f3cdd6', marginTop: 20 }}>
                  Commissions are entered at the Atelier <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 卡 4 · 常客卡(粉,台阶点阵)→ Reserve */}
          <div className="cx-d cx-reveal" data-reveal style={{ transitionDelay: '0.08s' }}>
            <Link to="/reserve" className="cx-card" style={{ background: '#f3cdd6', padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ ...statStyle, color: INK }}>32</div>
                  <p style={{ ...bodyStyle, lineHeight: 1.4, color: INK_SOFT, marginTop: 8, marginBottom: 0 }}>
                    patrons currently asleep in our care.
                  </p>
                </div>
                <PlusMark dark />
              </div>
              <div style={{ marginTop: 'auto', paddingTop: 32 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {dotColumns.map((col, c) => (
                    <div key={c} style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2, flex: 1 }}>
                      {col.map((filled, r) => (
                        <span
                          key={r}
                          style={{
                            display: 'block',
                            width: '100%',
                            maxWidth: 7,
                            aspectRatio: '1',
                            background: filled ? INK : 'rgba(36,16,25,0.08)',
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingRight: 8,
                    fontFamily: SANS,
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    color: 'rgba(36,16,25,0.45)',
                  }}
                >
                  {['2021', '2022', '2023', '2024', '2025'].map((year) => (
                    <span key={year}>{year}</span>
                  ))}
                </div>
                <span className="cx-hint" style={{ ...bodyStyle, color: INK, marginTop: 16 }}>
                  Become the thirty-third <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          </div>

          {/* 卡 5 · 星野卡(深底微光)→ Journal */}
          <div className="cx-e cx-reveal" data-reveal style={{ transitionDelay: '0.28s' }}>
            <Link
              to="/journal"
              className="cx-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 380,
                background:
                  'radial-gradient(120% 90% at 50% 105%, rgba(195,227,244,0.16), transparent 62%), linear-gradient(to top, #100a16, #0a0608)',
                padding: 24,
              }}
            >
              {STARFIELD.map((star, i) => (
                <span
                  key={i}
                  className="cx-star"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: star.left,
                    top: star.top,
                    width: star.size,
                    height: star.size,
                    borderRadius: '50%',
                    background: '#fdf8f4',
                    animationDelay: star.delay,
                  }}
                />
              ))}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontFamily: SERIF, fontSize: '1.6rem', lineHeight: 1, color: '#fdf8f4', fontWeight: 700 }}>R</span>
                    <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                      <span style={{ width: 10, height: 10, background: '#fdf8f4', display: 'block' }} />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ width: 7, height: 7, background: '#fdf8f4', display: 'block' }} />
                        <span style={{ width: 7, height: 7, background: '#fdf8f4', opacity: 0.5, display: 'block' }} />
                      </span>
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 300, lineHeight: 1, color: '#fdf8f4' }}>kept nightly</span>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 6 }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <svg key={i} width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                          <path d={STAR_PATH} fill="#fdf8f4" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 18, height: 18, background: 'rgba(253,248,244,0.7)', display: 'block' }} />
                  <span style={{ width: 18, height: 26, background: 'rgba(253,248,244,0.4)', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ ...statStyle, color: '#fdf8f4' }}>48 +</div>
                    <p style={{ ...bodyStyle, lineHeight: 1.5, color: 'rgba(253,248,244,0.6)', marginTop: 8, marginBottom: 0, maxWidth: 210 }}>
                      field notes recovered from the far side of sleep.
                    </p>
                    <span className="cx-hint" style={{ ...bodyStyle, color: '#c3e3f4', marginTop: 12 }}>
                      Open the Journal <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 48,
                      height: 48,
                      background: '#fdf8f4',
                      color: INK,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: SANS,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* 卡 6 · 航线卡(薰衣草,散点方块)→ Voyages */}
          <div className="cx-f cx-reveal" data-reveal style={{ transitionDelay: '0.22s' }}>
            <Link to="/voyages" className="cx-card" style={{ position: 'relative', background: '#dcd2f2', padding: 28 }}>
              <div style={{ position: 'relative', height: 96, width: '100%' }} aria-hidden="true">
                {SCATTER_SQUARES.map((sq, i) => (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: sq.left,
                      top: sq.top,
                      width: sq.size,
                      height: sq.size,
                      background: INK,
                      display: 'block',
                    }}
                  />
                ))}
              </div>
              <div style={{ ...statStyle, color: INK, marginTop: 16 }}>IX</div>
              <p style={{ ...bodyStyle, color: INK_SOFT, marginTop: 12, marginBottom: 0, maxWidth: 220 }}>
                Nine charted routes through the sleeping world, each with its own weather and hour of departure.
              </p>
              <span className="cx-hint" style={{ ...bodyStyle, color: INK, marginTop: 'auto', paddingTop: 16 }}>
                Browse the voyages <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          </div>

          {/* 词典行 · 三个词条卡,各自挂到真实航线详情 */}
          {GLOSSARY_ENTRIES.map((entry, i) => {
            const voyage = findVoyage(entry.slug)
            // 航线数据缺失时整卡不渲染:宁可少一格,不给死链
            if (!voyage) return null
            return (
              <div
                key={entry.slug}
                className={`cx-g${i + 1} cx-reveal`}
                data-reveal
                style={{ transitionDelay: `${0.34 + i * 0.06}s` }}
              >
                <Link to={`/voyages/${voyage.slug}`} className="cx-card cx-glossary" style={{ padding: 24 }}>
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: voyage.color,
                    }}
                  >
                    {entry.numeral} &middot; {voyage.title}
                  </span>
                  <span style={{ fontFamily: SERIF, fontSize: 'clamp(1.3rem, 1.8vw, 1.6rem)', color: '#fdf8f4', marginTop: 12 }}>
                    {entry.term}
                  </span>
                  <p style={{ ...bodyStyle, color: 'rgba(253,248,244,0.55)', marginTop: 10, marginBottom: 0 }}>
                    {voyage.desc}. {voyage.duration} &middot; {voyage.departure.toLowerCase()}.
                  </p>
                  <span className="cx-hint" style={{ ...bodyStyle, color: 'rgba(253,248,244,0.8)', marginTop: 'auto', paddingTop: 14 }}>
                    Read the route <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              </div>
            )
          })}
        </div>

        {/* 尾注 CTA */}
        <div className="cx-reveal" data-reveal style={{ textAlign: 'center', marginTop: 80 }}>
          <p style={{ ...bodyStyle, color: 'rgba(253,248,244,0.45)', marginBottom: 18 }}>
            The Codex is updated while you sleep.
          </p>
          <Link
            to="/reserve"
            className="cx-cta"
            style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            Reserve a departure
          </Link>
        </div>
      </main>
    </div>
  )
}
