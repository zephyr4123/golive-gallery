import type { ReactNode } from 'react'

/** 机身按 iPhone 比例定死,和屏幕内容的设计稿尺寸解耦 */
const BODY_W = 375
const BODY_H = 812
const BEZEL = 12

interface PhoneFrameProps {
  /** 屏幕内容的设计稿尺寸。Denta 三块屏原稿不完全等宽(511 / 511 / 523),各报各的 */
  designWidth: number
  designHeight: number
  /** 整机缩放:窄屏收小让三台能横滑,宽屏放大看清界面细节 */
  scale: number
  children: ReactNode
}

/**
 * 手机外框 —— 机身、灵动岛、底部指示条,取自 dental-implant-clinic 规格。
 *
 * 里面套一层「设计稿画布」:内容按原稿坐标绝对定位,整块等比缩放到屏幕里。
 * 这样三块屏可以逐像素照抄规格,不用为了塞进机身把每个数值重算一遍。
 */
export function PhoneFrame({ designWidth, designHeight, scale, children }: PhoneFrameProps) {
  const screenW = BODY_W - BEZEL * 2
  const screenH = BODY_H - BEZEL * 2
  const canvasScale = Math.min(screenW / designWidth, screenH / designHeight)

  return (
    <div style={{ width: BODY_W * scale, height: BODY_H * scale }} className="shrink-0 snap-center">
      <div
        style={{ width: BODY_W, height: BODY_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        className="relative overflow-hidden rounded-[54px] border-[12px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4),0_30px_60px_-30px_rgba(0,0,0,0.5),inset_0_-2px_6px_0_rgba(255,255,255,0.05)]"
      >
        <div className="pointer-events-none absolute inset-0 z-50 rounded-[42px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" />
        <div className="absolute top-3.5 left-1/2 z-40 flex h-[34px] w-[126px] -translate-x-1/2 items-center justify-center rounded-full bg-black">
          <span className="mr-8 h-2.5 w-2.5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a]" />
        </div>

        <div className="relative h-full w-full overflow-hidden rounded-[42px]">
          {/* 设计稿画布:整块居中缩放,内部保持原稿坐标系 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: designWidth,
                height: designHeight,
                transform: `scale(${canvasScale})`,
                transformOrigin: 'center center',
                flexShrink: 0,
              }}
              className="relative"
            >
              {children}
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white/30" />
      </div>
    </div>
  )
}
