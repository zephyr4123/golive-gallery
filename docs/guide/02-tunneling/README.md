# 02 · 内网穿透:让公网访问你本机的服务

> 上一档是把网站**搬到别人的服务器上**;这一档反过来,让访客的流量**回到你自己的机器上**。
> 教的不是"静态站还能怎么放",而是这条路本身怎么走通——以及它和托管的本质差别。

## 方向反了,这是唯一要抓住的点

免费托管档里,你的机器只负责 `git push`,之后就可以关机——网站活在 GitHub/Cloudflare 的服务器上。

内网穿透档里,网站**一直活在你这台机器上**。公网上那个域名后面没有服务器,只有一条从你机器主动打出去的长连接:

```
访客 → 隧道服务商的边缘节点 → (那条长连接) → 你本机的 localhost:4173
```

由此推出这一档全部的性质,包括好的和坏的:

- 不需要公网 IP、不需要在路由器上开端口映射——连接是你**主动打出去**的,家庭宽带的 NAT 不构成障碍
- 不需要备案(取决于边缘节点落在哪,见下文 cpolar 那条)
- 🔴 **你的机器关了,站就没了。** 休眠、断网、换 Wi-Fi、进程被杀,访客立刻打不开

最后这条不是缺陷,是这门技术的定义。本项目对它的处理方式是**在机器上诚实标注**,而不是在文档里写一句免责声明——见文末「宿命」一节。

## 本档三条链路

同一件事有三种做法,差别不在"能不能",在**地址是谁的、证书谁管、访客第一眼看到什么**:

1. **Cloudflare Tunnel**(`cloudflared.md`,待写)—— 本档首选。免费绑自有子域名 + 自动 HTTPS;实测访客直接进站,没有 ngrok 那种警告插页。代价是域名的 DNS 必须整个托管在 Cloudflare(本项目已满足,见 [Cloudflare 解析篇](../01-free-hosting/custom-domain-cloudflare.md))。它还有一个零配置模式(Quick Tunnel),给随机 `*.trycloudflare.com` 地址,不用账号也不用域名
2. **cpolar**(`cpolar.md`,待写)—— 国产方案,中文文档、大陆节点、注册即用。免费档能跑通全套机制,适合先理解原理;要拿它当长期地址,得知道各档真实代价(见下表)
3. **ngrok**(`ngrok.md`,待写)—— 机制最干净的教科书样例:装好、一条命令、拿到公网地址,全程三十秒。它的免费档限制本身就是最好的教材——你能清楚看到"免费的隧道"和"托管"之间隔着什么

## 三家横向对照

平台事实核于 2026-08-22。各篇正文待写,届时逐条附出处与实机取证。**这类免费档政策一年一变**,照抄两年前的中文教程大概率是错的——本档每篇都会标注核实日期与自查方法。

| | Cloudflare Tunnel | cpolar | ngrok |
|---|---|---|---|
| 绑自有子域名 | ✅ 免费 | 专业版起(149 元/年) | ❌ 免费档不支持 |
| 免费档给什么地址 | 随机 `*.trycloudflare.com`,重启即换 | 随机二级域名,官方明写 **24 小时内会变**(不重启也变) | 账号固定的 `*.ngrok-free.app`,重启不变 |
| HTTPS | 自动签发续期 | 自家域名自动;**自有域名要你自己提供 crt/key** | 自动 |
| 访客首访 | 直接进站 | 直接进站 | 🔴 先看一张 ngrok 警告插页,点 Visit 才进,cookie 只压 7 天 |
| 会话时长 | 无上限 | 无上限 | 无上限(「2 小时」是 v2 时代的旧说法) |
| 免费档配额 | 未公布硬配额 | 带宽 1 Mbps,不限流量 | 1 GB + 20000 请求/月,用完直接拒流量 |
| 备案 | 标准网络无此要求 | 🔴 **默认 region 是大陆节点,强制备案**;未备案域名必须显式选 us/hk/tw/eu | 不涉及 |
| 大陆可达 | 可直连,但绕美西/香港 | 大陆节点最快;走海外节点则跨境 | 可直连,绕新加坡 |

两条容易被中文教程带偏的地方,先说在前面:

- **ngrok 没有被墙。** 搜索首页至今还在返回 2015 年 ngrok v1 时代的「ngrok 被墙了吗」。2026-08-22 的多点实测 + OONI + GreatFire 三路互证:`*.ngrok-free.app` DNS 干净、TLS 握手正常、状态码正常,只是绕新加坡所以慢。这和 `vercel.app`(DNS 被投毒成 Twitter/Facebook 段的伪造 IP)是两回事
- **cpolar 也要实名。** 「国内只有 cpolar 不用实名」是 2022–2023 年横评的口径,它自己的服务条款已经写明要实名。这一档的四家国内服务全都要,动手前先知道

## 动手前:两个所有链路都会撞上的拦路虎

与用哪家无关,只要你伺服的是 Vite 构建产物就会遇到。下面的输出是 2026-08-22 在本项目上实拍的:Vite 7.3.6 + cloudflared 2026.8.2,起一条 Quick Tunnel 打到 `sites/acreage` 的构建产物。

**一、`vite preview` 按 Host 校验,隧道域名一律 403**

隧道通了、本机也是好的,访客却拿到一段纯文本:

```
$ curl -D- https://consumers-alert-sacred-wars.trycloudflare.com/
HTTP/2 403
content-type: text/plain
server: cloudflare

Blocked request. This host ("consumers-alert-sacred-wars.trycloudflare.com") is not allowed.
To allow this host, add "consumers-alert-sacred-wars.trycloudflare.com" to `preview.allowedHosts` in vite.config.js.
```

注意这个 403 是 **Vite 发的**,不是 Cloudflare 拦的——`server: cloudflare` 只说明它经过了 CF 边缘。看到这段就说明隧道其实是通的,问题在最后一跳。

站点的 `vite.config.ts` 里得放行:

```ts
export default defineConfig({
  preview: {
    // 隧道域名不在默认白名单里;写域名后缀可一次覆盖该服务商所有随机子域
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', 'yoursite.<BASE_DOMAIN>'],
  },
})
```

写进站点的 `vite.config.ts`:

```ts
export default defineConfig({
  preview: {
    // 隧道域名不在默认白名单里。以点开头是后缀通配,一次覆盖该服务商所有随机子域
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', 'yoursite.<BASE_DOMAIN>'],
  },
})
```

后缀通配实测有效:配上 `.trycloudflare.com` 之后,同一条隧道立刻从 403 变成 200 并返回站点自己的 HTML。

**二、`vite preview` 只监听 `[::1]`,回源地址不能写 `127.0.0.1`**

它启动时打印的是 `Local: http://localhost:4173/`,看起来人畜无害,实际只在 IPv6 回环上:

```bash
$ curl -o /dev/null -w '%{http_code}' http://localhost:4173/   # 200
$ curl -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/   # 000  连不上
$ lsof -nP -iTCP:4173 -sTCP:LISTEN
node  17074  ...  TCP [::1]:4173 (LISTEN)
```

同一台机器、同一个端口、同一时刻,两条隧道的 A/B 对照:

| 回源地址 | 隧道自身状态 | 访客拿到 |
|---|---|---|
| `http://localhost:4173` | Registered tunnel connection | ✅ 200 |
| `http://127.0.0.1:4173` | Registered tunnel connection | ❌ 502 Bad gateway |

cloudflared 侧的报错原文是 `dial tcp 127.0.0.1:4173: connect: connection refused`。**隧道显示已连接、访客却 502**,九成是这一条。回源一律写 `localhost`。

顺带两条同源的坑:

- 启动务必带 `--strictPort`。不带的时候端口被占,Vite 会**静默换一个端口**继续跑——它只在日志里写一行 `Port 4173 is in use, trying another one...` 然后打印 `Local: http://localhost:4174/`,隧道那头还指着 4173,于是你得到一个连得上却永远 502 的隧道。带上之后它会直接 `Error: Port 4173 is already in use` 退出,失败得响亮
- **公开分享一律用 `vite preview`,不要用 `vite dev`。** dev server 会通过隧道把源码、文件路径、项目结构一起暴露给公网

## 出问题时:先看状态码是哪一层发的

隧道链路有三跳,三跳各有各的失败长相。同一条 Quick Tunnel 上逐个实测出来的:

| 现象 | 断在哪 | 怎么确认 |
|---|---|---|
| `403` + `Blocked request. This host ... is not allowed` | 最后一跳:本地服务不认这个 Host | 隧道其实是通的,去配 `allowedHosts` |
| `502 Bad gateway`(Cloudflare 品牌页) | 中间一跳:隧道在,回源连不上 | 看 cloudflared 日志的 `Unable to reach the origin service`——本地服务挂了,或回源写了 `127.0.0.1` |
| `530`,标题 `Cloudflare Tunnel error` | 第一跳:隧道进程本身没了 | 这就是"本机关机"访客看到的那一页。注意 DNS 还在正常解析,不是域名坏了 |

本机这一侧的自查不用猜,cloudflared 自带一个只监听本地的 metrics 端点:

```bash
$ curl -s http://127.0.0.1:20241/ready
{"status":200,"readyConnections":1,"connectorId":"33d97e25-..."}
```

`readyConnections` 大于 0 就说明隧道到边缘的连接是活的——此时若访客仍打不开,问题一定在回源那一跳,不用再去怀疑网络。

## 安全边界

隧道做的事情是"把你本机的一个端口暴露到公网",所以它的风险面和"把网站放到托管平台"完全不同:

- **只暴露该暴露的那一个端口。** 隧道配置里 ingress 规则要精确到 `http://localhost:<单个端口>`,不要图省事映射整个网段或本机 IP
- **本机不是服务器。** 那个端口后面跑的进程有你用户的全部权限,同一台机器上还有你的代码、密钥、浏览器数据。伺服的必须是构建产物目录,不是项目根
- **地址会被扫。** 隧道服务商的域名段是公开的,`*.trycloudflare.com` 从 2024 年起已被大规模用于钓鱼与木马投递——这也导致部分企业网关会整域拦截它。你把链接发给同事打不开,原因可能不是 GFW 而是对方公司的安全设备
- **共享主域有连坐风险。** 免费档所有人挤在同一个主域下靠前缀区分,别人拿它干了什么你就得跟着承担。`pages.dev` 与 `workers.dev` 整域被封就是现实案例

## 它不是托管,是 stage 环境

隧道最容易被误解成"一种更省钱的托管"。其实它在真实开发流程里对应的是另一个东西:**stage / 预览环境**。

给同事看一眼刚改完的页面、把链接发给客户验收、让设计师在自己手机上点一遍——这些场景本来就是**临时的**,用完就撤。没有人指望 stage 环境 7×24 在线,也没有人会因为它半夜打不开而报 bug。

想通这一层,这一档所有"限制"就都不是限制了:

- 地址随机、重启就换 → stage 链接本来就是一次性的
- 本机关机就离线 → 你下班了,本来也不需要有人访问
- 免费档有配额 → 给三五个人看,配额绰绰有余

**所以本项目的画廊不收隧道站作常驻站点。** 「已上线站点」表里只放真正 7×24 的站;隧道档在三档表里只说明"有这么一条路、它能干什么",不挂链接。打不开是这条路的结构性性质,把它讲清楚就是教学内容,拿它去糊一个假的常驻链接才是骗人。

对应到机器上,`site.yaml` 有两根正交的轴:

| 字段 | 含义 | 谁改它 |
|---|---|---|
| `status` | 生命周期:`draft` / `building` / `live` / `archived` | 人工推进 |
| `availability` | 运行时可达性:`always` / `best-effort` | 由部署方式决定 |

隧道站标 `availability: best-effort`,这就是画廊把它排除在常驻列表之外的依据——不靠人记得。这一对组合由 `golive check` 双向强制:

```bash
$ npx golive check
✗ [<站名>] 隧道档站点必须标 availability: best-effort(本机不在线站点即离线),当前为 always
✗ [<站名>] cloudflare-pages 是平台托管,不该标 availability: best-effort——它与本机开关机无关
```

`golive list` 会把它渲染成 `🔌 按需在线`。**规矩要能用一条命令查它有没有被违反**,否则就只是墙上的标语。

---

**示范站**:[Denta](../../../sites/denta) —— 一个虚构牙科问诊 App 的落地页,中间把 app 的三块真实界面装进手机框摆出来。走 cpolar,绑 `denta.<BASE_DOMAIN>`。

它不在「已上线站点」表里,也不给常驻链接:它跑在作者本机的 `localhost:4173` 上,机器关了就打不开。完整实战(含壳与芯分离的拼装法、Tailwind preflight 钳掉超宽底图那个坑)见 [Denta 实战](../../sites/denta.md)。
