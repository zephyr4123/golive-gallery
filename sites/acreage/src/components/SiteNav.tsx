import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { BRAND_MARK_PATH } from '../lib/assets'
import { scrollToSection } from '../lib/scroll'

// 与官方导航胶囊一致:Home / Services / [logo] / Feedback / Contact Us
// 目标 id 由 prompt 定死(arceage-services 的 #services、testimonial 的 #feedback、contact 的 #contact)
const LEFT = [
  { id: 'top', label: 'Home' },
  { id: 'services', label: 'Services' },
]
const RIGHT = [
  { id: 'feedback', label: 'Feedback' },
  { id: 'contact', label: 'Contact Us' },
]
const ALL = [...LEFT, ...RIGHT]

export function BrandMark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden="true">
      <path d={BRAND_MARK_PATH} />
    </svg>
  )
}

function goTo(id: string) {
  if (id === 'top') {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    return
  }
  scrollToSection(id)
}

function PillLink({ id, label }: { id: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => goTo(id)}
      className="whitespace-nowrap px-4 text-sm tracking-wide text-white/70 transition-colors duration-300 hover:text-white"
    >
      {label}
    </button>
  )
}

export default function SiteNav() {
  const [open, setOpen] = useState(false)

  // 抽屉展开时锁背景滚动;卸载也要还原,否则页面永久卡死
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* 桌面:居中悬浮胶囊,浮在内容之上不占版面。
          底色要够深 —— 它会浮过白色区块(证言、表单),太透白字就糊在白底上 */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center px-6 md:flex">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex items-center rounded-full border border-white/10 bg-black/75 px-3 py-2.5 backdrop-blur-md"
        >
          {LEFT.map((l) => (
            <PillLink key={l.id} {...l} />
          ))}
          <button
            type="button"
            onClick={() => goTo('top')}
            aria-label="Acreage home"
            className="px-4 text-white transition-opacity hover:opacity-60"
          >
            <BrandMark />
          </button>
          {RIGHT.map((l) => (
            <PillLink key={l.id} {...l} />
          ))}
        </nav>
      </header>

      {/* 移动端:胶囊里只放品牌与汉堡 */}
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-6 md:hidden">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex w-full items-center justify-between rounded-full border border-white/10 bg-black/80 px-5 py-3 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => goTo('top')}
            aria-label="Acreage home"
            className="flex items-center gap-2 text-white"
          >
            <BrandMark />
            <span className="text-base font-medium tracking-tight">Acreage</span>
          </button>
          <button type="button" onClick={() => setOpen(true)} className="text-white" aria-label="Open menu">
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black md:hidden"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <span className="flex items-center gap-3 text-white">
                <BrandMark className="h-7 w-7" />
                <span className="text-lg font-medium tracking-tight">Acreage</span>
              </span>
              <button type="button" onClick={() => setOpen(false)} className="text-white" aria-label="Close menu">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-8" aria-label="Mobile">
              {ALL.map((link, i) => (
                <motion.button
                  key={link.id}
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    // 等抽屉退场动画走完再滚,否则 body 还锁着,scrollTo 无效
                    window.setTimeout(() => goTo(link.id), 520)
                  }}
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="py-3 text-left text-3xl font-medium text-white hover:text-white/50"
                >
                  {link.label}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
