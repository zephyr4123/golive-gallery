import { useEffect, useState } from 'react'
import { BrandMark } from '../lib/brand'

const LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'The app', href: '#screens' },
  { label: 'Treatments', href: '#treatments' },
  { label: 'FAQ', href: '#faq' },
]

export function SiteNav() {
  const [open, setOpen] = useState(false)

  // 抽屉展开时锁住背景滚动,否则手指划在遮罩上会把底下的页面带跑
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between bg-apricot/80 px-4 py-2 backdrop-blur-md md:px-6 md:py-3">
        <a href="#overview" className="flex items-center gap-2.5">
          <BrandMark className="h-6 w-6 text-ink md:h-7 md:w-7" />
          <span className="flex flex-col leading-none">
            <span className="font-brand text-xl tracking-tight md:text-2xl">Denta</span>
            <span className="mt-1 text-[8px] font-medium tracking-wide text-pill-txt uppercase md:mt-1.5 md:text-[9px]">
              dental care, in your pocket
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-semibold text-pill-txt transition-colors hover:text-ink">
              {link.label}
            </a>
          ))}
          <a
            href="#get"
            className="rounded-full border border-ink bg-apricot px-6 py-3 text-sm font-semibold transition-colors duration-200 hover:bg-ink hover:text-apricot"
          >
            Get the app
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
        >
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-y-0 rotate-45' : '-translate-y-2'}`}
          />
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}`}
          />
          <span
            className={`absolute h-0.5 w-6 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-y-0 -rotate-45' : 'translate-y-2'}`}
          />
        </button>
      </header>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`}>
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/20 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute top-0 right-0 flex h-full w-[85%] max-w-sm flex-col justify-center gap-1 bg-apricot px-8 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`font-display text-4xl font-light transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] hover:text-pill-txt ${open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
              style={{ transitionDelay: `${100 + i * 60}ms` }}
            >
              {link.label}
            </a>
          ))}
          <div
            className="mt-8 border-t border-pill-border pt-8 transition-opacity duration-500"
            style={{ transitionDelay: '450ms', opacity: open ? 1 : 0 }}
          >
            <p className="mb-4 text-sm font-semibold">Toothache after hours?</p>
            <a
              href="#get"
              onClick={() => setOpen(false)}
              className="block w-full rounded-full bg-ink px-6 py-4 text-center text-sm font-semibold text-apricot transition-colors duration-200 hover:bg-pill-txt"
            >
              Get the app
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
