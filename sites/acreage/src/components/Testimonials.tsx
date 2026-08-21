import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Typewriter from './Typewriter'

// 三条证言(引号用书名号 « »)、姓名、职务、头像 seed 全部照 arceage-testimonial prompt 原文
const FEEDBACKS = [
  {
    quote:
      '«Working with the Acreage Ag team gave us a competitive edge in bringing our crops to market. Their technical expertise, machinery, and customer service are outstanding. We consider them a key partner for all our harvesting needs»',
    author: 'Maranda Walsh',
    title: 'Operations Manager, GreenAcres Farms',
    avatar: 'https://picsum.photos/seed/maranda/100/100',
  },
  {
    quote:
      "«The team's dedication and innovative approach transformed our farm operations. They delivered a high-quality harvest on time and within budget. We highly recommend their services.»",
    author: 'John Doe',
    title: 'Owner, Valley Wheat Producers',
    avatar: 'https://picsum.photos/seed/john/100/100',
  },
  {
    quote:
      '«Exceptional service and outstanding yields. The operators were highly skilled and integrated seamlessly with our in-house farm hands. A truly remarkable partnership.»',
    author: 'Sarah Smith',
    title: 'Chief Agronomist, HarvestYield Co.',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
  },
]

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 100 : -100, opacity: 0 }),
}

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}
const line = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: 'easeOut' as const } },
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const current = FEEDBACKS[currentIndex]

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((i) => (i + 1) % FEEDBACKS.length)
  }
  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((i) => (i - 1 + FEEDBACKS.length) % FEEDBACKS.length)
  }

  return (
    // prompt 明写:页面壳是 bg-black,本区块覆写为 bg-white text-black
    <section
      id="feedback"
      className="flex w-full flex-col justify-center overflow-hidden bg-white px-6 py-8 text-black md:px-12 md:py-24 lg:px-[120px]"
    >
      <motion.div
        className="mx-auto w-full max-w-[1440px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
      >
        <motion.h2 variants={reveal} className="mb-6 text-sm font-medium tracking-wide md:text-base">
          <Typewriter text="Customer Feedback" speed={0.012} />
        </motion.h2>

        <motion.div variants={line} className="mb-12 h-px w-full origin-left bg-[#D9D9D9] md:mb-20" />

        <motion.div
          variants={reveal}
          className="relative flex min-h-[300px] items-center overflow-hidden md:min-h-[250px]"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="w-full"
            >
              <p className="text-right text-2xl font-light leading-snug tracking-tight md:text-4xl md:leading-tight lg:text-[44px]">
                <Typewriter text={current.quote} delay={0.2} speed={0.012} />
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div variants={line} className="mb-8 mt-12 h-px w-full origin-left bg-[#D9D9D9] md:mt-20" />

        <motion.div
          variants={reveal}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex w-full items-center gap-4 sm:w-auto"
            >
              <img
                src={current.avatar}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-lg font-medium">
                  <Typewriter text={current.author} delay={0.4} speed={0.012} />
                </h3>
                <p className="text-sm text-gray-500">
                  <Typewriter text={current.title} delay={0.5} speed={0.012} />
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex w-full justify-end gap-2 sm:w-auto">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous feedback"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9D9D9] transition-colors hover:bg-[#c9c9c9]"
            >
              <ArrowLeft className="h-6 w-6 text-black" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next feedback"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D9D9D9] transition-colors hover:bg-[#c9c9c9]"
            >
              <ArrowRight className="h-6 w-6 text-black" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
