import SiteNav, { BrandMark } from './components/SiteNav'
import Hero from './components/Hero'
import Stats from './components/Stats'
import LogoMarquee from './components/LogoMarquee'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'

// 单页锚点站,区块顺序照 acreage-farming-hero 的规格:
// hero 视频 → stats 数字 → logo 跑马灯 → service cards → 深浅交替(证言、表单转白底)
export default function App() {
  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-black font-sans text-white">
        <Hero />
        <Stats />
        <LogoMarquee />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <footer className="bg-white px-6 pb-10 md:px-12 lg:px-[120px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4 border-t border-[#D9D9D9] pt-8 sm:flex-row sm:justify-between">
          <span className="flex items-center gap-3 text-black">
            <BrandMark className="h-7 w-7" />
            <span className="text-lg font-medium tracking-tight">Acreage</span>
          </span>
          <p className="max-w-xl text-center text-xs text-gray-400 sm:text-right">
            Acreage is a fictional company, built from MotionSites prompts as a Cloudflare Pages deployment
            demo for{' '}
            <a
              href="https://github.com/zephyr4123/golive-gallery"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-gray-600"
            >
              golive-gallery
            </a>
            . The form validates locally and sends nothing.
          </p>
        </div>
      </footer>
    </>
  )
}
