# Cloudflare Tunnel(cloudflared):零凭据的最短一条路

> **本篇只讲 Quick Tunnel** —— 不用账号、不用域名、一条命令就有公网地址。它是这一档里门槛最低的入口,也是把「隧道到底是怎么回事」讲清楚的最好样例。
>
> Named Tunnel(绑 `<SUBDOMAIN>.<BASE_DOMAIN>` 那条)**本项目还没做,所以本篇不写**——见文末[为什么这里断在这儿](#为什么本篇到此为止)。
>
> 全篇输出实拍于 2026-08-22,cloudflared `2026.8.2` / macOS arm64。命令都是真跑过的,日志是原样贴的。

## 原理一句话

你本机的 `cloudflared` **主动**向 Cloudflare 边缘打一条长连接,访客的请求从边缘顺着这条连接倒灌回你的机器。**没有任何入站端口被打开**——所以家里的路由器不用配端口映射,公司的 NAT 也不构成障碍。

代价也来自同一件事:那条连接是你的进程维持的,**进程停了,公网地址立刻失效**。

## 一、装上,跑一条

```bash
brew install cloudflared
cloudflared --version
# => cloudflared version 2026.8.2 (built 2026-08-14T11:22:52Z)
```

先在本机起一个服务(本项目用 `sites/denta` 的构建产物):

```bash
cd sites/denta && npm ci && npm run build
npm run preview -- --port 4173 --strictPort
```

然后另开一个终端:

```bash
cloudflared tunnel --url http://localhost:4173
```

就这一条。**不需要注册、不需要登录、不需要域名**——跑完全程 `~/.cloudflared/` 目录都不会被创建,机器上不留任何凭据。

## 二、读懂启动日志

第一次跑会刷出一屏,值得逐段看,因为它把这条路的性质全说了。

**开头是一段免责声明**,它自己就把定位讲明白了:

```
INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account,
    is a quick way to experiment and try it out. However, be aware that these
    account-less Tunnels have no uptime guarantee ...
    If you intend to use Tunnels in production you should use a pre-created named tunnel
```

**接着是你要的地址**:

```
INF Requesting new quick Tunnel on trycloudflare.com...
INF +----------------------------------------------------------------------+
INF |  Your quick Tunnel has been created! Visit it at                     |
INF |  https://consumers-alert-sacred-wars.trycloudflare.com               |
INF +----------------------------------------------------------------------+
```

这个三词随机子域**每次重启都换**。实测同一台机器先后起两条,拿到的是 `consumers-alert-sacred-wars` 和 `cst-okay-design-martin`,毫无关系。所以它只适合「现在发给某人看一眼」,不适合写进任何文档或截图。

**然后是一行经常被误读的提示**:

```
INF Cannot determine default configuration path.
    No file [config.yml config.yaml] in [~/.cloudflared ~/.cloudflare-warp ...]
```

这不是错误。Quick Tunnel 本来就不读配置文件,它只是把找过的路径都报一遍。顺带记住这份清单——将来配置文件「改了没生效」时,先对照它确认自己改的是不是这几个位置之一。

**再往下是它选的协议**:

```
INF Settings: map[ha-connections:1 protocol:quic url:http://localhost:4173]
INF Initial protocol quic
```

`quic` 走 UDP 7844。**别写死 `--protocol quic`**:官方明确说 UDP 被阻断时会自动回退到 HTTP/2 over TCP,但你手动强制了它就只会失败。什么都不指定是最稳的。

**最后一段是自检表**,这是 cloudflared 最贴心的设计:

```
+-------------------------------------------------------------------------------------+
|                               CONNECTIVITY PRE-CHECKS                               |
+-------------------------------------------------------------------------------------+
|  COMPONENT         TARGET                     STATUS  DETAILS                       |
|  DNS Resolution    region1.v2.argotunnel.com  PASS    DNS Resolved successfully     |
|  UDP Connectivity  region1.v2.argotunnel.com  PASS    QUIC connection successful    |
|  TCP Connectivity  region1.v2.argotunnel.com  PASS    HTTP/2 connection successful  |
|  Cloudflare API    api.cloudflare.com:443     PASS    API is reachable              |
|  SUMMARY: Environment is healthy. cloudflared will use 'quic' as primary protocol.  |
+-------------------------------------------------------------------------------------+
```

**排查网络问题先看这张表**,不用自己 dig 和 tcping。UDP 那两行 FAIL、TCP 那两行 PASS,就说明你的网络丢 UDP,它会自己降级走 HTTP/2——这时候站点照样能用,只是协议不同。

## 三、两个必配项,不配就是「隧道通了但打不开」

这两条与 Cloudflare 无关,是 Vite 那头的事,但每次都会撞上。

### 1. `preview.allowedHosts` 要放行隧道域名

隧道显示已连接,访客却拿到一段纯文本:

```
$ curl -D- https://consumers-alert-sacred-wars.trycloudflare.com/
HTTP/2 403
content-type: text/plain
cf-ray: a2ef12ef3c348408-SIN
server: cloudflare

Blocked request. This host ("consumers-alert-sacred-wars.trycloudflare.com") is not allowed.
To allow this host, add "consumers-alert-sacred-wars.trycloudflare.com" to `preview.allowedHosts` in vite.config.js.
```

注意 `content-type: text/plain` 和那段 body:**这个 403 是 Vite 发的,不是 Cloudflare 拦的**(`server: cloudflare` 只说明它经过了边缘)。所以看到它反而是好消息——隧道是通的,断在最后一跳。

写进站点的 `vite.config.ts`:

```ts
export default defineConfig({
  preview: {
    // 以点开头是后缀通配,一次覆盖该服务商所有随机子域
    allowedHosts: ['.trycloudflare.com'],
  },
})
```

改完重启 `vite preview`,同一条隧道立刻从 403 变 200 并返回站点自己的 HTML。实测有效。

### 2. 回源地址写 `localhost`,不能写 `127.0.0.1`

`vite preview` 启动时打印 `Local: http://localhost:4173/`,看着人畜无害,实际只监听 IPv6 回环:

```bash
$ lsof -nP -iTCP:4173 -sTCP:LISTEN
node  17074  ...  TCP [::1]:4173 (LISTEN)

$ curl -o /dev/null -w '%{http_code}' http://localhost:4173/   # 200
$ curl -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/   # 000  连不上
```

同一台机器、同一个端口、同一时刻,起两条隧道只差回源地址:

| `--url` | 隧道自身状态 | 访客拿到 |
|---|---|---|
| `http://localhost:4173` | `Registered tunnel connection` | ✅ 200 |
| `http://127.0.0.1:4173` | `Registered tunnel connection` | ❌ 502 Bad gateway |

两条都报「已注册」。第二条的错在日志里:

```
ERR Unable to reach the origin service. The service may be down or it may not be
    responding to traffic from cloudflared: dial tcp 127.0.0.1:4173: connect: connection refused
```

### 顺带:启动一定带 `--strictPort`

不带的时候端口被占,Vite 会**静默换一个端口**继续跑,只在日志里留一行:

```
Port 4173 is in use, trying another one...
  ➜  Local:   http://localhost:4174/
```

而隧道那头还指着 4173——于是你得到一个连得上却永远 502 的隧道。带上之后它当场退出,失败得响亮:

```
error when starting preview server:
Error: Port 4173 is already in use
```

## 四、验证

cloudflared 自带一个**只监听本地**的 metrics 端点,端口在启动日志里(`Starting metrics server on 127.0.0.1:20241/metrics`;再起一条会自动递增到 20242)。

```bash
# 隧道到边缘的连接活着吗
curl -s http://127.0.0.1:20241/ready
# => {"status":200,"readyConnections":1,"connectorId":"33d97e25-..."}

# 连到了哪个边缘节点、接过多少请求
curl -s http://127.0.0.1:20241/metrics | grep -E '^cloudflared_tunnel_(ha_connections|server_locations|total_requests)'
# => cloudflared_tunnel_ha_connections 1
# => cloudflared_tunnel_server_locations{connection_id="0",edge_location="sin07"} 1
# => cloudflared_tunnel_total_requests 5
```

**`readyConnections` 大于 0 就说明隧道这一侧没问题**——此时访客仍打不开,问题一定在回源那一跳,不必再去怀疑网络。

端到端:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<你的随机子域>.trycloudflare.com/
```

再用浏览器真开一遍。实测带正常浏览器 UA 请求**直接返回站点自己的 HTML,没有任何警告插页**(ngrok 免费档有,这里没有)。

## 五、失败长什么样:403 / 502 / 530

三跳三种长相,同一条隧道上逐个测出来的:

| 现象 | 断在哪 | 下一步 |
|---|---|---|
| `403` + `Blocked request. This host ... is not allowed` | 最后一跳:本地服务不认这个 Host | 隧道是通的,去配 `allowedHosts` |
| `502 Bad gateway`(Cloudflare 品牌页,`retry-after: 60`) | 中间一跳:隧道在,回源连不上 | 看 cloudflared 日志的 `Unable to reach the origin service`——本地服务挂了,或回源写了 `127.0.0.1` |
| `530`,页面标题 `Cloudflare Tunnel error` | 第一跳:隧道进程本身没了 | **这就是你合上电脑之后访客看到的那一页** |

530 那条值得多说一句:进程杀掉之后 DNS **仍然正常解析**(实测 `dig` 到 `104.16.230.132`),所以别往「域名坏了」的方向查。

## 硬限制与边界

以下是官方文档口径(核于 2026-08-22),不是本项目实测:

- **官方定位就是临时**:「Quick Tunnels are intended for testing and development only」「We don't guarantee any SLA or uptime of TryCloudflare」
- **并发 200 个 in-flight 请求封顶**,超了返 `429`
- **不支持 Server-Sent Events**
- **随机子域无法保留**,进程生命周期即链接寿命
- 🔴 **`*.trycloudflare.com` 从 2024 年起被大规模用于钓鱼与木马投递**,后果是不少企业出口网关、邮件网关、终端安全软件已经把这个域整段拉黑。**你把链接发给同事或客户打不开,很可能不是网络问题,是对方公司的安全设备**——这对「发给别人看」这个核心用途是决定性的,比 200 并发上限更常撞到

另外两条版本相关的坑,抄旧教程会直接报错:

- `2026.2.0` 彻底删除了 `proxy-dns`(命令、`--proxy-dns*` 全部 flag、配置文件的 `resolver` 段)
- `2026.4.0` 把 `--edge-ip-version` 默认值从 `4` 改成 `auto`;只能走 IPv4 的环境要显式加 `--edge-ip-version 4`

## 为什么本篇到此为止

Named Tunnel(`cloudflared tunnel create` + `tunnel route dns`,绑自有子域名、地址固定、有 SLA)本项目**还没跑过**,所以这里不写。

这不是遗漏,是本项目的一条规矩:**只有做完了才写文档**。没做就写出来的步骤,读者照着走一定会在某个没预料到的地方卡住,而作者不知道卡在哪——那比没有文档更糟。

Named Tunnel 至少还有这些没验证过的东西:浏览器 OAuth 授权流、`~/.cloudflared/<UUID>.json` 凭据文件、`tunnel route dns` 写记录的实际行为、Universal SSL 只覆盖一级子域这条限制在隧道场景怎么表现、macOS 上 `service install` 带不带 `sudo` 装出来的是 launch daemon 还是 launch agent。真跑一遍之后再补。

## 学会原理后,一条命令搞定

```bash
npx golive tunnel denta
```

它打印前置检查与启动步骤,与本篇正文一一对应。注意隧道站**不走** `golive deploy`——`deploy` 是一次性发布动作,隧道是本机长驻进程,`golive deploy` 会把它挡回来并 exit 1。

一键启动目前**尚未实现**(骨架阶段),命令只打印步骤,还是要你手动执行。
