import { useEffect } from 'react'
import { SiteNav } from './components/SiteNav'
import { Hero } from './components/Hero'
import { AppShowcase } from './components/AppShowcase'
import { Treatments } from './components/Treatments'
import { Faq } from './components/Faq'
import { SiteFooter } from './components/SiteFooter'

export default function App() {
  // 带 hash 直接进站(比如别人转发 /#screens)时,浏览器在 React 挂载前就已经找过一次
  // 锚点了,那时目标区块还不存在,于是停在页首。挂载后补跳一次。
  useEffect(() => {
    if (!window.location.hash) return
    document.querySelector(window.location.hash)?.scrollIntoView()
  }, [])

  return (
    <div className="bg-apricot">
      <SiteNav />
      <Hero />
      <AppShowcase />
      <Treatments />
      <Faq />
      <SiteFooter />
    </div>
  )
}
