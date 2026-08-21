import { useEffect, useRef } from 'react'
import { animate, useInView } from 'motion/react'

type Props = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
}

/** 数字从 0 滚到目标值 —— 进入视口触发一次,不重播 */
export default function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = prefix + v.toFixed(decimals) + suffix
      },
    })
    // 组件在动画途中卸载(切路由)时停掉,避免往已卸载节点写文本
    return () => controls.stop()
  }, [inView, value, prefix, suffix, decimals])

  return (
    <span ref={ref}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  )
}
