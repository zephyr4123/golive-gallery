import type { CSSProperties } from 'react'
import { assets } from '../../lib/assets'

export const ONBOARDING_SIZE = { width: 511, height: 1137 }

/** 内层舞台按 870×1807 的坐标系画,再整体缩到屏幕里 —— 原稿就是这个两级缩放 */
const STAGE = { width: 870, height: 1807, scale: 0.62922 }

/**
 * 只发光四角(或单角)的 1px 描边框。
 *
 * 做法是拿径向渐变当描边颜色,再用 mask-composite 把中间挖空只留 padding 那一圈。
 * 原稿写在 ::before 上,React 里改成真实子元素,行为一致但能读。
 */
function CornerGlowBorder({ corners, className = '', style }: { corners: 'four' | 'bottom-right'; className?: string; style?: CSSProperties }) {
  const glow = 'rgba(255,255,255,.9)'
  const background =
    corners === 'four'
      ? [
          `radial-gradient(82px 72px at 0 0,${glow},transparent 100%)`,
          `radial-gradient(82px 72px at 100% 0,${glow},transparent 100%)`,
          `radial-gradient(82px 72px at 100% 100%,${glow},transparent 100%)`,
          `radial-gradient(82px 72px at 0 100%,${glow},transparent 100%)`,
        ].join(',')
      : 'radial-gradient(100px 85px at 100% 100%,rgba(255,255,255,.95),transparent 100%)'

  return (
    <div className={`pointer-events-none absolute ${className}`} style={style}>
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background,
          padding: '2.4px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </div>
  )
}

function ChevronsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 30" fill="none" className={className} aria-hidden="true">
      <path d="M4 4 15 15 4 26M17 4l11 11-11 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 屏二:引导页。全幅笑容照上做标注,底部一条滑动开始 */
export function Onboarding() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[50.34px] bg-apricot font-display">
      <div
        className="absolute top-1/2 left-1/2 bg-apricot"
        style={{
          width: STAGE.width,
          height: STAGE.height,
          transform: `translate(-50%,-50%) scale(${STAGE.scale})`,
          transformOrigin: 'center',
        }}
      >
        <img
          src={assets.smileCloseup}
          alt="Close-up of a bright smile"
          // max-w-none 是必需的:Tailwind preflight 给 img 设了 max-width:100%,
          // 会把这张刻意超出舞台宽度的底图钳回 870px,屏上就只剩底色
          className="absolute top-0 block max-w-none object-cover"
          style={{ left: -1336, width: 2712, height: 1807 }}
        />

        <div className="absolute top-[124px] left-[67px] flex items-center gap-[18px] text-white">
          <svg viewBox="0 0 32 32" fill="none" className="h-[66px] w-[66px] shrink-0" aria-hidden="true">
            <path
              d="M19.8086 24c0-1.052.8528-1.9048 1.9048-1.9048h6.0952c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048h-6.0952c-1.052 0-1.9048-.8528-1.9048-1.9048V24Z"
              fill="currentColor"
            />
            <path
              d="M19.8086 14.0952c0-1.052.8528-1.9048 1.9048-1.9048h6.0952c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048h-6.0952c-1.052 0-1.9048-.8528-1.9048-1.9048v-6.0952ZM9.9063 24c0-1.052.8527-1.9048 1.9047-1.9048h6.0952c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048H11.811c-1.052 0-1.9047-.8528-1.9047-1.9048V24ZM0 24c0-1.052.8528-1.9048 1.9048-1.9048H8c1.052 0 1.9048.8528 1.9048 1.9048v6.0952C9.9048 31.1472 9.052 32 8 32H1.9048C.8528 32 0 31.1472 0 30.0952V24ZM9.9063 4.1906c0-1.052.8527-1.9048 1.9047-1.9048h6.0952c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048H11.811c-1.052 0-1.9047-.8528-1.9047-1.9048V4.1906ZM22.0938 1.9048C22.0938.8528 22.9465 0 23.9985 0h6.0952c1.052 0 1.9048.8528 1.9048 1.9048V8c0 1.052-.8528 1.9048-1.9048 1.9048h-6.0952c-1.052 0-1.9047-.8528-1.9047-1.9048V1.9048ZM0 4.1906c0-1.052.8528-1.9048 1.9048-1.9048H8c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048H1.9048C.8528 12.1906 0 11.3378 0 10.2858V4.1906ZM0 14.0952c0-1.052.8528-1.9048 1.9048-1.9048H8c1.052 0 1.9048.8528 1.9048 1.9048v6.0952c0 1.052-.8528 1.9048-1.9048 1.9048H1.9048C.8528 22.0952 0 21.2424 0 20.1904v-6.0952Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-brand text-[56.5px] leading-none tracking-[-0.02em] font-bold">Denta</span>
        </div>

        <div className="absolute top-[154px] left-[676px] flex items-center gap-[15px]" role="progressbar" aria-valuenow={1} aria-valuemin={1} aria-valuemax={3}>
          <span className="h-[11px] w-[82px] rounded-md bg-white" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </div>

        <CornerGlowBorder corners="four" className="rounded-[14px]" style={{ left: 462, top: 286, width: 283, height: 291 }} />
        <CornerGlowBorder corners="bottom-right" className="rounded-xl" style={{ left: 170, top: 379, width: 240, height: 200 }} />

        <img
          src={assets.veneers}
          alt="Three porcelain veneer crowns on posts"
          className="absolute object-contain object-top"
          style={{ left: 488, top: 294, width: 236, height: 236 }}
        />

        <p className="absolute top-[451px] left-0 w-[384px] text-right text-[48px] leading-[51px] font-light text-white">
          Veneers
          <br />
          Installation
        </p>

        <div className="absolute top-[709px] left-[539px] h-[136px] w-[136px] rounded-full border border-white/33 bg-black/20 backdrop-blur-[2px]">
          <span className="absolute top-1/2 left-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>

        <svg className="pointer-events-none absolute top-0 left-0" width={STAGE.width} height={STAGE.height} viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} fill="none" aria-hidden="true">
          <line x1="406" y1="574" x2="607" y2="777" stroke="#fff" strokeWidth="1.4" strokeOpacity=".92" />
          <circle cx="406" cy="574" r="8" fill="#fff" />
        </svg>

        <h2 className="absolute top-[1222px] left-[87px] text-[100px] leading-[102.5px] font-light tracking-[-0.03em] whitespace-nowrap text-white">
          Oral Wellness
          <br />
          &amp; Aesthetic
          <br />
          Dentistry
        </h2>

        <div className="absolute top-[1593px] left-[87px] h-[144px] w-[693px] rounded-full bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] backdrop-blur-[9px]">
          <span className="absolute inset-0 flex items-center justify-center text-[29.5px] leading-none font-normal text-[rgba(255,250,247,.86)]">
            Swipe To Start
          </span>
          <div className="absolute top-[9px] left-[9px] flex h-[126px] w-[126px] items-center justify-center rounded-full bg-black text-white">
            <ChevronsIcon className="h-9 w-[41px] translate-x-[3px]" />
          </div>
          <div className="absolute top-[9px] right-[9px] flex h-[126px] w-[126px] items-center justify-center rounded-full bg-white/[0.066] text-white backdrop-blur-[4px]">
            <ChevronsIcon className="h-9 w-[41px] translate-x-[3px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
