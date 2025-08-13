# 部署说明

## 当前部署状态

✅ **Vue.js 版本已设为主要版本**
- `index.html` - Vue.js 版本（当前部署版本）
- `index-original.html` - 原生 JavaScript 版本（备份）

## GitHub Actions 自动部署

### 触发条件
- 推送到 `main` 分支时自动触发部署
- 部署到 Cloudflare Pages 项目：`pacountdown`

### 部署流程
1. 检出代码
2. 部署到 Cloudflare Pages
3. 使用 Vue.js 版本作为主要文件

### 配置文件
- `.github/workflows/deploy.yml` - GitHub Actions 配置
- `_headers` - Cloudflare Pages 缓存配置

## 手动部署

如果需要手动部署到 Cloudflare Pages：

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署项目
wrangler pages deploy ./ --project-name=pacountdown
```

## 版本切换

如果需要切换回原生 JavaScript 版本：

1. 重命名文件：
   ```bash
   mv index.html index-vue.html
   mv index-original.html index.html
   ```

2. 提交并推送更改：
   ```bash
   git add .
   git commit -m "Switch to original JavaScript version"
   git push origin main
   ```

## 部署检查清单

- [ ] Vue.js 版本功能正常
- [ ] 语言切换功能正常
- [ ] 音频功能正常
- [ ] 主题切换功能正常
- [ ] 倒计时功能正常
- [ ] 市场时间检测正常

## 故障排除

### 部署失败
1. 检查 GitHub Actions 日志
2. 确认 Cloudflare API Token 有效
3. 确认项目名称正确

### 功能异常
1. 检查浏览器控制台错误
2. 确认音频文件路径正确
3. 测试语言切换功能

## 联系信息

如有部署问题，请检查：
1. GitHub Actions 运行日志
2. Cloudflare Pages 部署日志
3. 浏览器开发者工具控制台
