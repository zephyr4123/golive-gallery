# 01 · 免费托管

一分钱不花,把静态网站放上公网、绑上自己的域名、带 HTTPS。本目录按"先跑通、再讲究"的顺序读:

1. **[GitHub Pages](github-pages.md)** —— 零成本起步:仓库即站点,push 即部署。本项目第一个示范站(Reverie)走的就是这条链路
2. **[自定义域名与 Cloudflare 解析](custom-domain-cloudflare.md)** —— 买自己的域名,把解析托管到 Cloudflare,免费拿到边缘 HTTPS。含本项目实测的缓存心法与 NS 修改指北
3. **[Cloudflare Pages](cloudflare-pages.md)** —— 平台自己拉代码、自己构建,配置填在面板不进版本库;DNS 同在 Cloudflare 时,自定义域名的解析记录与证书全自动。本项目第二个示范站(Acreage)走的这条链路
4. Vercel —— 待写(平台硬事实先记着:Hobby 档仅限非商业用途)

平台硬限制备忘(动手前先知道,省得返工):**GitHub Pages 一个仓库只能承载一个站点、绑一个自定义域名**——所以本仓库把唯一的 Pages 名额给了旗舰示范站,其余站点走 Cloudflare Pages(免费档每项目 100 个自定义域、项目数无硬上限,规模化挂子域名首选)。

两条链路的机制对照表在 [Cloudflare Pages 篇](cloudflare-pages.md#与-github-pages-的机制对照) 末尾,选平台前值得先看一眼。
