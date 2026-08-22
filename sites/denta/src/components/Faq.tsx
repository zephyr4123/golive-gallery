import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQS = [
  {
    q: 'Do I have to be an existing patient?',
    a: 'No. Denta matches you with licensed dentists near you, and the first video consult costs nothing whether or not you have been seen before.',
  },
  {
    q: 'Can a dentist prescribe through the app?',
    a: 'Yes. The prescription lands in the same thread as the call and is sent to whichever pharmacy you pick, so nothing gets lost between the two.',
  },
  {
    q: 'Where does my dental history live?',
    a: 'Every scan, note and prescription stays in your chart inside the app. You can export the whole thing, or delete it, from Settings at any time.',
  },
  {
    q: 'What if I need to be seen in person?',
    a: 'The dentist books the chair from inside the call and sends the consult notes ahead, so the clinic already knows why you are coming.',
  },
  {
    q: 'Which countries is Denta in?',
    a: 'iOS and Android in 14 countries so far. Out-of-hours cover depends on your city — the app shows who is on call before you book.',
  },
]

/** 收口段:左边一张会呼吸的转化卡,右边把常见顾虑逐条摊开 */
export function Faq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  return (
    <main id="faq" className="mx-auto w-full max-w-[1100px] scroll-mt-24 px-5 py-20 max-[900px]:py-[60px]">
      <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
        <div
          id="get"
          className="living-gradient flex scroll-mt-24 flex-col items-center justify-center rounded-[24px] px-10 py-20 text-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
        >
          <h2 className="mb-[15px] font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] font-light tracking-[-0.03em] [text-shadow:0_2px_16px_rgba(80,40,20,.25)]">
            Your dentist,
            <br />
            in your pocket.
          </h2>
          <p className="mb-[30px] text-[0.9rem] font-normal opacity-90 [text-shadow:0_1px_8px_rgba(80,40,20,.3)]">
            Free first consult. No waiting room, no hold music.
          </p>
          <a
            href="#overview"
            className="rounded-xl bg-ink px-8 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.4)]"
          >
            Get Denta
          </a>
        </div>

        <div className="flex flex-col justify-center gap-3">
          {FAQS.map((faq, i) => {
            const active = activeIndex === i
            return (
              <button
                key={faq.q}
                type="button"
                onClick={() => setActiveIndex(active ? null : i)}
                aria-expanded={active}
                className={`cursor-pointer rounded-[10px] border bg-white px-5 py-[18px] text-left transition-all duration-200 ${
                  active ? 'border-pill-border shadow-[0_4px_12px_rgba(0,0,0,0.04)]' : 'border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-pill-border'
                }`}
              >
                <span className="flex items-center justify-between gap-4 text-[0.9rem] font-normal text-ink">
                  {faq.q}
                  {active ? <ChevronUp size={20} className="shrink-0" /> : <ChevronDown size={20} className="shrink-0" />}
                </span>
                {active ? <span className="mt-3 block text-[0.9rem] leading-[1.6] text-[#666]">{faq.a}</span> : null}
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
