import { useEffect, useRef, useState } from 'react'

// 资产直用 MotionSites 规格给定的 CDN URL(项目方针:不本地化)
const PORTAL_BG = 'https://flick-award-65707097.figma.site/_assets/v11/bbc8d4f1308d5df012c4b0a657b44c6d92609c24.png'
const CURTAIN_LEFT = 'https://flick-award-65707097.figma.site/_assets/v11/535b5bc4f8b600a7758bc74dc3540f405f0b89a6.png'
const CURTAIN_RIGHT = 'https://flick-award-65707097.figma.site/_assets/v11/ab14033a7fe6dcedbae303726331b6a26d9d201c.png'
const WORLD_BG = 'https://flick-award-65707097.figma.site/_assets/v11/4f4f0651516e75fbfeebf87e12be372c0683a7fd.png'
const BOTTOM_CLOUDS = 'https://flick-award-65707097.figma.site/_assets/v11/fb811f79bccceab1c4cdbb81b5524632cffc9c52.png'

const CARD_IMAGES = [
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160507_2ccbb4eb-1469-484f-af25-59168ad9a233.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160706_1c153d04-0dfb-4ac9-a4ef-e74f301c329c.png&w=1280&q=85',
]

interface WonderCard {
  title: string
  desc: string
  color: string
}

const CARDS: WonderCard[] = [
  { title: '隐世秘境', desc: '游人从未见过的发光庇护所', color: '#f3cdd6' },
  { title: '野旷孤旅', desc: '溶入无垠旷野与深沉的平静', color: '#dcedc2' },
  { title: '静谧港湾', desc: '远在寻常抵达之外的避世之地', color: '#c3e3f4' },
  { title: '定制之旅', desc: '依你的心象与灵魂裁剪的旅程', color: '#f0e4c0' },
  { title: '迷离漂流', desc: '穿过令人屏息的超现实地带', color: '#dcd2f2' },
  { title: '雾中山脊', desc: '云与神话缠绕的永恒棱线', color: '#f3cdd6' },
  { title: '深海流光', desc: '未知微光涌动的发光深处', color: '#c3e3f4' },
  { title: '鎏金暮色', desc: '漫过一切理智的琥珀色地平线', color: '#f0e4c0' },
  { title: '镜面潮汐', desc: '盛着纯粹静谧天空的止水', color: '#dcedc2' },
]

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

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

function StarLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z"
        fill="#fff"
        opacity="0.9"
      />
      <circle cx="14" cy="24" r="1.5" fill="#fff" opacity="0.6" />
      <circle cx="6" cy="6" r="1" fill="#fff" opacity="0.4" />
      <circle cx="22" cy="6" r="1" fill="#fff" opacity="0.4" />
    </svg>
  )
}

function PlayCircle({ size, iconW, iconH }: { size: number; iconW: number; iconH: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={iconW} height={iconH} viewBox="0 0 10 12" fill="none">
        <path d="M1 1l8 5-8 5V1z" fill="#1a0a00" />
      </svg>
    </div>
  )
}

// 场景一的照片卡(带底部渐变 + 模糊条两层遮罩)
function PhotoCard({
  image,
  size,
  radius,
  type,
  labelSize,
  numberSize,
  playSize,
  withBlurStrip,
}: {
  image: string
  size: number
  radius: number
  type: 'play' | 'number'
  labelSize: number
  numberSize: number
  playSize: number
  withBlurStrip: boolean
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)',
        }}
      />
      {withBlurStrip && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '44%',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            maskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 100%)',
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {type === 'play' ? (
          <>
            <PlayCircle size={playSize} iconW={playSize <= 26 ? 8 : 10} iconH={playSize <= 26 ? 10 : 12} />
            <span style={{ fontFamily: "'Imprima', 'Noto Sans SC', sans-serif", fontSize: labelSize, color: '#fff', lineHeight: 1.3 }}>
              梦境预告
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif",
                fontSize: numberSize,
                color: '#fff',
                lineHeight: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
              }}
            >
              32
            </span>
            <span style={{ fontFamily: "'Imprima', 'Noto Sans SC', sans-serif", fontSize: labelSize, color: 'rgba(255,255,255,0.9)' }}>
              位入梦旅人
            </span>
          </>
        )}
      </div>
    </div>
  )
}

// 场景二的弧形卡片摩天轮:卡片骑在视口下方远处的巨圆上,滚动带动整轮旋转
function ArcCardSlider({
  cards,
  rotationOffset,
  isMobile,
}: {
  cards: WonderCard[]
  rotationOffset: number
  isMobile: boolean
}) {
  const cardSpacingDeg = isMobile ? 12 : 9
  const centerIndex = 4
  const arcRadius = isMobile ? 700 : 1100
  const cardW = isMobile ? 160 : 220
  const cardH = isMobile ? 175 : 230
  const bottomBase = isMobile ? 140 : 200

  return (
    <div
      style={{
        position: 'relative',
        height: isMobile ? 260 : 360,
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'visible',
      }}
    >
      {cards.map((card, i) => {
        const baseDeg = (i - centerIndex) * cardSpacingDeg
        const deg = baseDeg - rotationOffset + centerIndex * cardSpacingDeg
        const rad = (deg * Math.PI) / 180
        const x = Math.sin(rad) * arcRadius
        const y = arcRadius - Math.cos(rad) * arcRadius
        return (
          <div
            key={card.title}
            style={{
              position: 'absolute',
              bottom: -y + bottomBase,
              left: `calc(50% + ${x}px - ${cardW / 2}px)`,
              transform: `rotate(${deg}deg)`,
              transformOrigin: `${cardW / 2}px ${arcRadius}px`,
              transition: 'transform 0.05s linear',
              willChange: 'transform',
            }}
          >
            <div
              style={{
                width: cardW,
                height: cardH,
                borderRadius: isMobile ? 18 : 26,
                background: card.color,
                boxShadow: '0 8px 40px rgba(80,40,60,0.18)',
                padding: isMobile ? 12 : '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  alignSelf: 'flex-end',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(80,50,60,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                  fontSize: 10,
                  color: 'rgba(80,50,60,0.6)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif",
                    fontSize: isMobile ? 22 : 30,
                    color: '#3a2530',
                    lineHeight: 1.15,
                    margin: isMobile ? '0 0 4px' : '0 0 8px',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                    fontSize: isMobile ? 12 : 15,
                    color: 'rgba(58,37,48,0.65)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const NAV_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#fff',
  textDecoration: 'none',
  opacity: 0.9,
}

export default function App() {
  const isMobile = useIsMobile()

  const [scrollProgress, setScrollProgress] = useState(0)
  const progressRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [uiVisible, setUiVisible] = useState(false)
  const curtainsOpenRef = useRef(false)
  const entranceDoneRef = useRef(false)

  const worldRef = useRef<HTMLDivElement>(null)
  const cloudsRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)
  const curtainLRef = useRef<HTMLDivElement>(null)
  const curtainRRef = useRef<HTMLDivElement>(null)

  // 入场时序:100ms 拉幕 → 600ms UI 浮现 → 2200ms 后帷幕交由 rAF 直驱
  useEffect(() => {
    const t1 = setTimeout(() => {
      curtainsOpenRef.current = true
    }, 100)
    const t2 = setTimeout(() => setUiVisible(true), 600)
    const t3 = setTimeout(() => {
      entranceDoneRef.current = true
    }, 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  // 滚动进度:state 驱动透明度渲染,ref 喂 rAF 循环
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current
      if (!container) return
      const denom = container.scrollHeight - window.innerHeight
      const p = denom > 0 ? clamp(window.scrollY / denom, 0, 1) : 0
      progressRef.current = p
      setScrollProgress(p)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 鼠标视差 + rAF 直写 transform:各层朝光标反方向漂移(rx/ry 取负)
  useEffect(() => {
    const raw = { x: 0, y: 0 }
    const smooth = { x: 0, y: 0 }
    const onMouseMove = (e: MouseEvent) => {
      raw.x = (e.clientX / window.innerWidth - 0.5) * 2
      raw.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    let rafId = 0
    const CURTAIN_ENTRANCE_TRANSITION = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)'
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
      if (cloudsRef.current) {
        const s = lerp(1, 1.4, ep)
        cloudsRef.current.style.transform = `scale(${s}) translate(${rx * 9}px, ${ry * 9 * 0.4}px)`
      }
      if (portalRef.current) {
        const s = lerp(1, 7.5, ep)
        portalRef.current.style.transform = `scale(${s}) translate(${rx * 7}px, ${ry * 7}px)`
      }
      const curtainTransition = entranceDoneRef.current ? 'none' : CURTAIN_ENTRANCE_TRANSITION
      const totalShift = (curtainsOpenRef.current ? 62 : 0) + lerp(0, 150, ep)
      const curtainScale = lerp(1, 1.3, ep)
      if (curtainLRef.current) {
        curtainLRef.current.style.transition = curtainTransition
        curtainLRef.current.style.transform = `translateX(calc(-${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${curtainScale})`
      }
      if (curtainRRef.current) {
        curtainRRef.current.style.transition = curtainTransition
        curtainRRef.current.style.transform = `translateX(calc(${totalShift}% + ${rx * 14}px)) translateY(${ry * 14 * 0.3}px) scale(${curtainScale})`
      }
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // 滚动派生的各层透明度(每次渲染即时计算)
  const p = scrollProgress
  const portalOpacity = p < 0.65 ? 1 : clamp(1 - (p - 0.65) / 0.2, 0, 1)
  const cloudsOpacity = p < 0.05 ? lerp(0.7, 1, p / 0.05) : 1
  const scene1Opacity = clamp(1 - p / 0.22, 0, 1)
  const scene2Opacity = clamp((p - 0.68) / 0.16, 0, 1)
  const arcSweepDeg = (CARDS.length - 1) * 10
  const arcRotationOffset = lerp(0, arcSweepDeg, clamp((p - 0.7) / 0.3, 0, 1))

  return (
    <div ref={containerRef} style={{ height: '480vh', position: 'relative' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: '#0a0608',
        }}
      >
        {/* 1. 世界底图 */}
        <div ref={worldRef} style={{ position: 'absolute', inset: 0, willChange: 'transform', transformOrigin: '50% 50%' }}>
          <img src={WORLD_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        {/* 2. 底部云层 z10 */}
        <div
          ref={cloudsRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            opacity: cloudsOpacity,
            willChange: 'transform',
            transformOrigin: '50% 100%',
          }}
        >
          <img src={BOTTOM_CLOUDS} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* 3. 弧形卡片摩天轮 z9 */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? 60 : 80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            zIndex: 9,
            opacity: scene2Opacity,
            pointerEvents: scene2Opacity < 0.05 ? 'none' : 'auto',
          }}
        >
          <ArcCardSlider cards={CARDS} rotationOffset={arcRotationOffset} isMobile={isMobile} />
        </div>

        {/* 4. 传送门 z15 */}
        <div
          ref={portalRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            opacity: portalOpacity,
            willChange: 'transform',
            transformOrigin: '52% 38%',
          }}
        >
          <img src={PORTAL_BG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        {/* 5. 底部压暗 z16 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            zIndex: 16,
            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* 6/7. 左右帷幕 z16 */}
        <div ref={curtainLRef} style={{ position: 'absolute', inset: 0, zIndex: 16, willChange: 'transform', transformOrigin: 'left center' }}>
          <img src={CURTAIN_LEFT} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center', display: 'block' }} />
        </div>
        <div ref={curtainRRef} style={{ position: 'absolute', inset: 0, zIndex: 16, willChange: 'transform', transformOrigin: 'right center' }}>
          <img src={CURTAIN_RIGHT} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', display: 'block' }} />
        </div>

        {/* 8. 顶部压暗 z45 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '42vh',
            zIndex: 45,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* 9. 导航 z50 */}
        <nav
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '18px 20px' : '22px 48px',
          }}
        >
          {isMobile ? (
            <span style={{ ...NAV_LINK_STYLE, fontSize: 11 }}>探索</span>
          ) : (
            <div style={{ display: 'flex', gap: 36 }}>
              {['航线', '造梦所', '沉浸之旅'].map((l) => (
                <a key={l} href="#" style={NAV_LINK_STYLE}>
                  {l}
                </a>
              ))}
            </div>
          )}
          <StarLogo />
          {isMobile ? (
            <span style={{ ...NAV_LINK_STYLE, fontSize: 11 }}>预约</span>
          ) : (
            <div style={{ display: 'flex', gap: 36 }}>
              {['手记', '梦典', '预约'].map((l) => (
                <a key={l} href="#" style={NAV_LINK_STYLE}>
                  {l}
                </a>
              ))}
            </div>
          )}
        </nav>

        {/* 10. 场景一 UI z20 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            opacity: scene1Opacity,
            transition: 'opacity 0.1s linear',
            pointerEvents: scene1Opacity < 0.05 ? 'none' : 'auto',
          }}
        >
          {/* 桌面(xl+):左标题右卡片 */}
          <div className="hidden xl:block">
            <div
              style={{
                position: 'absolute',
                top: '46%',
                left: 60,
                maxWidth: 440,
                opacity: uiVisible ? 1 : 0,
                transform: uiVisible ? 'translateY(-50%)' : 'translateY(calc(-50% + 24px))',
                transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
              }}
            >
              <h1
                style={{
                  fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif",
                  margin: 0,
                  textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: 'clamp(32px, 4.5vw, 54px)',
                    lineHeight: 1.1,
                    color: '#fff',
                    letterSpacing: '0.04em',
                  }}
                >
                  睡去 <span style={{ color: 'rgba(255,220,180,0.7)', fontSize: '0.8em' }}>›</span> <em>即启程</em>
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 'clamp(50px, 7.5vw, 88px)',
                    lineHeight: 0.9,
                    color: '#fff',
                    letterSpacing: '0.06em',
                  }}
                >
                  坠入梦境
                </span>
              </h1>
              <p
                style={{
                  fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                  fontSize: 18,
                  lineHeight: 1.7,
                  color: 'rgba(255,245,235,0.88)',
                  marginTop: 18,
                  marginBottom: 0,
                  maxWidth: 300,
                  textShadow: '0 1px 12px rgba(0,0,0,0.8)',
                }}
              >
                我们是一家贩卖梦境的旅行社——为清醒得太久的人,定制一场认真做完的梦。
              </p>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 40,
                top: '50%',
                display: 'flex',
                gap: 12,
                opacity: uiVisible ? 1 : 0,
                transform: uiVisible ? 'translateY(-50%)' : 'translateY(calc(-50% + 32px))',
                transition: 'opacity 0.9s ease 0.55s, transform 0.9s ease 0.55s',
              }}
            >
              <PhotoCard image={CARD_IMAGES[0]} size={158} radius={28} type="play" labelSize={18} numberSize={36} playSize={30} withBlurStrip />
              <PhotoCard image={CARD_IMAGES[1]} size={158} radius={28} type="number" labelSize={18} numberSize={36} playSize={30} withBlurStrip />
              <PhotoCard image={CARD_IMAGES[2]} size={158} radius={28} type="play" labelSize={18} numberSize={36} playSize={30} withBlurStrip />
            </div>
          </div>

          {/* 平板(md~xl):居中深棕标题 + 三卡 */}
          <div
            className="hidden md:flex xl:hidden"
            style={{
              position: 'absolute',
              inset: 0,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
              padding: '80px 32px 96px',
              justifyContent: 'center',
              opacity: uiVisible ? 1 : 0,
              transform: uiVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <h1 style={{ fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif", margin: 0, textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(28px, 5vw, 44px)',
                  letterSpacing: '0.1em',
                  lineHeight: 1.25,
                  color: '#3b1a0a',
                }}
              >
                睡去 <span style={{ color: '#6b2e0e', fontSize: '0.8em' }}>›</span> <em>即启程</em>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(60px, 12vw, 86px)',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                  color: '#3b1a0a',
                }}
              >
                坠入梦境
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                fontSize: 16,
                maxWidth: 400,
                color: '#5c2d0e',
                textAlign: 'center',
                margin: 0,
              }}
            >
              我们是一家贩卖梦境的旅行社——为清醒得太久的人,定制一场认真做完的梦。
            </p>
            <div style={{ display: 'flex', gap: 14 }}>
              <PhotoCard image={CARD_IMAGES[0]} size={140} radius={22} type="play" labelSize={14} numberSize={28} playSize={26} withBlurStrip />
              <PhotoCard image={CARD_IMAGES[1]} size={140} radius={22} type="number" labelSize={14} numberSize={28} playSize={26} withBlurStrip />
              <PhotoCard image={CARD_IMAGES[2]} size={140} radius={22} type="play" labelSize={14} numberSize={28} playSize={26} withBlurStrip />
            </div>
          </div>

          {/* 手机(<md):居中深棕标题 + 单卡 */}
          {/* display 必须由断点类控制,内联 display 会压过 md:hidden */}
          <div
            className="flex md:hidden"
            style={{
              position: 'absolute',
              inset: 0,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px 96px',
              opacity: uiVisible ? 1 : 0,
              transform: uiVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <h1 style={{ fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif", margin: 0, textAlign: 'center' }}>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(26px, 7vw, 42px)',
                  letterSpacing: '0.1em',
                  lineHeight: 1.25,
                  color: '#3b1a0a',
                }}
              >
                睡去 <span style={{ color: '#6b2e0e', fontSize: '0.8em' }}>›</span> <em>即启程</em>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: 'clamp(52px, 16vw, 80px)',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                  color: '#3b1a0a',
                }}
              >
                坠入梦境
              </span>
            </h1>
            <p
              style={{
                fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                fontSize: 15,
                lineHeight: 1.625,
                maxWidth: 280,
                color: '#5c2d0e',
                textAlign: 'center',
                margin: '16px 0 0',
              }}
            >
              我们是一家贩卖梦境的旅行社——为清醒得太久的人,定制一场认真做完的梦。
            </p>
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 22,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundImage: `url(${CARD_IMAGES[0]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '60%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                  }}
                />
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlayCircle size={26} iconW={8} iconH={10} />
                  <span style={{ fontFamily: "'Imprima', 'Noto Sans SC', sans-serif", fontSize: 13, color: '#fff' }}>梦境预告</span>
                </div>
              </div>
            </div>
          </div>

          {/* 进度点 */}
          <div
            style={{
              position: 'absolute',
              ...(isMobile ? { bottom: 28, left: '50%', transform: 'translateX(-50%)' } : { bottom: 40, left: 60 }),
              display: 'flex',
              gap: 7,
              opacity: uiVisible ? 1 : 0,
              transition: 'opacity 0.9s ease 0.8s',
            }}
          >
            <div style={{ width: 28, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.9)' }} />
            <div style={{ width: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
            <div style={{ width: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
            <div style={{ width: 14, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
          </div>

          {/* 滚动提示(仅桌面) */}
          {!isMobile && (
            <div
              style={{
                position: 'absolute',
                bottom: 36,
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
              <span
                style={{
                  fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                下 坠
              </span>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'bobUp 1.8s ease-in-out infinite',
                }}
              >
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5l5 4.5 5-4.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 11. 场景二 UI z46 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 46,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: scene2Opacity,
            pointerEvents: 'none',
          }}
        >
          <div style={{ marginTop: isMobile ? '8vh' : '12vh', textAlign: 'center', padding: '0 20px' }}>
            <h2
              style={{
                fontFamily: "'Viaoda Libre', 'Noto Serif SC', serif",
                fontSize: isMobile ? 'clamp(28px, 8vw, 44px)' : 'clamp(38px, 6.5vw, 78px)',
                color: '#ffffff',
                letterSpacing: '0.03em',
                lineHeight: 1.05,
                margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}
            >
              去现实之外旅行
            </h2>
            <p
              style={{
                fontFamily: "'Imprima', 'Noto Sans SC', sans-serif",
                fontSize: isMobile ? 14 : 20,
                lineHeight: 1.6,
                letterSpacing: '-0.01em',
                marginTop: 12,
                marginBottom: 0,
                maxWidth: isMobile ? 260 : 480,
                marginLeft: 'auto',
                marginRight: 'auto',
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              九条梦境航线,通往令人屏息的目的地——献给执意在寻常之外寻找美的人。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
