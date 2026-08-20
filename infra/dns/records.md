# <BASE_DOMAIN> DNS 记录登记(声明式对账清单)

> DNS 托管:填你自己的 DNS 服务商(若启用 Cloudflare Tunnel,域名 NS 须托管在 Cloudflare)。本表是唯一登记处,改 DNS 前先改这里,再对照控制台执行。
> 各站子域名以 `sites/*/site.yaml` 的 `subdomain` 字段为准,此表登记解析去向。

| 子域名 | 类型 | 指向 | 用途 | 状态 |
|---|---|---|---|---|
| `<BASE_DOMAIN>` | — | (画廊主站,待定) | 展厅入口 | 未配置 |
| `hello` | CNAME | `<user>.github.io` | GitHub Pages 示范 | 未配置 |
