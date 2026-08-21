import { motion } from 'motion/react'
import Typewriter from './Typewriter'
import AnimatedCounter from './AnimatedCounter'
import { assets, BRAND_MARK_PATH, maskFromPath } from '../lib/assets'

// 数值与文案照 arceage-stats prompt 原文
const STATS = [
  { value: 500, suffix: 'K+', label: 'Acres Harvested Annually' },
  { value: 99.8, decimals: 1, suffix: '%', label: 'Crop Recovery Rate' },
  { value: 50, suffix: '+', label: 'Modern Combines Deployed' },
  { value: 15, suffix: '+', label: 'Crop Varieties Supported' },
  { value: 24, suffix: '/7', label: 'Uptime During Season' },
]

const videoMask = maskFromPath(BRAND_MARK_PATH)

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Stats() {
  return (
    <section
      id="stats"
      className="w-full overflow-hidden border-t border-white/10 bg-black px-6 py-8 text-white md:px-12 md:py-24 lg:px-[120px]"
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col items-stretch gap-16 lg:flex-row lg:gap-[160px]">
          <motion.div
            className="flex flex-1 flex-col justify-start"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <h2 className="mb-6 w-[590px] max-w-full text-[clamp(1.5rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight">
              <Typewriter text="Powering Harvests" speed={0.012} />
              <br />
              <Typewriter text="that " delay={0.25} speed={0.012} />
              <span className="font-accent font-normal italic">
                <Typewriter text="Maximize Your Yield" delay={0.35} speed={0.012} />
              </span>
            </h2>

            <p className="mb-16 max-w-lg text-base font-light leading-relaxed text-white/40 md:text-lg">
              <Typewriter
                text="For over a decade, the region's most demanding agricultural operations have relied on our modern machinery and skilled crews to secure their crops efficiently and reduce loss."
                delay={0.1}
                speed={0.012}
              />
            </p>

            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-[max-content_max-content] md:gap-x-16 lg:gap-x-24"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
            >
              {STATS.map((stat) => (
                <motion.div key={stat.label} variants={item} className="flex flex-col">
                  <span className="mb-3 font-accent text-4xl tracking-tight md:text-5xl lg:text-[56px]">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 md:text-xs">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* 品牌三角形遮罩里播玉米地实拍 */}
          <div className="flex shrink-0 items-center justify-center lg:w-1/2 lg:justify-end">
            <motion.div
              className="aspect-square w-full max-w-[500px] origin-center lg:w-[120%] lg:max-w-none"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1.2 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                WebkitMaskImage: videoMask,
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: videoMask,
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
              }}
            >
              <video autoPlay loop muted playsInline className="h-full w-full object-cover" aria-hidden="true">
                <source src={assets.cropVideo} type="video/mp4" />
              </video>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
