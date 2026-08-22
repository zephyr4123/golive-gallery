import { assets } from '../../lib/assets'

export const CONSULTATION_SIZE = { width: 523, height: 1135 }

const CALL_BUTTONS = ['mic_none', 'volume_up', 'chat_bubble']

const PRESCRIPTION = [
  { bold: 'Antibiotic:', rest: 'Amoxicillin 500 mg, 3 times', second: 'a day for 5 days' },
  { bold: 'Pain reliever:', rest: 'Ibuprofen 400 mg, every', second: '6–8 hours if needed' },
  { bold: 'Schedule an X-ray', rest: 'this week 🏥', second: null },
]

/**
 * 屏三:视频问诊。上半屏是通话画面,下半屏是同步的处方对话。
 *
 * 圆形控件原稿用「把背景图裁一块再模糊」来伪造毛玻璃,这里直接用 backdrop-blur ——
 * 效果一致,少一份跟着图走的魔法坐标。
 */
export function Consultation() {
  return (
    <div className="absolute inset-0 bg-apricot font-sans">
      <div className="absolute top-0 left-0 h-[517px] w-[523px] overflow-hidden bg-[#71604d]">
        <img src={assets.consultPatient} alt="Patient speaking during a dental video consultation" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <button
        type="button"
        className="absolute top-[34px] left-4 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-black/15 backdrop-blur-[6px]"
        aria-label="Back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-[27px] w-[22px] -translate-x-px">
          <polyline points="15 5 8 12 15 19" />
        </svg>
      </button>

      <div className="absolute top-[39px] left-[216px] flex h-[58px] w-[101px] items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[rgba(88,52,31,.54)] via-[rgba(125,88,69,.44)] to-[rgba(174,151,141,.47)] shadow-[inset_0_1px_1px_rgba(255,255,255,.12),0_8px_30px_rgba(30,15,8,.08)] backdrop-blur-[6.8px]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff0909] shadow-[0_0_8px_rgba(255,0,0,.18)]" />
        <span className="text-[21px] font-medium tracking-[-0.2px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,.24)]">11:24</span>
      </div>

      <div className="absolute top-[400px] left-4 flex h-[92px] w-[256px] items-center gap-1.5 rounded-[46px] bg-black/15 p-2 backdrop-blur-[3px]">
        {CALL_BUTTONS.map((icon) => (
          <span key={icon} className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-black/5 backdrop-blur-[5px]">
            <span className="material-symbols-outlined text-[30px] text-white" style={{ fontVariationSettings: "'FILL' 0,'wght' 500,'GRAD' 0,'opsz' 32" }}>
              {icon}
            </span>
          </span>
        ))}
      </div>

      <div className="absolute top-[413px] left-[427px] flex h-20 w-20 items-center justify-center rounded-full bg-[#ef0001] shadow-[0_8px_20px_rgba(220,0,0,.24)]">
        <span className="material-symbols-outlined text-[34px] text-white" style={{ fontVariationSettings: "'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 34" }}>
          call_end
        </span>
      </div>

      <div className="absolute top-[506px] left-0 h-[629px] w-[523px] rounded-t-[34px] rounded-b-[44px] bg-white">
        <div className="absolute top-[18px] left-0 w-[523px] text-center text-xl font-medium tracking-[0.1px] text-[#5f5f5f]">Chat Call</div>

        <img src={assets.doctorAvatar} alt="" className="absolute top-[43px] left-[125px] h-[45px] w-[45px] rounded-full object-cover" />
        <div className="absolute top-[54px] left-[183px] text-[34px] leading-none font-bold tracking-[-0.5px] text-[#111]">Dr. Emily Carter</div>

        <div className="absolute top-[119px] left-[190px] flex h-[72px] w-[319px] items-center justify-center rounded-[34px] rounded-tr-none border border-[#e8e8e8] bg-white text-xl font-semibold whitespace-nowrap text-[#151515]">
          Yes, my gum feels a bit swollen
        </div>

        <img src={assets.doctorAvatar} alt="" className="absolute top-[218px] left-[21px] h-[45px] w-[45px] rounded-full object-cover" />
        <div className="absolute top-[217px] left-[74px] flex h-[65px] w-[435px] items-center rounded-[31px] rounded-tl-none bg-[#F3F3F3] pl-[25px] text-xl font-medium whitespace-nowrap text-[#161616]">
          I&rsquo;ll prescribe antibiotics and 💊 painkillers
        </div>

        <div className="absolute top-[291px] left-[74px] h-[183px] w-[435px] rounded-[18px] bg-[#F3F3F3] px-[23px] pt-5 pb-[18px] pl-[25px] text-xl leading-[1.27] font-normal text-[#171717]">
          {PRESCRIPTION.map((row) => (
            <div key={row.bold} className="relative pl-[26px]">
              <span className="absolute top-[9px] left-[5px] h-[7px] w-[7px] rounded-full bg-[#171717]" />
              <span className="whitespace-nowrap">
                <b className="font-bold">{row.bold}</b> {row.rest}
                {row.second ? (
                  <>
                    <br />
                    {row.second}
                  </>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <div className="absolute top-[487px] left-[75px] text-base font-normal tracking-[0.2px] text-[#999]">8:21 AM</div>

        <div className="absolute top-[523px] left-[33px] flex h-[79px] w-[467px] items-center rounded-[40px] border border-[#e5e5e5] bg-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-[23px] h-[23px] w-[23px] shrink-0">
            <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49" />
          </svg>
          <span className="ml-[18px] text-[22px] font-medium text-[#969696]">Type Your Message…</span>
          <span className="absolute top-[7px] right-[7px] flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[#111126]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[27px] w-[27px] -translate-x-px translate-y-px">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
