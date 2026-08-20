import { Link } from 'react-router-dom'

// 子页面共享导航:与主页导航同一套视觉语言,星标回主页
export const NAV_PATHS: Record<string, string> = {
  Voyages: '/voyages',
  Atelier: '/atelier',
  Immersions: '/immersions',
  Journal: '/journal',
  Codex: '/codex',
  Reserve: '/reserve',
}

const LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Imprima', sans-serif",
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#fff',
  textDecoration: 'none',
  opacity: 0.9,
}

export default function SiteNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 48px',
        background: 'linear-gradient(to bottom, rgba(10,6,8,0.55), transparent)',
      }}
    >
      <div style={{ display: 'flex', gap: 36 }}>
        {['Voyages', 'Atelier', 'Immersions'].map((l) => (
          <Link key={l} to={NAV_PATHS[l]} style={LINK_STYLE}>
            {l}
          </Link>
        ))}
      </div>
      <Link to="/" aria-label="Reverie home" style={{ display: 'flex' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2l2.09 6.42H23l-5.45 3.96 2.09 6.42L14 14.84l-5.64 4.06 2.09-6.42L4.96 8.42h6.95L14 2z" fill="#fff" opacity="0.9" />
          <circle cx="14" cy="24" r="1.5" fill="#fff" opacity="0.6" />
          <circle cx="6" cy="6" r="1" fill="#fff" opacity="0.4" />
          <circle cx="22" cy="6" r="1" fill="#fff" opacity="0.4" />
        </svg>
      </Link>
      <div style={{ display: 'flex', gap: 36 }}>
        {['Journal', 'Codex', 'Reserve'].map((l) => (
          <Link key={l} to={NAV_PATHS[l]} style={LINK_STYLE}>
            {l}
          </Link>
        ))}
      </div>
    </nav>
  )
}
