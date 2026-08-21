import { motion } from 'motion/react'
import Typewriter from './Typewriter'
import LottieIcon from './LottieIcon'
import { assets } from '../lib/assets'
import { scrollToSection } from '../lib/scroll'

// 三列图标、标题、描述照 arceage-services prompt 原文
const COLUMNS = [
  {
    lottie: assets.lottie.cropCare,
    title: 'Sustainable Crop Care',
    description:
      'Nurturing your fields with eco-friendly practices to ensure healthy growth and robust yields.',
  },
  {
    lottie: assets.lottie.machinery,
    title: 'Advanced Machinery',
    description: 'Deploying state-of-the-art tractors and harvesters for maximum efficiency and speed.',
  },
  {
    lottie: assets.lottie.pest,
    title: 'Smart Pest Management',
    description:
      'Protecting your harvest by monitoring and managing field ecosystems with precision.',
  },
]

const rise = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
}

function ScheduleButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection('contact')}
      className={`rounded-full bg-white px-6 py-2.5 text-sm font-medium tracking-wide text-black transition-colors duration-300 hover:bg-black hover:text-white ${className}`}
    >
      Schedule Service
    </button>
  )
}

export default function Services() {
  return (
    <section id="services" className="relative flex w-full flex-col justify-center overflow-hidden">
      {/* 全幅田野图直接作底,prompt 没有压暗遮罩 —— 加了就毁掉这块的绿 */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.fieldBlur}
          alt="Agriculture Field"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col justify-between gap-4 px-6 py-8 text-white md:gap-24 md:px-12 md:py-24 lg:px-[120px]">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid w-full grid-cols-1 items-end gap-12 md:grid-cols-3 md:gap-16">
            <motion.div
              {...rise}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="md:col-span-2"
            >
              <h2 className="mb-6 max-w-[800px] text-[clamp(1.5rem,4vw,3.5rem)] font-medium leading-[1.1] tracking-tight">
                <Typewriter
                  text="A Highly Efficient, Precision-Driven Harvesting Process Built For "
                  speed={0.012}
                />
                <span className="font-accent font-normal italic">
                  <Typewriter text="Maximum Yield" delay={0.8} speed={0.012} />
                </span>
              </h2>
              <p className="text-lg font-light tracking-wide text-white/80 md:text-[24px]">
                <Typewriter text="Precision in every pass." delay={0.1} speed={0.012} />
              </p>
            </motion.div>

            <motion.div
              {...rise}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="hidden w-full max-w-[421px] justify-end pb-1 md:flex"
            >
              <ScheduleButton />
            </motion.div>
          </div>

          <div className="grid w-full grid-cols-1 gap-12 md:mt-[200px] md:grid-cols-3 md:gap-16">
            {COLUMNS.map((col) => (
              <motion.div
                key={col.title}
                {...rise}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="flex max-w-[420px] flex-col"
              >
                <LottieIcon src={col.lottie} />
                <div className="mb-6 h-px w-full bg-white/20" />
                <h3 className="mb-3 text-2xl font-medium text-white">
                  <Typewriter text={col.title} speed={0.012} />
                </h3>
                <p className="max-w-[340px] text-sm leading-relaxed text-white/70">
                  <Typewriter text={col.description} speed={0.012} />
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...rise}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="mt-12 flex w-full justify-start md:hidden"
          >
            <ScheduleButton />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
