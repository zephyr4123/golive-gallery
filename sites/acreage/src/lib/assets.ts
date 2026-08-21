// 全站外部素材集中登记 —— 一律直接引用素材方 CDN,绝不下载入仓(见 site.yaml 的 source.assets: cdn)。
// 换素材只改这一处;哪张图来自哪里,看这个文件就够。
const ACREAGE_CDN = 'https://raw.githubusercontent.com/dsMagnatov/Acreage-landing-assets/refs/heads/main'

export const assets = {
  /** 虚化田野,作全幅背景层(文字压在上面仍可读) */
  fieldBlur: `${ACREAGE_CDN}/1.jpg`,
  /** 玉米地实拍竖版视频,放进 logo 形状遮罩里循环播放 */
  cropVideo: 'https://app-uploads.krea.ai/wan-videos/7f348c17-c3aa-40c9-9d5b-a2bed9a72c2e.mp4',
  lottie: {
    cropCare: `${ACREAGE_CDN}/curry.json`,
    machinery: `${ACREAGE_CDN}/tractor.json`,
    pest: `${ACREAGE_CDN}/beetle.json`,
  },
  icon: {
    valid: `${ACREAGE_CDN}/tick-circle.svg`,
    invalid: `${ACREAGE_CDN}/close-circle.svg`,
  },
  /** 跑马灯字标,顺序照原页面 */
  logos: [
    { name: 'Canva', src: `${ACREAGE_CDN}/canva-logo-svg-150px.svg` },
    { name: 'Voiceflow', src: `${ACREAGE_CDN}/voiceflow-logo-svg-150px.svg` },
    { name: 'Zendesk', src: `${ACREAGE_CDN}/zendesk-logo-svg-150px.svg` },
    { name: 'Pendo', src: `${ACREAGE_CDN}/pendo-logo-svg-150px.svg` },
    { name: 'Glide', src: `${ACREAGE_CDN}/glide-logo-svg-150px.svg` },
  ],
} as const

/** 品牌标记:三角山形,既做 logo 也做视频遮罩 */
export const BRAND_MARK_PATH =
  'm53.54,45.42c2.19-3.79,7.67-3.79,9.86,0l4.54,7.87c1.17,2.02,1.17,4.51,0,6.54l-8.15,13.81c-1.68,2.91.42,6.55,3.78,6.55h17.81c3.45,0,5.61-3.74,3.89-6.73l-28.76-49.81c-2.95-5.12-10.34-5.12-13.29,0l-28.46,49.3c-1.86,3.22.46,7.24,4.18,7.24h10.23c2.55,0,4.91-1.36,6.19-3.57l18.18-31.19Z'

/** 把任意 SVG 路径包成可用于 mask-image 的 data URI */
export function maskFromPath(path: string): string {
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='${path}'/%3E%3C/svg%3E")`
}

/** 头像占位:同一个 seed 永远给同一张脸,避免每次刷新换人 */
export function avatar(seed: string, size = 160): string {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}
