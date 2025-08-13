# PACountdown - 网页版倒计时器

一个精准的5分钟间隔倒计时器，专为交易时间设计。

## 版本说明

### 🆕 Vue.js 版本 (当前主要版本)
- **文件**: `index.html`
- **技术栈**: Vue 3 + Composition API + Tailwind CSS
- **优势**: 响应式数据绑定，语言切换更可靠，代码更易维护

### 📄 原生 JavaScript 版本 (备份版本)
- **文件**: `index-original.html`
- **技术栈**: 原生 JavaScript + Tailwind CSS
- **状态**: 功能完整，但语言切换可能存在兼容性问题

## 功能特性

- ⏰ 精准的5分钟间隔倒计时
- 🔊 音频提醒功能
- 📈 仅交易时间模式
- 🌙 深色/浅色主题切换
- 🌍 多语言支持（中文/英文）
- 📱 响应式设计
- ⚙️ 可自定义提前通知时间

## 多语言功能

### 支持的语言
- 🇨🇳 中文（简体）
- 🇺🇸 英文

### 语言切换
- **自动检测**：根据浏览器语言设置自动选择默认语言
- **手动切换**：点击右上角的语言切换按钮（中/En）进行切换
- **记忆功能**：语言选择会保存在本地存储中

### 语言设置优先级
1. 用户手动选择的语言（保存在本地存储）
2. 浏览器语言设置
3. 默认英文

## 快速开始

### 使用当前版本（Vue.js）

1. 打开 `index.html`
2. 语言切换功能完全可靠
3. 所有功能正常工作

### 使用备份版本（原生 JavaScript）

1. 打开 `index-original.html`
2. 如果语言切换不工作，请查看浏览器控制台
3. 可能需要刷新页面或清除缓存

## 部署到 Cloudflare Pages

### 自动部署

项目已配置 GitHub Actions 自动部署到 Cloudflare Pages：

1. 推送到 `main` 分支时自动触发部署
2. 使用 Vue.js 版本作为主要版本
3. 项目名称：`pacountdown`

### 音频问题解决方案

在 Cloudflare Pages 上部署后，音频功能可能遇到以下问题：

1. **浏览器自动播放限制**：现代浏览器需要用户交互才能播放音频
2. **音频文件加载问题**：音频文件可能没有正确预加载

### 解决方案

1. **用户交互检测**：代码已优化，会在用户首次点击页面时初始化音频
2. **音频状态指示**：按钮会显示音频是否已准备就绪
3. **错误处理**：包含完善的错误处理和重试机制
4. **缓存配置**：`_headers` 文件确保音频文件正确缓存

### 使用说明

1. 打开页面后，点击任意位置以初始化音频
2. 等待音频按钮显示"🔊 声音开启"状态
3. 点击"🎵 测试声音"按钮测试音频是否工作
4. 如果音频不工作，请检查浏览器设置是否允许自动播放

### 浏览器兼容性

- Chrome/Edge: 完全支持
- Firefox: 完全支持
- Safari: 需要用户交互
- 移动端浏览器: 需要用户交互

### 故障排除

如果音频仍然不工作：

1. 检查浏览器控制台是否有错误信息
2. 确保浏览器允许网站播放音频
3. 尝试刷新页面并重新点击
4. 检查网络连接是否正常

## 本地开发

1. 克隆项目
2. 使用本地服务器运行（如 Live Server）
3. 确保音频文件路径正确

## 技术栈

### 当前版本 (Vue.js)
- Vue 3 (Composition API)
- Tailwind CSS
- Web Audio API

### 备份版本 (原生 JavaScript)
- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- Web Audio API

## 文件结构

```
PACountdown-web/
├── index.html                 # Vue.js 版本（当前主要版本）
├── index-original.html        # 原生 JavaScript 版本（备份）
├── script.js                  # 原生 JavaScript 逻辑（备份）
├── tick.wav                   # 音频文件
├── final_tick.wav             # 音频文件
├── _headers                   # Cloudflare Pages 配置
├── .github/workflows/         # GitHub Actions 配置
│   └── deploy.yml
├── README.md                  # 项目说明
└── test files/                # 测试文件
    ├── vue-test.html
    ├── debug.html
    ├── simple-test.html
    ├── fix-test.html
    └── ...
```
