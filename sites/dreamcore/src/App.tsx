import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Voyages from './pages/Voyages'
import VoyageDetail from './pages/VoyageDetail'
import Reserve from './pages/Reserve'
import Immersions from './pages/Immersions'
import Journal from './pages/Journal'
import Codex from './pages/Codex'
import Atelier from './pages/Atelier'

// HashRouter:GitHub Pages 是纯静态托管,hash 路由无需服务端回退配置
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/voyages" element={<Voyages />} />
        <Route path="/voyages/:slug" element={<VoyageDetail />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/immersions" element={<Immersions />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/codex" element={<Codex />} />
        <Route path="/atelier" element={<Atelier />} />
      </Routes>
    </HashRouter>
  )
}
