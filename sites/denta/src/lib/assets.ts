// 全站外部素材集中登记 —— 一律直接引用素材方 CDN,绝不下载入仓(见 site.yaml 的 source.assets: cdn)。
// 换素材只改这一处;哪张图来自哪个 prompt,看这个文件就够。
//
// 两批来源,对应两份规格:
//   DENTA_CDN  ← dental-care-app,三块 app 屏里用的实拍与器械图
//   HIGGS      ← health-portal,整页骨架里用的摄影棚人像与 3D 渲染
const DENTA_CDN = 'https://flick-award-65707097.figma.site/_assets/v11'

/** health-portal 的图走 higgs.ai 的转码网关,原图在 CloudFront;拼 URL 时 query 必须整体编码 */
function higgs(name: string, width = 1280): string {
  const origin = `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/${name}.png`
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(origin)}&w=${width}&q=85`
}

export const assets = {
  /** 首屏马赛克的共享底图:芥末黄上衣、白底、人在右侧 —— 暖调,与暖杏底同族 */
  heroMosaic: higgs('hf_20260624_114219_414dfe80-f15c-4e25-bf52-b13721f4bd88'),
  /** 深肤色笑容特写,暖棕调;既是 app 引导屏的全幅背景,也是第三段的主视觉 */
  smileCloseup: `${DENTA_CDN}/dddb4be9b85c58bb6b0597c80a5f76f70dd80673.png`,
  /** 酒红手套持种植牙,app 服务卡的封面 */
  implantInHand: `${DENTA_CDN}/9f6628dbdf5b112d8557f18191e15661691584e1.png?w=512`,
  /** 三颗瓷贴面牙冠(透明底),引导屏里悬在标注框上 */
  veneers: `${DENTA_CDN}/301262aba8cffd7a5ea97a79cc06c898db9dab99.png?w=256`,
  /** 视频问诊屏里的患者画面 */
  consultPatient: `${DENTA_CDN}/1c430ddc9fdbe1eff9307984694d06d144b95ab3.png?w=512`,
  /** Dr. Emily Carter 头像,问诊屏的对话双方共用 */
  doctorAvatar: `${DENTA_CDN}/754f7920b841db5f5cfcc63a59fc97856909cdf6.png`,
  /** 3D 种植牙爆炸图,冷调白瓷 —— 第三段作产品图,与暖底冷暖对照 */
  implant3d: higgs('hf_20260624_115253_c19ab167-8dd5-48b4-967d-b9f0d9d6e8fb'),
  /** 3D 牙冠修复图,同一组渲染 */
  restoration3d: higgs('hf_20260624_115237_fc519057-6e87-4abf-999a-9610b8b085b4'),
} as const
