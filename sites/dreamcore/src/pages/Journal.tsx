import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// 手记条目与航线的绑定关系:每篇日志都指向一条真实航线,
// 颜色/徽章文字从 VOYAGES 单一数据源取,避免两处维护
interface JournalEntry {
  title: string
  excerpt: string
  date: string
  author: string
  video: string
  voyageSlug: string
}

const FEATURED: JournalEntry = {
  title: 'The Sun Agreed to Wait',
  excerpt:
    'We asked the evening to stay a little longer, and it did. For one suspended hour the amber light pooled on the deck of the dream, and nobody spoke — not because there was nothing to say, but because the light was saying it better.',
  date: 'Entry XLVII · The Last Warm Hour',
  author: 'Logged by I. Vesper, Navigator',
  video:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_155500_808e6fdd-761f-4acd-b3be-cb7e6e700def.mp4',
  voyageSlug: 'gilded-dusk',
}

const ENTRIES: JournalEntry[] = [
  {
    title: 'Lanterns Below the Floor of Sleep',
    excerpt:
      'Twenty fathoms down, the unremembered thoughts pass in shoals. I held my breath out of habit; the depth held it back for me.',
    date: 'Entry XLII · Twenty Fathoms',
    author: 'Logged by M. Sorrel, Deep Pilot',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
    voyageSlug: 'deep-currents',
  },
  {
    title: 'Walking the Mirror',
    excerpt:
      'The sea had practiced stillness for ten thousand years and was not about to break its streak for us. Each step we took, the sky beneath took with us.',
    date: 'Entry XXXIX · Between Two Heartbeats',
    author: 'Logged by A. Thistle, Shorewright',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4',
    voyageSlug: 'glassy-tides',
  },
  {
    title: 'Where Gravity Forgot Its Manners',
    excerpt:
      'A stairway poured past us like a waterfall, politely. The horizon stepped aside. We fell upward for a while and called it progress.',
    date: 'Entry XXXV · The Tilt of Falling',
    author: 'Logged by E. Larkspur, Drift Warden',
    video:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154232_f8809bd2-a6c3-4a38-908d-2005e5b3cb3e.mp4',
    voyageSlug: 'vivid-drifts',
  },
]

// 失败路径:条目引用了不存在的 slug 时不渲染死链,回退到航线目录页
function voyageOf(slug: string): Voyage | undefined {
  return VOYAGES.find((v) => v.slug === slug)
}

function voyagePath(slug: string): string {
  return voyageOf(slug) ? `/voyages/${slug}` : '/voyages'
}

const SERIF = "'Viaoda Libre', serif"
const SANS = "'Imprima', sans-serif"
const INK = '#0a0608'
const WARM_WHITE = 'rgba(250, 244, 240, 0.92)'
const WARM_DIM = 'rgba(250, 244, 240, 0.55)'

// 航线粉彩色做徽章底、深梅黑做徽章字:深底页面上对比才够
function VoyageBadge({ slug }: { slug: string }) {
  const voyage = voyageOf(slug)
  if (!voyage) return null
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: INK,
        background: voyage.color,
        borderRadius: 20,
        padding: '4px 12px',
        whiteSpace: 'nowrap',
      }}
    >
      {voyage.title}
    </span>
  )
}

// blog-showcase 的媒体交互语言:hover 放大 + 暗色罩 + 中央圆形 "+" + 四角 L 形框线
function MediaFrame({ video, ratio }: { video: string; ratio?: string }) {
  const corners: React.CSSProperties[] = [
    { top: 15, left: 15, borderWidth: '1.5px 0 0 1.5px' },
    { top: 15, right: 15, borderWidth: '1.5px 1.5px 0 0' },
    { bottom: 15, left: 15, borderWidth: '0 0 1.5px 1.5px' },
    { bottom: 15, right: 15, borderWidth: '0 1.5px 1.5px 0' },
  ]
  return (
    <div
      className="jr-media"
      style={{
        position: 'relative',
        overflow: 'hidden',
        aspectRatio: ratio,
        height: ratio ? undefined : '100%',
        minHeight: ratio ? undefined : 320,
      }}
    >
      <video
        className="jr-media-video"
        src={video}
        autoPlay
        loop
        muted
        playsInline
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div
        className="jr-media-overlay"
        style={{ position: 'absolute', inset: 0, background: 'rgba(10, 6, 8, 0.35)' }}
      />
      <div
        className="jr-media-plus"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.18)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: WARM_WHITE,
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 400,
        }}
      >
        +
      </div>
      {corners.map((pos, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: 12,
            height: 12,
            borderStyle: 'solid',
            borderColor: 'rgba(250, 244, 240, 0.85)',
            pointerEvents: 'none',
            ...pos,
          }}
        />
      ))}
    </div>
  )
}

export default function Journal() {
  const pageRef = useRef<HTMLDivElement>(null)

  // 滚动 reveal:进入视口的段落淡入上移;不支持 IO 的环境直接全部显示,不能让内容消失
  useEffect(() => {
    const root = pageRef.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.jr-reveal'))
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add('jr-shown'))
      return
    }
    const observer = new IntersectionObserver(
      (observed) => {
        observed.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('jr-shown')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={pageRef} style={{ minHeight: '100vh', background: INK, color: WARM_WHITE }}>
      <style>{`
        .jr-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s cubic-bezier(0.33, 1, 0.68, 1), transform 0.8s cubic-bezier(0.33, 1, 0.68, 1);
        }
        .jr-reveal.jr-shown { opacity: 1; transform: translateY(0); }
        .jr-media-video { transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1); }
        .jr-media-overlay { opacity: 0; transition: opacity 0.4s ease; }
        .jr-media-plus { opacity: 0; transform: translate(-50%, -50%) scale(0.7); transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.33, 1, 0.68, 1); }
        .jr-card:hover .jr-media-video { transform: scale(1.08); }
        .jr-card:hover .jr-media-overlay { opacity: 1; }
        .jr-card:hover .jr-media-plus { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        .jr-card { transition: border-color 0.4s ease; }
        .jr-card:hover { border-color: rgba(250, 244, 240, 0.25) !important; }
        .jr-pill { transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1), opacity 0.3s ease; }
        .jr-pill:hover { transform: scale(1.02); }
        .jr-quiet-link { transition: opacity 0.3s ease; }
        .jr-quiet-link:hover { opacity: 1 !important; }
        .jr-featured-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .jr-entry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
        @media (max-width: 1024px) {
          .jr-featured-grid { grid-template-columns: 1fr; }
          .jr-entry-grid { grid-template-columns: repeat(2, 1fr); }
          .jr-featured-body { padding: 40px !important; }
        }
        @media (max-width: 768px) {
          .jr-heading { font-size: 46px !important; }
          .jr-header-bottom { flex-direction: column; align-items: flex-start !important; gap: 24px; }
          .jr-entry-grid { grid-template-columns: 1fr; }
          .jr-featured-title { font-size: 30px !important; }
        }
      `}</style>

      <SiteNav />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '150px 20px 80px' }}>
        {/* —— 页头 —— */}
        <header className="jr-reveal" style={{ marginBottom: 56 }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: SANS,
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: WARM_DIM,
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '6px 14px',
              marginBottom: 28,
            }}
          >
            Journal
          </span>
          <h1
            className="jr-heading"
            style={{
              fontFamily: SERIF,
              fontSize: 64,
              fontWeight: 400,
              letterSpacing: '-0.5px',
              lineHeight: 1.05,
              margin: '0 0 24px',
            }}
          >
            Notes from the sleeping world
          </h1>
          <div
            className="jr-header-bottom"
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
          >
            <p
              style={{
                fontFamily: SANS,
                fontSize: 18,
                lineHeight: 1.6,
                color: WARM_DIM,
                maxWidth: 480,
                margin: 0,
              }}
            >
              Dispatches our travelers carried back across the border of waking. Each entry belongs
              to a voyage; follow one to see where it began.
            </p>
            <Link
              to="/voyages"
              className="jr-pill"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                color: INK,
                background: WARM_WHITE,
                borderRadius: 40,
                padding: '13px 26px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              View all voyages
            </Link>
          </div>
        </header>

        {/* —— 精选手记(整宽双栏卡) —— */}
        <Link
          to={voyagePath(FEATURED.voyageSlug)}
          className="jr-card jr-reveal jr-featured-grid"
          style={{
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.09)',
            background: 'rgba(255, 255, 255, 0.025)',
            minHeight: 520,
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'inherit',
            marginBottom: 25,
          }}
        >
          <MediaFrame video={FEATURED.video} />
          <div
            className="jr-featured-body"
            style={{ padding: 60, display: 'flex', flexDirection: 'column' }}
          >
            <span
              style={{
                alignSelf: 'flex-start',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: INK,
                background: WARM_WHITE,
                borderRadius: 20,
                padding: '5px 14px',
                marginBottom: 28,
              }}
            >
              Traveler's Pick
            </span>
            <h2
              className="jr-featured-title"
              style={{
                fontFamily: SERIF,
                fontSize: 44,
                fontWeight: 400,
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                margin: '0 0 20px',
              }}
            >
              {FEATURED.title}
            </h2>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 17,
                lineHeight: 1.65,
                color: WARM_DIM,
                margin: 0,
              }}
            >
              {FEATURED.excerpt}
            </p>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{ fontFamily: SANS, fontSize: 13, color: WARM_DIM }}>
                <div style={{ marginBottom: 4 }}>{FEATURED.author}</div>
                <div style={{ opacity: 0.75 }}>{FEATURED.date}</div>
              </div>
              <VoyageBadge slug={FEATURED.voyageSlug} />
            </div>
          </div>
        </Link>

        {/* —— 手记网格(三卡) —— */}
        <section className="jr-entry-grid" style={{ marginBottom: 90 }}>
          {ENTRIES.map((entry, i) => (
            <Link
              key={entry.voyageSlug}
              to={voyagePath(entry.voyageSlug)}
              className="jr-card jr-reveal"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 20,
                border: '1px solid rgba(255, 255, 255, 0.09)',
                background: 'rgba(255, 255, 255, 0.025)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                // 入场 stagger:三卡依次延迟,不一起蹦出来
                transitionDelay: `${i * 0.12}s`,
              }}
            >
              <MediaFrame video={entry.video} ratio="16 / 10" />
              <div style={{ padding: '22px 24px 26px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 14,
                    marginBottom: 12,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontSize: 22,
                      fontWeight: 400,
                      lineHeight: 1.25,
                      margin: 0,
                    }}
                  >
                    {entry.title}
                  </h3>
                  <VoyageBadge slug={entry.voyageSlug} />
                </div>
                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: WARM_DIM,
                    margin: '0 0 18px',
                  }}
                >
                  {entry.excerpt}
                </p>
                <div
                  style={{
                    marginTop: 'auto',
                    fontFamily: SANS,
                    fontSize: 12.5,
                    color: WARM_DIM,
                    opacity: 0.8,
                  }}
                >
                  {entry.date} · {entry.author}
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* —— 底部引路:Codex 与 Reserve —— */}
        <footer
          className="jr-reveal"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.09)',
            paddingTop: 56,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 560,
              margin: '0 auto 32px',
            }}
          >
            Every entry ends the same way: the traveler wakes, and wishes they hadn't.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/reserve"
              className="jr-pill"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                color: INK,
                background: '#f3cdd6',
                borderRadius: 40,
                padding: '13px 28px',
                textDecoration: 'none',
              }}
            >
              Reserve a departure
            </Link>
            <Link
              to="/codex"
              className="jr-quiet-link"
              style={{
                fontFamily: SANS,
                fontSize: 13,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: WARM_WHITE,
                opacity: 0.6,
                textDecoration: 'none',
                borderBottom: '1px solid rgba(250, 244, 240, 0.35)',
                paddingBottom: 3,
              }}
            >
              Consult the Codex
            </Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
