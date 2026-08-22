import { CalendarDays, Info, MessageCircle, MoreHorizontal, Search } from 'lucide-react'
import { assets } from '../../lib/assets'

export const CHOOSE_SERVICE_SIZE = { width: 511, height: 1137 }

/** 药械类图标规格里是手画的内联 SVG,lucide 里没有对应款,原样搬过来 */
function SurgeryIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 L9 15" />
      <path d="M9 15 L21 3" />
      <path d="M21 3 C15 4 11 8 9 15" />
    </svg>
  )
}

function ToothIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5.5c-2.4-2-6-1.7-7.2.9-1 2.4-.1 5.1.5 7.7.4 1.8.5 4.6 1.8 5.3 1.5.8 1.7-2.4 2.3-3.8.5-1 1.7-1 2.2 0 .6 1.4.8 4.6 2.3 3.8 1.3-.7 1.4-3.5 1.8-5.3.6-2.6 1.5-5.3.5-7.7-1.2-2.6-4.8-2.9-7.2-.9Z" />
    </svg>
  )
}

const PILL_BASE = 'absolute top-0 flex h-14 items-center gap-[11px] rounded-[28px] px-[26px] text-[25px] font-normal tracking-[-0.2px] whitespace-nowrap'
const PILL_GHOST = 'border-[1.5px] border-pill-border bg-white/35 text-pill-txt'

/**
 * 屏一:选服务。
 *
 * 两侧的胶囊刻意越界(Dentist 左出 70px、更多按钮右出边界)——原稿就是这么定的,
 * 表达的是"这排还能横滑",不是排版失误,别顺手推回来。
 */
export function ChooseService() {
  return (
    <div className="absolute inset-0 bg-screen font-display text-ink">
      <div
        className="absolute top-[68px] left-[33px] text-[66px] leading-[66px] font-light tracking-[-0.8px]"
        style={{ WebkitTextStroke: '0.6px currentColor' }}
      >
        Choose
        <br />
        a Service
      </div>

      <div className="absolute top-[70px] left-[419px] flex h-[68px] w-[68px] items-center justify-center rounded-full bg-ink/5 backdrop-blur-[2px]">
        <Search size={32} strokeWidth={1.6} className="text-[#1b1b1b]" />
      </div>

      <div className="absolute top-[228px] right-0 left-0 h-14">
        <div className={`${PILL_BASE} ${PILL_GHOST} left-[-70px]`}>Dentist</div>
        <div className={`${PILL_BASE} left-[78px] w-[171px] justify-center gap-[13px] bg-pill px-[30px] font-light text-white`}>
          <SurgeryIcon />
          Surgery
        </div>
        <div className={`${PILL_BASE} ${PILL_GHOST} left-[259px]`}>
          <ToothIcon />
          Orthodontist
        </div>
        <div className={`${PILL_BASE} ${PILL_GHOST} left-[497px]`}>
          <MoreHorizontal size={26} strokeWidth={1.4} />
        </div>
      </div>

      <div
        className="absolute top-[309px] left-[15px] h-[481px] w-[481px] overflow-hidden rounded-[38px] bg-cover bg-center shadow-[0_8px_18px_-12px_rgba(70,25,30,.35)]"
        style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.15)),url(${assets.implantInHand})` }}
      >
        <div className="absolute top-[38px] left-[30px] text-[50px] leading-[48px] font-light tracking-[0.2px] text-white [text-shadow:0_1px_10px_rgba(0,0,0,.18)]">
          Dental
          <br />
          Implants
        </div>
        <div className="absolute top-3.5 right-3.5 flex h-[72px] w-[72px] items-center justify-center rounded-full backdrop-blur-[7px]">
          <Info size={32} strokeWidth={1.6} className="text-white" />
        </div>
        <div className="absolute top-[379px] left-[30px] flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[rgba(22,10,14,.42)] backdrop-blur-[7px]">
          <MessageCircle size={30} strokeWidth={1.6} className="text-white" />
        </div>
        <div className="absolute top-[372px] left-[127px] flex h-[79px] w-[324px] items-center justify-center gap-4 rounded-[40px] bg-[#0A0A0A] text-[21px] font-light tracking-[-0.2px] text-white">
          <CalendarDays size={27} strokeWidth={1.6} />
          Schedule Surgery
        </div>
      </div>

      <div
        className="absolute top-[805px] left-[15px] h-[332px] w-[481px] overflow-hidden rounded-[38px] rounded-b-none bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.25)),url(${assets.smileCloseup})` }}
      >
        <div className="absolute top-8 left-[30px] text-[50px] leading-[48px] font-light tracking-[0.2px] text-white [text-shadow:0_1px_10px_rgba(0,0,0,.18)]">
          Surgical Smile
          <br />
          Restoration
        </div>
        <div className="absolute top-3.5 right-3.5 flex h-[72px] w-[72px] items-center justify-center rounded-full backdrop-blur-[7px]">
          <Info size={32} strokeWidth={1.6} className="text-white" />
        </div>
      </div>
    </div>
  )
}
