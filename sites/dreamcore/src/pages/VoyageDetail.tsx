import SiteNav from '../components/SiteNav'

// 占位骨架:待按对应 MotionSites prompt 完整实现
export default function VoyageDetail() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0608', color: '#fff' }}>
      <SiteNav />
      <div style={{ paddingTop: '40vh', textAlign: 'center', fontFamily: "'Viaoda Libre', serif", fontSize: 40 }}>
        VoyageDetail · coming soon
      </div>
    </div>
  )
}
