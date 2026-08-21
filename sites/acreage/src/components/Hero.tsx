import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Typewriter from './Typewriter'
import { assets } from '../lib/assets'
import { scrollToSection } from '../lib/scroll'

/**
 * 首屏 —— 结构照 Acreage Farming 落地页:全幅视频背景、左下大标题(点睛短语走
 * Instrument Serif 斜体)、右下信息面板、最底一条细信息栏。
 * 原设计的 hero 视频是农庄建筑实拍,素材未随 prompt 提供;这里用 prompt 清单里
 * 的玉米地实拍(竖版,object-cover 裁出中段)顶上。
 *
 * 注意:首屏一律用 initial/animate 挂载即播,不用 whileInView ——
 * 视口边缘 100px 内的元素不算「进入视口」,首屏底部的副标会一直停在 opacity:0。
 */
const rise = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={assets.fieldBlur}
          className="h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src={assets.cropVideo} type="video/mp4" />
        </video>
        {/* 底部压深保证白字可读;上半留亮,不把画面糊掉 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 pb-8 pt-32 md:px-12 lg:px-[120px]">
        <div className="mx-auto grid w-full max-w-[1440px] items-end gap-10 lg:grid-cols-[1.75fr_1fr] lg:gap-20">
          <div>
            <h1 className="text-[clamp(2rem,4.6vw,4rem)] font-medium leading-[1.05] tracking-tight">
              <Typewriter text="Experience the standard" speed={0.012} />
              <br />
              <Typewriter text="of " delay={0.35} speed={0.012} />
              <span className="font-accent font-normal italic">
                <Typewriter text="Precision Farming" delay={0.45} speed={0.012} />
              </span>
            </h1>
            <motion.p
              {...rise}
              transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
              className="mt-6 text-lg font-light tracking-wide text-white/80 md:text-xl"
            >
              Yield with efficiency.
            </motion.p>
          </div>

          <motion.div
            {...rise}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="max-w-md border-l border-white/20 pl-6"
          >
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white transition-colors hover:text-white/60"
            >
              Schedule Now
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              A professional harvesting service that helps you clear fields faster, reduce crop loss, and
              secure yields that matter.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              We go beyond reaping — deploying modern machinery in real time, operating with skilled crews,
              and handling your crops with speed and precision.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 w-full border-t border-white/10 px-6 py-5 md:px-12 lg:px-[120px]">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
          <p className="text-xs tracking-wide text-white/50">Abundance begins with a timely harvest.</p>
          <p className="shrink-0 text-xs tracking-wide text-white/40">Season №: 0009</p>
        </div>
      </div>
    </section>
  )
}
