# 自定义域名与 Cloudflare 解析

> 目标:买一个自己的域名,把解析托管到 Cloudflare,免费拿到边缘 HTTPS。
> 本篇是本项目的正式域名架构:**注册商(腾讯云)+ 解析商(Cloudflare)分离**——先读[模型一](../00-basics/README.md)理解为什么可以分离。

## 为什么解析放 Cloudflare

- **免费 Universal SSL**:域名一激活,CF 自动给根域和一级子域签发边缘证书,零配置零续期
- **橙云代理**:访客 → CF 边缘(HTTPS)→ 源站,源站是什么、证书好不好,访客无感
- **给后面铺路**:本项目的内网穿透档要用 Cloudflare Tunnel,它要求域名 NS 托管在 CF——现在切,一劳永逸

## 一、买域名(以腾讯云为例)

搜"域名注册"→ 选中意的名字下单。三件事提前知道:

1. **实名认证 + 命名审核**:国内注册商的合规流程,提交后等审核通过(几小时到一两天),期间解析可能不生效
2. **后缀选择**:如果将来可能上大陆服务器(要 ICP 备案),先查后缀在不在工信部核准名录里——不在名录的后缀备不了案
3. 域名到手后,注册商默认用自家解析(腾讯云 → DNSPod)。可以先在 DNSPod 加记录把站跑通,解析商以后随时换

## 二、Cloudflare 添加站点

[dash.cloudflare.com](https://dash.cloudflare.com) → **Add a domain** → 输入域名 → 选 **Free** 计划。要点:

- 引导页的 AI 抓取策略等选项保持默认即可
- **免费版的自动扫描经常漏记录**("Records we found: 0" 很常见)——对照旧解析商的记录列表,手动补齐。本项目要补的就一条:

| Type | Name | Target | Proxy status |
|---|---|---|---|
| CNAME | `dreamcore` | `<用户名>.github.io` | **橙色云朵(Proxied)** |

- **橙云 vs 灰云**:橙云 = 流量经 CF 代理,HTTPS、缓存、防护都在这层;灰云 = CF 只做解析,流量直连源站。要 CF 的免费 HTTPS,必须橙云
- 最后 CF 给你两条专属 NS(形如 `xxx.ns.cloudflare.com`),抄下来进入下一步

## 三、改 NS:入口在哪(实测踩坑)

**这是最容易走错门的一步。**腾讯云有两个长得很像的控制台:

- ❌ **DNSPod 控制台 / 记录管理**——这里管"解析成什么"(加 A/CNAME 记录的地方),**改不了 NS**
- ✅ **域名注册控制台**(`console.cloud.tencent.com/domain`)→ 我的域名 → 该域名「**管理**」→ 「DNS 解析」卡片 → **修改 DNS 服务器** → 选「**使用非腾讯云 DNS**」→ 填入 CF 的两条 NS → 提交

一句话记住区别:**记录页管"解析成什么",域名管理页管"由谁解析"**;换解析商改的是后者。

弹窗会警告"24~48 小时生效",这是最保守的免责口径,实测主流解析器几分钟到几小时就切换。

**零停机迁移的顺序纪律**(先修路后改道):

1. 先在 CF 把所有记录建好(第二步)
2. 再去注册商切 NS(本步)
3. 切换期间新旧解析商各自都能给出正确答案,访客走哪边都能到站——**旧解析商的记录先别删**,等全球缓存收敛后再清理

提交后回 CF 点 **"I updated my nameservers"**,等 zone 显示 Active("Your domain is now protected by Cloudflare")。

## 四、SSL 与生效核验

SSL/TLS 模式保持默认(Automatic)即可,CF 会探测源站自动选择。两条规则备着:

- 访问报 **525/526** → SSL/TLS → Overview 改成 **Flexible**(CF 到源站走 HTTP)
- 用 Flexible 时,**源站侧的"强制 HTTPS"必须保持关闭**——否则源站把 HTTP 请求 301 回 HTTPS,CF 又用 HTTP 回源,无限循环。这是"Cloudflare + 托管平台"组合最著名的坑,记住成因就不会踩

核验从权威到本机逐层看(命令详解见[模型三](../00-basics/README.md)):

```bash
whois <你的域名> | grep -i 'name server'        # ① 注册局已登记 CF 的 NS?
dig +short NS <你的域名> @8.8.8.8               # ② 公共解析器切过来了吗
dig +short dreamcore.<你的域名> @8.8.8.8        # ③ 应返回 CF 代理 IP(104.x/172.x),不再是源站 IP
curl -s -o /dev/null -w '%{http_code}\n' --compressed https://dreamcore.<你的域名>/   # ④ 端到端 200
```

## 五、缓存心法:改完"没生效",九成不是坏了

DNS 是层层缓存的系统,每一层各有各的过期钟:

| 层 | 谁在缓存 | 大概多久 |
|---|---|---|
| 浏览器 | Chrome/Safari 自带 DNS 缓存 | 分钟级,但重启前可能一直抱着旧值 |
| 操作系统 | mDNSResponder 等 | 跟随记录 TTL |
| 递归解析器 | 运营商 / 8.8.8.8 / 119.29.29.29 | 记录 TTL(常见 600s);**NS 记录 TTL 常是 24h** |
| CDN 边缘 | Cloudflare/Fastly 的响应缓存 | 按响应头,且**按 Accept-Encoding 分桶**——curl 不带 `--compressed` 时探到的可能和浏览器不是同一份缓存 |

由此得出的行为准则:

1. **等待是操作的一部分。**注册局查询(`dig @a.nic.art`)显示已生效、公共解析器还是旧值——什么都不用做,泡杯茶
2. 层与层结论矛盾时(手机能开、电脑打不开;curl 200、浏览器 404),**先怀疑缓存分层,不要急着改配置**——每改一次配置,又制造一批新缓存
3. 只有本机能主动清:`sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`(macOS),Chrome 再开 `chrome://net-internals/#dns` → Clear host cache;手机开关一次飞行模式
4. 国内网络访问 CF 偶见 **ERR_QUIC_PROTOCOL_ERROR**:UDP 443 被干扰所致,CF 后台 **Network → HTTP/3 (with QUIC) 关闭**即可,走 HTTP/2 无感

---

**学会原理后**:本仓库的 DNS 记录登记在 [`infra/dns/records.md`](../../../infra/dns/records.md)(声明式对账清单,改 DNS 前先改它)。
