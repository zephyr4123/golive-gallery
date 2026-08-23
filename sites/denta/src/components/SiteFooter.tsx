import { BrandMark } from '../lib/brand'

const COLUMNS = [
  { title: 'Product', links: ['The app', 'Treatments', 'For clinics', 'Pricing'] },
  { title: 'Company', links: ['About', 'Careers', 'Press'] },
]

export function SiteFooter() {
  return (
    <footer className="bg-white pt-20 pb-5 max-[900px]:pt-[60px]">
      <div className="mx-auto w-full max-w-[1100px] px-5">
        <div className="mb-[50px] grid grid-cols-[2fr_1fr_1fr_2fr] gap-10 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1">
          <div>
            <div className="mb-[15px] flex items-center gap-2.5">
              <BrandMark className="h-6 w-6 text-ink" />
              <span className="font-brand text-xl tracking-tight">Denta</span>
            </div>
            <p className="max-w-[220px] text-[0.85rem] leading-[1.6] text-[#888]">
              Dental care that starts before you leave the sofa.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-5 text-[0.95rem] font-semibold text-ink">{column.title}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link} className="mb-3">
                    <a href="#overview" className="text-[0.85rem] text-[#888] no-underline transition-colors duration-200 hover:text-ink">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-5 text-[0.95rem] font-semibold text-ink">Launch notes</h4>
            <p className="mb-[15px] text-[0.85rem] text-[#888]">New cities and features, once a month.</p>
            {/* 演示站不接后端,提交只在前端拦住 —— 别让人以为真的订上了 */}
            <form className="flex gap-2.5" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email…"
                className="grow rounded-[10px] border border-[#f0f0f0] bg-white px-4 py-3 text-[0.9rem] shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] outline-none transition-colors duration-200 focus:border-[#ccc]"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="cursor-pointer rounded-[10px] bg-ink px-7 py-3 text-[0.9rem] font-semibold text-white shadow-[0_12px_24px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-between border-t border-[#f0f0f0] pt-[25px] pb-2.5 text-[0.85rem] text-[#888] max-[480px]:flex-col max-[480px]:items-center max-[480px]:gap-[15px]">
          <span>Denta 是为部署教学虚构的品牌,不是真实公司,页面上的服务与数据均为演示</span>
          <span>golive-gallery · 内网穿透档示范站</span>
        </div>
      </div>
    </footer>
  )
}
