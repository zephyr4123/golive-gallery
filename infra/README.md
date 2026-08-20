# infra —— 部署基础设施配置(全部占位符化,零密钥)

- `vps/`:Caddyfile 与发布目录约定(releases + current 符号链接)
- `tunnel/`:cloudflared / cpolar 配置模板(token 一律占位符,真值走本机环境)
- `dns/`:`*.<BASE_DOMAIN>` 子域名解析记录的声明式登记,与各站 site.yaml 对账

原则:**服务器上的一切都能从本目录重建**。手工在服务器上改配置 = 制造漂移。
