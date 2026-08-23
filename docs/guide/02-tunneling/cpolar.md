# cpolar:第一条真正挂上自有域名的隧道

> [cloudflared 篇](cloudflared.md)只做到了随机地址的冒烟。这一篇把 `denta.<BASE_DOMAIN>` 真接到了本机的 `localhost:4173` 上——**本档第一条端到端跑通、有自己域名、有 HTTPS 的隧道**。
>
> 全篇输出实拍于 2026-08-23,cpolar `3.3.18`(Homebrew 装)/ macOS arm64 / Vite 7.3.6 / 专业版账号。命令都是真跑过的,日志是原样贴的。
>
> 实拍块里保留了本项目示范实例的真实域名(它本来就是公开的);要你自己替换的地方一律写成 `<SUBDOMAIN>.<BASE_DOMAIN>` 占位符。
>
> 📖 需要先懂的:[08 内网穿透的原理](../../basics/08-tunneling.md)、[06 HTTPS 与证书](../../basics/06-https-and-certificates.md)(尤其是三种证书那一节)、[07 Cloudflare 是什么](../../basics/07-cloudflare.md)(橙云与加密模式)。

## 原理一句话

和所有隧道一样:你的机器主动打一条长连接到 cpolar 的边缘节点,访客访问那个节点,请求顺着连接回到你的 `localhost`。

和 cloudflared 的差别只在**谁提供域名和证书**:

| | cloudflared | cpolar |
|---|---|---|
| 免费拿到的地址 | 随机 `*.trycloudflare.com` | 随机二级域名,**官方明写 24 小时内会变** |
| 绑自有域名 | 免费 | **专业版起**(149 元/年) |
| 自有域名的 HTTPS | 自动 | 🔴 **要你自己提供证书** |
| 边缘节点 | 全球 Cloudflare | 可选大陆 / 香港 / 美国 / 台湾 / 欧洲 |

最后那两行是这一篇的全部难点。

## 零、先知道这一条,不然会白折腾半天

🔴 **cpolar 不给你的自有域名签发证书,也不续期。**

"绑上域名就有 https"只适用于它自家的 `*.cpolar.cn` / `*.cpolar.top`(那些域名它自己备了案、自己管证书)。换成你的域名,**你不给证书,那个域名的 443 端口就是死的**。

不给证书时,直接连边缘节点的 443 是这样:

```
$ echo | openssl s_client -connect 47.239.190.186:443 -servername denta.golive-gallery.art
CONNECTED(00000003)
no peer certificate available
Verify return code: 0 (ok)
```

TCP 连得上,TLS 握手一开始就断,**连一张错误的证书都没有**。

同一时刻 80 端口却是好的:

```
$ curl -s -o /dev/null -w "code=%{http_code} size=%{size_download}\n" \
    --resolve denta.golive-gallery.art:80:47.239.190.186 \
    http://denta.golive-gallery.art/
code=200 size=2996
```

> `curl --resolve` 的作用是**绕过 DNS,直接指定这个域名连哪个 IP**。DNS 还没配好的时候用它单独验证后半段链路,是这一篇反复用到的手法——它能把"域名没配好"和"隧道没通"这两件事彻底分开。

这一条决定了后面所有的选择,所以放在最前面。

## 一、装上,先跑一条随机地址的

免费档就能跑通全套机制,先用它把手感建立起来。

```bash
brew install cpolar          # macOS;其它平台见官网
cpolar version
# => cpolar version 3.3.18
```

去官网注册拿到 authtoken(**要实名**,「国内只有 cpolar 不用实名」是 2022–2023 年的旧说法,它自己的服务条款已经写明要实名),然后写进本机:

```bash
cpolar authtoken <你的TOKEN>
```

先把要伺服的东西跑起来,再起隧道:

```bash
cd sites/<你的站> && npm ci && npm run build
npm run preview -- --port 4173 --strictPort
```

另开一个终端:

```bash
cpolar http 4173
```

实拍拿到的地址:

```
https://78f1f149.r33.cpolar.top
```

浏览器打开——**页面完整渲染,没有任何警告插页**,ZeroSSL 的泛域名证书自动带上,大陆本机访问 0.57–1.28s。

⚠️ 这个地址**官方明写 24 小时内会变**,不重启也变。它只适合"现在给人看一眼"。

## 二、绑自有域名:四步

### 2.1 后台保留域名 —— 地区在这一步就定死了

登录 cpolar 后台(本机 `http://127.0.0.1:9200` 或官网),**预留 → 保留自定义域名**:

- 地区:未备案域名选**境外**(Hong Kong VIP / United States / 台湾 / 欧洲)。本项目实测选的 **Hong Kong VIP**
- 域名:填完整的 `<SUBDOMAIN>.<BASE_DOMAIN>`

保存后它会给你一个 CNAME 值,实拍:

```
域名:denta.golive-gallery.art 现已保留给您的帐户!
要使用该域名,请在您的 DNS 服务器里添加一条 CNAME 记录,
填写主机名:denta.golive-gallery.art,记录值:10050a4c.cname.vip.hk.cpolar.io
```

这个值**每个人不一样**,以你后台显示的为准。

它解析到哪,可以自己查:

```bash
$ dig +short 10050a4c.cname.vip.hk.cpolar.io
47.239.190.186
$ curl -s https://ipinfo.io/47.239.190.186/json | grep -E '"city"|"org"'
  "city": "Hong Kong",
  "org": "AS45102 Alibaba (US) Technology Co., Ltd."
```

香港、阿里云。**未备案域名走境外节点这条路径,到这里已经被实证走得通。**

> 🔴 **「地区」只在这一步有意义。** 你在这里选的地区决定了系统发给你的 CNAME 指向哪个节点,也就决定了公网路径。启动隧道时的 `-region` 参数是另一回事,详见[后面的订正一节](#三条要订正的-region-口径)。

### 2.2 准备证书

zone 的加密模式停在 **Full** 的话(见 [07 篇](../../basics/07-cloudflare.md)),Cloudflare **不校验源站证书**,一张自签名的就够:

```bash
mkdir -p ~/.cpolar/certs && chmod 700 ~/.cpolar/certs
openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout ~/.cpolar/certs/<SITE>.key \
  -out    ~/.cpolar/certs/<SITE>.crt \
  -subj "/CN=<SUBDOMAIN>.<BASE_DOMAIN>" \
  -addext "subjectAltName=DNS:<SUBDOMAIN>.<BASE_DOMAIN>"
chmod 600 ~/.cpolar/certs/<SITE>.key
```

访客校验的是 Cloudflare 边缘那张公信证书,这张自签名的只服务于 CF 到 cpolar 那一跳,**访客永远看不到它**。

🔴 **私钥绝不进版本库。** 放本机、目录 700、私钥 600。本项目仓库里一个字节的私钥都没有。

⚠️ **这个方案成立的前提是「前面挡着一层不校验源站的代理」。** 灰云直连、或者 zone 改成 Full (strict),这张自签名立刻不够用。

### 2.3 加 DNS 记录

在 Cloudflare 的 **DNS → Records → Add record**:

| 字段 | 填什么 |
|---|---|
| Type | `CNAME` |
| Name | `<SUBDOMAIN>`(只填这一段,CF 自动补全) |
| Target | 后台给你的那个 `xxx.cname.vip.hk.cpolar.io` |
| Proxy status | 🟠 **Proxied,必须开** |
| TTL | Auto |

橙云必须开,因为**访客的 HTTPS 是 Cloudflare 边缘给的**。关掉橙云访客就直连 cpolar 节点,那边只有你那张自签名证书,浏览器立刻报错。

同时确认 **SSL/TLS → Overview** 的加密模式是 **Full**。🔴 **这一项是 zone 级的,一改影响该域名下所有站——先看,别急着改。**

### 2.4 起隧道

```bash
cpolar http 4173 -hostname=<SUBDOMAIN>.<BASE_DOMAIN> \
  -crt=$HOME/.cpolar/certs/<SITE>.crt \
  -key=$HOME/.cpolar/certs/<SITE>.key
```

日志里出现这两行就是成了:

```
level=info msg="[:tunnel server module] Tunnel established at http://denta.golive-gallery.art"
level=info msg="[:tunnel server module] Tunnel established at https://denta.golive-gallery.art"
```

## 三、写进配置文件,别靠背命令

上面那条命令又长又容易敲错。cpolar 支持把隧道写进配置文件,之后一条短命令启动。

配置文件是 **`~/.cpolar/cpolar.yml`**。

> ⚠️ 官方文档说服务化之后会改读 `/usr/local/etc/cpolar/cpolar.yml`,**实测不是**:无论前台还是 launchd 下的 service,日志第一行都写 `Reading configuration file ~/.cpolar/cpolar.yml`,`cpolar http --help` 里 `-config` 的默认值也是它。

在 `tunnels:` 块里加一条(模板见 [`infra/tunnel/cpolar.example.yml`](../../../infra/tunnel/cpolar.example.yml)):

```yaml
tunnels:
  <SITE>:
    proto: http
    addr: "4173"
    hostname: <SUBDOMAIN>.<BASE_DOMAIN>
    crt: /Users/<你>/.cpolar/certs/<SITE>.crt
    key: /Users/<你>/.cpolar/certs/<SITE>.key
```

⚠️ **两个实测坑,都会让你以为是自己写错了:**

**一、cpolar 的 service 会改写这个文件。** 它自动往每条隧道里补 `id` / `bind_tls` / `start_type`,还会在文件**末尾**追加一行 `email:`。手工追加隧道时很容易写到 `tunnels:` 块外面去,得到一个莫名其妙的 YAML 报错。

**二、`cpolar list` 是最快的校验器。** 写坏了它直接报错误行号:

```
$ cpolar list
Errorf parsing configuration file ~/.cpolar/cpolar.yml: yaml: line 16: mapping values are not allowed in this context
```

写对了就列出所有隧道名:

```
$ cpolar list
website
denta
ssh
```

**改完配置一律先跑一次 `cpolar list`。**

然后启动:

```bash
cpolar start <SITE>       # 只起这一条
cpolar start-all          # 起配置里的全部
```

⚠️ 优先用 `cpolar start <名字>`。`start-all` 会把配置里所有隧道一起拉起来——包括 cpolar 默认模板自带的 `ssh` 和 `website` 两条,直接吃掉你的并发配额。

## 四、验证

分三层验,每层单独可判:

```bash
# ① 源站活着吗
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/
# => 200

# ② 绕过 DNS,单独验隧道那一段(把 IP 换成你 CNAME 目标解析出的那个)
curl -s -o /dev/null -w "%{http_code}\n" \
  --resolve <SUBDOMAIN>.<BASE_DOMAIN>:80:<边缘IP> http://<SUBDOMAIN>.<BASE_DOMAIN>/
# => 200

# ③ 全链路
curl -sI https://<SUBDOMAIN>.<BASE_DOMAIN>/ | head -3
```

实拍:

```
HTTP/2 200
content-type: text/html
server: cloudflare
cf-ray: a2f7658e0d62ff89-SIN
```

`server: cloudflare` 说明经过了 CF 边缘,`cf-ray` 尾巴的 `SIN` 是接待的边缘节点(新加坡)。大陆本机实测 **0.58–0.70s**。

**别只验首页。** 一个网页是一堆文件([01 篇](../../basics/01-how-the-web-works.md)),首页 200 但资源 404 的话你看到的是白板:

```bash
for a in $(curl -s https://<SUBDOMAIN>.<BASE_DOMAIN>/ | grep -oE '/assets/[^"]+' | sort -u); do
  printf "%-46s " "$a"; curl -s -o /dev/null -w "%{http_code}\n" "https://<SUBDOMAIN>.<BASE_DOMAIN>$a"
done
# => /assets/index-5TJ8J1MI.js    200
# => /assets/index-wqoXrgw6.css   200
```

## 五、失败长什么样

隧道的三跳失败长相在 [02 档导读](README.md#出问题时先看状态码是哪一层发的)里,这里补 cpolar + Cloudflare 这条链路特有的:

| 现象 | 断在哪 | 怎么确认 |
|---|---|---|
| `no peer certificate available` | 你没给 cpolar 证书 | 见[第零节](#零先知道这一条不然会白折腾半天) |
| Cloudflare `525` / `526` | CF 到源站的 TLS 失败 | 证书没给,或 zone 是 Full (strict) 而你用的是自签名 |
| `ERR_TOO_MANY_REDIRECTS` | zone 是 Flexible,源站又强制跳 HTTPS | 改回 Full |
| `403` + `Blocked request. This host ... is not allowed` | 最后一跳:`vite preview` 不认这个 Host | 隧道其实是通的,去配 `allowedHosts` |
| `502` | 隧道在,回源连不上 | 源站挂了,或回源写了 `127.0.0.1` 而不是 `localhost` |

### ⚠️ 两个会让你怀疑人生的非故障

**一、CF 新 DNS 记录约 2.5 分钟才收敛。** 实拍轮询到第 14 次(约 2 分 48 秒)才解析出来。更吓人的是收敛期间的现象:同一台 Cloudflare 权威服务器,查小写 `denta` 返回 NXDOMAIN、查 `Denta` 却正常返回——两个应答里的 zone serial 不同(`2412869427` vs `2412942876`),是**边缘新旧配置版本并存**。**不是你配错了,等就行。**

**二、macOS 会把"域名不存在"也缓存下来。** 症状极具迷惑性:**全世界都能打开,就你自己这台不行**。

```
$ dig +short denta.golive-gallery.art @1.1.1.1
172.67.184.251
104.21.92.19                      ← 全球 DNS 正常

$ curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://denta.golive-gallery.art/
000 0.001314s                     ← 本机 1 毫秒就失败,快得不像超时
```

`dscacheutil` 一查,A 记录被负缓存吃掉了,只剩两条 IPv6。解药:

```bash
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder
```

**养成习惯:记录还没配好之前,别反复去查那个域名**——每查一次都在给自己种一颗负缓存。

**排查次序:先 `lsof` 查端口占用是无效的**——service 以 root 跑时,普通用户 `lsof` **看不到它的监听端口**。实测 dashboard 明明在 9200 上服务(日志白纸黑字写着),`lsof -iTCP:9200` 查不到任何东西,`curl` 一试就是 200。**直接 curl 比 lsof 可靠。**

## 三条要订正的 region 口径

这三条在中文教程里几乎人人都写,本项目真绑一次自有域名之后**实测全部不成立**。写在这里是因为它们会让你在完全没问题的地方反复折腾。

**❌「region 必须显式写,留空会落到默认的大陆节点 cn_top,强制备案」**

实测:带 `-hostname` 但**不带** `-region`,隧道正常建立、全链路 200。

**❌「后台预留的地区必须和启动参数里的 region 一致,否则隧道起不来」**

实测:保留地区是 `hk`,启动时显式写 `-region=us`,**照样 200**。

**✅ 正确的模型**:地区在「保留自定义域名」那一步就定死了,它决定系统发给你的 CNAME 指向哪个节点,也就决定了公网路径。启动时的 `-region` 只决定**你的客户端连哪台 cpolar 服务器**,与访客走的路径无关。

**❌「服务化之后配置文件在 `/usr/local/etc/cpolar/cpolar.yml`」**

实测:始终是 `~/.cpolar/cpolar.yml`,日志第一行和 `-config` 的默认值都指向它。

## 硬限制与边界

- **绑自有域名需专业版及以上**(149 元/年)。基础版只给固定二级子域名——这一条本项目没有反证过,是官方口径
- **并发进程有配额**。专业版实测 2 个:service 占一个、前台隧道占一个,正好用满。想再起一条必须先停一条
- **`cpolar.yml` 第一行是 authtoken**。🔴 别把这个文件原文贴进教程、截图或 issue
- **实名认证是强制的**
- 免费档带宽 1 Mbps、不限流量;地址 24 小时内会变

## 为什么本篇到此为止

以下几条本项目**还没跑过,所以不写**——这是本项目的规矩:[只有做完了才写文档](README.md)。没做就写出来的步骤,读者照着走一定会在某个没预料到的地方卡住,而作者不知道卡在哪。

| 没做的 | 为什么想做 | 要验证什么 |
|---|---|---|
| **不经 Cloudflare 的路线** | 你的域名可能托管在别处 | 访客会直连 cpolar 节点,那就必须换一张**公信证书**(Let's Encrypt)。签发方式、90 天续期怎么自动化,全都没验过 |
| **Cloudflare Origin CA 证书** | 免费 15 年,Full 与 Full (strict) 都能过,比自签名更 future-proof | 面板签发流程、cpolar 那边认不认它 |
| **Full (strict) 模式** | 更安全 | 自签名在这个模式下必挂,得先换证书 |
| **`cpolar service` 常驻自有域名隧道** | 现在是前台进程,关终端就没 | service 目前跑的还是默认的 ssh / website 两条。把 denta 交给 service 会撞配额,得先清掉默认那两条,没试过 |
| **基础版的实际边界** | 想确认"专业版起"这条 | 手上只有专业版账号 |

## 学会原理后,一条命令搞定

```bash
npx golive tunnel <SITE>
```

它打印前置检查与启动步骤,与本篇正文一一对应。隧道站**不走** `golive deploy`——`deploy` 是一次性发布动作,隧道是本机长驻进程。

一键启动目前**尚未实现**(骨架阶段),命令只打印步骤,还是要你手动执行。

---

**这条链路现在的形态**(实测确立,2026-08-23):

```
访客 ──HTTPS──> Cloudflare 边缘 ──HTTPS──> cpolar 香港节点 ──隧道──> 你的 localhost:4173
       ↑ 公信证书,CF 自动管        ↑ 你那张自签名,访客看不到
```

**记住它是按需在线的。** 要给人看的时候开起来,看完就关——这不是缺陷,是这条路的形态。展开见 [02 档导读](README.md#它不是托管是-stage-环境)。
