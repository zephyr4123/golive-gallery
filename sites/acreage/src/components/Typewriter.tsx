import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

type Props = {
  text: string
  delay?: number
  speed?: number
  className?: string
}

const container = (speed: number, delay: number) => ({
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: speed, delayChildren: delay } },
})

const char = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

/**
 * 逐字显现 —— 全站文字的统一入场方式。
 * 整句在 DOM 里始终完整存在(只改 opacity),所以屏幕阅读器与搜索引擎拿到的是完整文本。
 */
export default function Typewriter({ text, delay = 0, speed = 0.015, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10px' })

  return (
    <motion.span
      ref={ref}
      className={className}
      variants={container(speed, delay)}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {Array.from(text).map((c, i) => (
        <motion.span key={`${c}-${i}`} variants={char} aria-hidden={false}>
          {c}
        </motion.span>
      ))}
    </motion.span>
  )
}
