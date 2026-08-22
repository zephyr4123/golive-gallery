import { assets } from '../lib/assets'
import { useStaggeredReveal } from '../lib/useStaggeredReveal'

function ArrowBadge({ tone }: { tone: 'ink' | 'white' }) {
  const color = tone === 'ink' ? 'border-ink text-ink' : 'border-white text-white'
  return (
    <span className={`flex h-9 w-9 items-center justify-center self-end rounded-full border md:h-12 md:w-12 ${color}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="-rotate-45" aria-hidden="true">
        <path d="M1 7h12m0 0L8 2m5 5L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** 第三段:治疗项目。左列是文字与器械图,右列一张主视觉压两张说明卡 */
export function Treatments() {
  const { containerRef, getAnimStyle } = useStaggeredReveal()

  return (
    <section
      id="treatments"
      ref={containerRef as React.RefObject<HTMLElement>}
      className="flex min-h-screen w-full scroll-mt-24 flex-col gap-1.5 overflow-hidden px-3 pt-1.5 pb-1.5 md:h-screen md:gap-2 md:px-5 md:pt-2 md:pb-2"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 md:grid-cols-2 md:gap-2">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <div
            className="flex min-h-[180px] flex-[1.2] flex-col justify-between rounded-xl bg-white p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={getAnimStyle(0)}
          >
            <h2 className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-light">
              Book any
              <br />
              Treatment
            </h2>
            <p className="text-xs font-semibold md:text-sm">Implants · Veneers · Whitening · Ortho</p>
          </div>

          <div className="flex min-h-[140px] flex-1 gap-1.5 md:min-h-0 md:gap-2" style={getAnimStyle(1)}>
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img src={assets.implant3d} alt="Exploded view of a dental implant" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden rounded-xl md:rounded-2xl">
              <img src={assets.restoration3d} alt="Dental crown restoration" className="h-full w-full object-cover" />
            </div>
          </div>

          <div
            className="flex min-h-[160px] flex-[0.8] items-end justify-between rounded-xl bg-[#f0d2ba] p-5 md:min-h-0 md:rounded-2xl md:p-7"
            style={getAnimStyle(2)}
          >
            <div>
              <p className="mb-2 text-xs font-semibold md:mb-3 md:text-sm">Out of hours</p>
              <h3 className="font-display text-xl leading-6 font-light md:text-3xl md:leading-8">
                Talk to a
                <br />
                Dentist
                <br />
                Tonight
              </h3>
            </div>
            <a
              href="#get"
              className="rounded-full bg-white px-5 py-3 text-base font-semibold transition-transform hover:scale-105 md:px-8 md:py-5 md:text-xl"
            >
              Open App
            </a>
          </div>
        </div>

        <div className="relative min-h-[350px] overflow-hidden rounded-xl md:min-h-0 md:rounded-2xl" style={getAnimStyle(3)}>
          <img src={assets.smileCloseup} alt="Close-up of a treated smile" className="h-full w-full object-cover" />
          <div className="absolute right-3 bottom-3 left-3 flex gap-1.5 md:right-5 md:bottom-5 md:left-5 md:gap-2">
            <div className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white p-3 md:h-52 md:rounded-2xl md:p-5">
              <h4 className="font-display text-lg leading-5 font-light md:text-2xl md:leading-7">
                How Implants
                <br />
                Actually
                <br />
                Work
              </h4>
              <ArrowBadge tone="ink" />
            </div>
            <div className="flex h-36 flex-1 flex-col justify-between rounded-xl bg-white/20 p-3 backdrop-blur-xl md:h-52 md:rounded-2xl md:p-5">
              <h4 className="font-display text-lg leading-5 font-light text-white md:text-2xl md:leading-7">
                Caring
                <br />
                for New
                <br />
                Veneers
              </h4>
              <ArrowBadge tone="white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
