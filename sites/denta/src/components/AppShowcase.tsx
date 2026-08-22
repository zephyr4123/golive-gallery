import { ChooseService, CHOOSE_SERVICE_SIZE } from './screens/ChooseService'
import { Onboarding, ONBOARDING_SIZE } from './screens/Onboarding'
import { Consultation, CONSULTATION_SIZE } from './screens/Consultation'
import { PhoneFrame } from './PhoneFrame'
import { useIsMobile } from '../lib/useIsMobile'
import { entrance, useStaggeredReveal } from '../lib/useStaggeredReveal'

const SCREENS = [
  { key: 'choose', size: CHOOSE_SERVICE_SIZE, caption: 'Pick a specialty, see who is free tonight', render: () => <ChooseService /> },
  { key: 'onboard', size: ONBOARDING_SIZE, caption: 'Tap any part of your smile to learn what it needs', render: () => <Onboarding /> },
  { key: 'consult', size: CONSULTATION_SIZE, caption: 'Video consult, prescription in the same thread', render: () => <Consultation /> },
]

/** 第二段:把 app 本身摆出来。三块真屏,不是截图占位 */
export function AppShowcase() {
  const { containerRef, visible, getAnimStyle } = useStaggeredReveal(0.1)
  const isMobile = useIsMobile()
  // 窄屏收小让三台能横滑过去;宽屏放大到能看清界面里的字
  const phoneScale = isMobile ? 0.56 : 0.78

  return (
    <section
      id="screens"
      ref={containerRef as React.RefObject<HTMLElement>}
      className="w-full scroll-mt-24 px-3 py-20 md:px-5 md:py-28"
    >
      <div className="mx-auto mb-12 flex max-w-[1180px] flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <h2
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-light tracking-tight"
          style={entrance(visible, 'blur-in', '0.9s', '0.1s')}
        >
          Three taps
          <br />
          from toothache
          <br />
          to treatment plan
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-pill-txt md:text-base" style={getAnimStyle(1)}>
          No hold music, no front desk, no “we can fit you in three weeks from Thursday”. Denta is the whole clinic reception, folded into a phone.
        </p>
      </div>

      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6 md:gap-10">
        <div className="mx-auto flex w-max gap-6 md:gap-10">
          {SCREENS.map((screen, i) => (
            <figure key={screen.key} style={entrance(visible, 'slide-up', '0.9s', `${0.3 + i * 0.15}s`)}>
              <PhoneFrame designWidth={screen.size.width} designHeight={screen.size.height} scale={phoneScale}>
                {screen.render()}
              </PhoneFrame>
              <figcaption className="mt-5 max-w-[240px] text-xs leading-5 font-semibold text-pill-txt md:max-w-[290px] md:text-sm">
                {screen.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
