import { useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import { VOYAGES, type Voyage } from '../data/voyages'

// 主题常量集中一处:视觉契约变更时只改这里
const INK = '#0a0608'
const WARM = '#f5ece6'
const SERIF = "'Viaoda Libre', serif"
const SANS = "'Imprima', sans-serif"
const MINT = '#dcedc2' // 校验通过
const ROSE = '#f3cdd6' // 校验未过(品牌粉彩,不用刺眼红)
const LILAC = '#dcd2f2'

type FieldKey = 'name' | 'contact' | 'voyage' | 'dream'

const EMPTY_FORM: Record<FieldKey, string> = { name: '', contact: '', voyage: '', dream: '' }
const UNTOUCHED: Record<FieldKey, boolean> = { name: false, contact: false, voyage: false, dream: false }

// 校验提示:诗意但必须说清缺了什么,不许含糊
const HINTS: Record<FieldKey, string> = {
  name: 'Every dreamer travels under a name — please leave yours.',
  contact: 'Leave an address the morning can find: an email, or a phone number.',
  voyage: 'Choose a crossing from the manifest below.',
  dream: 'Even a fragment will do — tell us what you are after.',
}

const LABEL_STYLE: CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: 'rgba(245,236,230,0.55)',
}

const INPUT_STYLE: CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontFamily: SANS,
  fontSize: 17,
  color: WARM,
  padding: '10px 40px 12px 0',
}

// 逐字浮现:arceage 原型用 motion 的 staggerChildren,这里用纯 CSS 动画延迟等价实现
function Typewriter({ text, delay = 0, speed = 0.018, style }: {
  text: string
  delay?: number
  speed?: number
  style?: CSSProperties
}) {
  return (
    <span aria-label={text} role="text" style={style}>
      {text.split('').map((ch, i) =>
        ch === ' ' ? (
          <span key={i} aria-hidden="true">{' '}</span>
        ) : (
          <span
            key={i}
            aria-hidden="true"
            className="rsv-char"
            style={{ animationDelay: `${delay + i * speed}s` }}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  )
}

export default function Reserve() {
  const [searchParams] = useSearchParams()

  // ?voyage= 预填:只认真实存在的 slug,陌生值当作未选而非报错
  const [formData, setFormData] = useState<Record<FieldKey, string>>(() => {
    const preset = searchParams.get('voyage')
    const known = preset !== null && VOYAGES.some((v) => v.slug === preset)
    return { ...EMPTY_FORM, voyage: known ? preset : '' }
  })
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>(UNTOUCHED)
  const [submitted, setSubmitted] = useState(false)

  const setField = (key: FieldKey, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))
  const touch = (key: FieldKey) =>
    setTouched((prev) => ({ ...prev, [key]: true }))

  // 联络方式接受邮箱或电话任一形态,避免把真人挡在门外
  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.trim())
  const looksLikePhone = /^\+?[\d\s\-()]{7,20}$/.test(formData.contact.trim())
  const validations: Record<FieldKey, boolean> = {
    name: formData.name.trim().length > 0,
    contact: looksLikeEmail || looksLikePhone,
    voyage: VOYAGES.some((v) => v.slug === formData.voyage),
    dream: formData.dream.trim().length > 0,
  }

  const chosenVoyage: Voyage | undefined = VOYAGES.find((v) => v.slug === formData.voyage)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // 提交即视为全部触碰过,让每个空必填项同时亮出提示
    setTouched({ name: true, contact: true, voyage: true, dream: true })
    const allValid = (Object.keys(validations) as FieldKey[]).every((k) => validations[k])
    if (allValid) {
      setSubmitted(true)
      window.scrollTo({ top: 0 })
    }
  }

  // 触碰过才给判定,和原型一致:不打扰尚未作答的人
  const renderIcon = (key: FieldKey) => {
    if (!touched[key]) return null
    const ok = validations[key]
    return (
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          width: 20,
          height: 20,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8.5" stroke={ok ? MINT : ROSE} strokeOpacity="0.9" />
          {ok ? (
            <path d="M6.2 10.4l2.4 2.4 5.2-5.6" stroke={MINT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M7 7l6 6M13 7l-6 6" stroke={ROSE} strokeWidth="1.4" strokeLinecap="round" />
          )}
        </svg>
      </span>
    )
  }

  const renderHint = (key: FieldKey) => {
    if (!touched[key] || validations[key]) return null
    return (
      <p
        id={`rsv-hint-${key}`}
        role="alert"
        style={{ fontFamily: SANS, fontSize: 13, color: ROSE, margin: '8px 0 0', opacity: 0.9 }}
      >
        {HINTS[key]}
      </p>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: INK, color: WARM, overflowX: 'hidden', position: 'relative' }}>
      {/* 组件级样式:placeholder / hover 下划线 / 逐字与上浮动画只能走 CSS,内联写不了 */}
      <style>{`
        @keyframes rsvChar { to { opacity: 1; filter: blur(0); } }
        .rsv-char {
          display: inline-block;
          opacity: 0;
          filter: blur(3px);
          animation: rsvChar 0.35s ease-out forwards;
        }
        @keyframes rsvRise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        .rsv-rise { opacity: 0; animation: rsvRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .rsv-field {
          border-bottom: 1px solid rgba(245, 236, 230, 0.16);
          transition: border-color 0.35s ease;
        }
        .rsv-field:hover, .rsv-field:focus-within { border-color: rgba(245, 236, 230, 0.6); }
        .rsv-input::placeholder { color: rgba(245, 236, 230, 0.26); transition: color 0.3s ease; }
        .rsv-input:focus::placeholder { color: rgba(245, 236, 230, 0.45); }
        .rsv-submit { transition: background-color 0.35s ease, color 0.35s ease, transform 0.35s ease; }
        .rsv-submit:hover { background-color: ${LILAC} !important; transform: translateY(-1px); }
        .rsv-link { transition: opacity 0.3s ease; }
        .rsv-link:hover { opacity: 1 !important; }
        @keyframes rsvDrift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -24px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rsv-char, .rsv-rise { animation: none; opacity: 1; filter: none; transform: none; }
          .rsv-drift { animation: none !important; }
        }
      `}</style>

      {/* 背景粉彩微光:把原型的纯白底翻成梦境夜色 */}
      <div
        aria-hidden="true"
        className="rsv-drift"
        style={{
          position: 'absolute', top: '-12%', left: '-8%', width: 520, height: 520, borderRadius: '50%',
          background: `radial-gradient(circle, ${ROSE}14, transparent 70%)`,
          animation: 'rsvDrift 26s ease-in-out infinite', pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        className="rsv-drift"
        style={{
          position: 'absolute', bottom: '-15%', right: '-10%', width: 620, height: 620, borderRadius: '50%',
          background: `radial-gradient(circle, ${LILAC}12, transparent 70%)`,
          animation: 'rsvDrift 32s ease-in-out infinite reverse', pointerEvents: 'none',
        }}
      />

      <SiteNav />

      <main
        style={{
          maxWidth: 768,
          margin: '0 auto',
          padding: 'clamp(120px, 18vh, 180px) 24px 120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {submitted && chosenVoyage ? (
          /* —— 确认态:纯前端演示,不伪造网络请求 —— */
          <section style={{ textAlign: 'center', width: '100%' }} aria-live="polite">
            <div className="rsv-rise" style={{ animationDelay: '0.05s' }}>
              <svg width="44" height="44" viewBox="0 0 28 28" fill="none" style={{ margin: '0 auto 28px', display: 'block' }}>
                <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill={chosenVoyage.color} opacity="0.95" />
                <circle cx="14" cy="24" r="1.5" fill={WARM} opacity="0.6" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 400,
                fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
                lineHeight: 1.15,
                margin: '0 0 28px',
              }}
            >
              <Typewriter text="The manifest" delay={0.1} speed={0.03} style={{ fontStyle: 'italic', color: chosenVoyage.color }} />{' '}
              <Typewriter text="holds your name." delay={0.55} speed={0.03} />
            </h1>
            <p
              className="rsv-rise"
              style={{
                animationDelay: '1.1s',
                fontFamily: SANS,
                fontSize: 17,
                lineHeight: 1.75,
                color: 'rgba(245,236,230,0.75)',
                maxWidth: 520,
                margin: '0 auto 16px',
              }}
            >
              {formData.name.trim()}, your passage aboard{' '}
              <Link
                to={`/voyages/${chosenVoyage.slug}`}
                className="rsv-link"
                style={{ color: chosenVoyage.color, textDecoration: 'none', borderBottom: `1px solid ${chosenVoyage.color}55`, opacity: 0.9 }}
              >
                {chosenVoyage.title}
              </Link>{' '}
              has been folded into the night ledger. A courier of sleep will find you before the third dusk — keep a window open in your thoughts, and leave the rest to the tide.
            </p>
            <p
              className="rsv-rise"
              style={{
                animationDelay: '1.3s',
                fontFamily: SANS,
                fontSize: 14,
                fontStyle: 'italic',
                color: 'rgba(245,236,230,0.45)',
                margin: '0 0 56px',
              }}
            >
              Departure: {chosenVoyage.departure} · {chosenVoyage.duration}
            </p>
            <nav
              className="rsv-rise"
              style={{ animationDelay: '1.5s', display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                to="/"
                className="rsv-link"
                style={{
                  fontFamily: SANS, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: WARM, textDecoration: 'none', opacity: 0.7,
                  borderBottom: '1px solid rgba(245,236,230,0.3)', paddingBottom: 4,
                }}
              >
                Return to the waking shore
              </Link>
              <Link
                to="/voyages"
                className="rsv-link"
                style={{
                  fontFamily: SANS, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: WARM, textDecoration: 'none', opacity: 0.7,
                  borderBottom: '1px solid rgba(245,236,230,0.3)', paddingBottom: 4,
                }}
              >
                Wander the other crossings
              </Link>
            </nav>
          </section>
        ) : (
          /* —— 表单态 —— */
          <>
            <header style={{ textAlign: 'center', marginBottom: 72, width: '100%' }}>
              <p
                className="rsv-rise"
                style={{
                  fontFamily: SANS, fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase',
                  color: 'rgba(245,236,230,0.5)', margin: '0 0 24px',
                }}
              >
                Reservations · REVERIE
              </p>
              <h1
                style={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 'clamp(2rem, 5.5vw, 3.6rem)',
                  lineHeight: 1.15,
                  margin: '0 0 24px',
                  letterSpacing: '-0.01em',
                }}
              >
                <Typewriter text="Close your eyes." delay={0.1} speed={0.025} style={{ fontStyle: 'italic', color: ROSE }} />{' '}
                <Typewriter text="Tell us where" delay={0.65} speed={0.025} />
                <br />
                <Typewriter text="the night should collect you." delay={1.05} speed={0.025} />
              </h1>
              <p
                className="rsv-rise"
                style={{
                  animationDelay: '1.7s',
                  fontFamily: SANS, fontSize: 17, lineHeight: 1.7,
                  color: 'rgba(245,236,230,0.6)', maxWidth: 460, margin: '0 auto',
                }}
              >
                Leave your particulars and a sliver of the dream. Our navigators will chart the crossing and call on you between two heartbeats.
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 44 }}
            >
              {/* 姓名 */}
              <div className="rsv-field rsv-rise" style={{ animationDelay: '1.9s', paddingBottom: 6 }}>
                <label htmlFor="rsv-name" style={LABEL_STYLE}>Your name *</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    id="rsv-name"
                    name="name"
                    type="text"
                    className="rsv-input"
                    style={INPUT_STYLE}
                    placeholder="Who is dreaming?"
                    value={formData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    onBlur={() => touch('name')}
                    aria-invalid={touched.name && !validations.name}
                    aria-describedby="rsv-hint-name"
                  />
                  {renderIcon('name')}
                </div>
                {renderHint('name')}
              </div>

              {/* 联络方式 */}
              <div className="rsv-field rsv-rise" style={{ animationDelay: '2.05s', paddingBottom: 6 }}>
                <label htmlFor="rsv-contact" style={LABEL_STYLE}>Where to reach you *</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    id="rsv-contact"
                    name="contact"
                    type="text"
                    className="rsv-input"
                    style={INPUT_STYLE}
                    placeholder="An email, or a number the morning can dial"
                    value={formData.contact}
                    onChange={(e) => setField('contact', e.target.value)}
                    onBlur={() => touch('contact')}
                    aria-invalid={touched.contact && !validations.contact}
                    aria-describedby="rsv-hint-contact"
                  />
                  {renderIcon('contact')}
                </div>
                {renderHint('contact')}
              </div>

              {/* 航线选择 */}
              <div className="rsv-field rsv-rise" style={{ animationDelay: '2.2s', paddingBottom: 6 }}>
                <label htmlFor="rsv-voyage" style={LABEL_STYLE}>Your crossing *</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select
                    id="rsv-voyage"
                    name="voyage"
                    className="rsv-input"
                    style={{
                      ...INPUT_STYLE,
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer',
                      color: formData.voyage === '' ? 'rgba(245,236,230,0.26)' : WARM,
                      paddingRight: 64,
                    }}
                    value={formData.voyage}
                    onChange={(e) => { setField('voyage', e.target.value); touch('voyage') }}
                    onBlur={() => touch('voyage')}
                    aria-invalid={touched.voyage && !validations.voyage}
                    aria-describedby="rsv-hint-voyage"
                  >
                    <option value="" disabled style={{ background: INK, color: 'rgba(245,236,230,0.4)' }}>
                      Choose from the manifest
                    </option>
                    {VOYAGES.map((v) => (
                      <option key={v.slug} value={v.slug} style={{ background: INK, color: WARM }}>
                        {v.title} — {v.desc}
                      </option>
                    ))}
                  </select>
                  {/* 自绘下拉箭头:原生箭头在深色底上不可控 */}
                  <span
                    aria-hidden="true"
                    style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', display: 'flex', pointerEvents: 'none' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8l3.5-3.5" stroke={WARM} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {renderIcon('voyage')}
                </div>
                {renderHint('voyage')}
                {chosenVoyage ? (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(245,236,230,0.5)', margin: '10px 0 0' }}>
                    {chosenVoyage.duration} · {chosenVoyage.departure} ·{' '}
                    <Link
                      to={`/voyages/${chosenVoyage.slug}`}
                      className="rsv-link"
                      style={{ color: chosenVoyage.color, textDecoration: 'none', borderBottom: `1px solid ${chosenVoyage.color}55`, opacity: 0.85 }}
                    >
                      read its story
                    </Link>
                  </p>
                ) : (
                  <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(245,236,230,0.4)', margin: '10px 0 0' }}>
                    Undecided?{' '}
                    <Link
                      to="/voyages"
                      className="rsv-link"
                      style={{ color: 'rgba(245,236,230,0.7)', textDecoration: 'none', borderBottom: '1px solid rgba(245,236,230,0.3)', opacity: 0.85 }}
                    >
                      Wander the full manifest first
                    </Link>
                    .
                  </p>
                )}
              </div>

              {/* 梦境描述 */}
              <div className="rsv-field rsv-rise" style={{ animationDelay: '2.35s', paddingBottom: 6 }}>
                <label htmlFor="rsv-dream" style={LABEL_STYLE}>Describe your dream *</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <textarea
                    id="rsv-dream"
                    name="dream"
                    rows={4}
                    className="rsv-input"
                    style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.7, minHeight: 96 }}
                    placeholder="A staircase of water, a city lit by moths, the smell of a summer that never happened…"
                    value={formData.dream}
                    onChange={(e) => setField('dream', e.target.value)}
                    onBlur={() => touch('dream')}
                    aria-invalid={touched.dream && !validations.dream}
                    aria-describedby="rsv-hint-dream"
                  />
                  {renderIcon('dream')}
                </div>
                {renderHint('dream')}
              </div>

              <div className="rsv-rise" style={{ animationDelay: '2.5s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 12 }}>
                <button
                  type="submit"
                  className="rsv-submit"
                  style={{
                    background: WARM,
                    color: INK,
                    border: 'none',
                    borderRadius: 999,
                    padding: '14px 40px',
                    fontFamily: SANS,
                    fontSize: 13,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Set the dream in motion
                </button>
                <p style={{ fontFamily: SANS, fontSize: 12, fontStyle: 'italic', color: 'rgba(245,236,230,0.35)', margin: 0, textAlign: 'center' }}>
                  No payment is taken while you are awake.
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
