import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

/** 全站只有一个断点(Tailwind 的 md,768px)。马赛克的焦点位置要按端分,所以得读到 JS 里 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
