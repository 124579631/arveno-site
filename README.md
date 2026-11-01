# arveno.tech

纯静态网站（HTML + CSS + 少量 JS），无需构建。

## 结构

```
index.html          首页（导航 / 首屏 / 服务 / 作品 / 关于 / 联系）
assets/style.css    样式（自动适配深色模式、移动端）
assets/main.js      移动端菜单、年份
assets/favicon.svg  图标
CNAME               GitHub Pages 自定义域名用
```

## 本地预览

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 部署（任选其一）

**Cloudflare Pages / Vercel / Netlify**：把本目录推到 GitHub 仓库，在平台里导入，构建命令留空，输出目录填 `/`，然后在平台的 Custom Domain 里添加 `arveno.tech`，按提示配置 DNS。

**GitHub Pages**：推到仓库 → Settings → Pages → 选 main 分支根目录。DNS 添加：
- `A` 记录 `@` → `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
- `CNAME` 记录 `www` → `<用户名>.github.io`

**自有服务器（Nginx/Caddy）**：把文件放到网站根目录即可。Caddy 示例：

```
arveno.tech, www.arveno.tech {
    root * /var/www/arveno-site
    file_server
}
```

## 待替换内容

- 作品区的三个占位项目（标题、链接、封面图）
- 关于区的文字和数据
- 联系邮箱 `hello@arveno.tech`
