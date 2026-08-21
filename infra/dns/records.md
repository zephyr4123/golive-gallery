# <BASE_DOMAIN> DNS 记录登记(声明式对账清单)

> DNS 托管:Cloudflare(NS 已从注册商默认切换;注册商不变)。本表是唯一登记处,改 DNS 前先改这里,再对照控制台执行。
> 经验:GitHub Pages 自定义域名证书签发卡死时,NS 切 Cloudflare + 橙云代理是十分钟级的绕行方案;国内访客建议顺手关闭 zone 的 HTTP/3(UDP 443 干扰会报 QUIC 错误)。
> 各站子域名以 `sites/*/site.yaml` 的 `subdomain` 字段为准,此表登记解析去向。

| 子域名 | 类型 | 指向 | 用途 | 状态 |
|---|---|---|---|---|
| `<BASE_DOMAIN>` | — | (画廊主站,待定) | 展厅入口 | 未配置 |
| `dreamcore` | CNAME | `zephyr4123.github.io`(CF 橙云代理) | GitHub Pages 示范(Reverie) | ✅ 已生效(HTTPS 经 CF) |
