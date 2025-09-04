# WebNote Chrome 扩展 - 构建和部署指南

## 📋 快速开始

### 1. 安装依赖
```bash
npm install
# 或者使用带验证的安装
npm run install-dev
```

### 2. 开发模式
```bash
# 启动开发服务器（支持热重载）
npm run dev

# 或者使用别名
npm run watch
```

### 3. 构建生产版本
```bash
# 构建扩展
npm run build

# 构建并打包
npm run package
```

### 4. 安装到 Chrome
1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist/` 目录

---

## 🛠️ 构建系统详解

### 构建脚本功能

#### `npm run build` - 标准构建
- ✅ 清理构建目录
- ✅ 复制所有源文件到 `dist/`
- ✅ 优化 CSS 和 JavaScript
- ✅ 移除开发环境代码
- ✅ 验证构建结果
- ✅ 生成构建报告

#### `npm run dev` - 开发服务器
- 🔄 监听文件变化
- 🚀 自动重新构建
- 📊 实时构建状态
- 💡 开发提示和帮助

#### `npm run package` - 打包分发
- 📦 构建生产版本
- 🗜️ 创建 ZIP 压缩包
- 📋 生成版本信息

### 构建产物结构
```
dist/
├── manifest.json          # Chrome 扩展清单
├── content.js             # Content Script
├── content.css            # 样式文件
├── background.js          # Background Service Worker  
├── popup.html             # 弹窗页面
├── popup.js               # 弹窗逻辑
├── options.html           # 设置页面
├── options.js             # 设置逻辑
├── assets/                # 资源文件
│   ├── icon-16.png       # 16x16 图标
│   ├── icon-32.png       # 32x32 图标
│   ├── icon-48.png       # 48x48 图标
│   └── icon-128.png      # 128x128 图标
└── build-report.json     # 构建报告
```

---

## 🔧 开发工作流

### 1. 准备开发环境
```bash
# 克隆项目
git clone <repository-url>
cd webnote

# 安装依赖并验证
npm run install-dev

# 验证项目配置
npm run setup
```

### 2. 开发阶段
```bash
# 启动开发服务器
npm run dev
```

开发服务器会：
- 📁 监听源文件变化
- 🔄 自动重新构建
- 💡 提供有用的开发信息
- ⚡ 支持快速迭代

### 3. 测试阶段
```bash
# 运行完整测试（验证 + 构建）
npm test

# 单独运行验证
npm run setup
```

### 4. 构建发布版本
```bash
# 清理旧文件
npm run clean

# 构建生产版本
npm run build:prod

# 打包分发
npm run package
```

---

## 📦 安装和使用指南

### Chrome 扩展安装

#### 方法1：开发者模式（推荐用于开发）
1. 构建项目：`npm run build`
2. 打开 Chrome 浏览器
3. 访问 `chrome://extensions/`
4. 开启右上角"开发者模式"开关
5. 点击"加载已解压的扩展程序"
6. 选择项目的 `dist/` 目录
7. ✅ 扩展已安装！

#### 方法2：CRX 文件（用于分发）
1. 打包项目：`npm run package`
2. 获得 `webnote-extension.zip` 文件
3. 解压后按方法1安装

### 验证安装
安装成功后，你会看到：
- 🧩 浏览器工具栏出现 WebNote 图标
- 🎯 可以使用快捷键 `Ctrl+Shift+H`
- 📝 在任何网页选择文本后显示颜色选择弹窗

---

## 🎯 使用说明

### 基本功能
1. **划线标注**：选择网页文本，选择颜色进行标注
2. **管理划线**：点击扩展图标查看所有划线
3. **搜索过滤**：按颜色、时间、关键词过滤划线
4. **数据导出**：导出划线数据为 JSON/CSV/HTML 格式

### 快捷键
- `Ctrl+Shift+H`：快速黄色划线
- `Ctrl+Shift+N`：打开控制台

### 设置选项
- 🎨 默认划线颜色
- ⏱️ 弹窗显示延迟
- 📱 主题模式
- 📊 数据管理

---

## 🚨 常见问题

### 构建问题

**Q: 构建失败，提示缺少文件**
```bash
# 检查项目完整性
npm run validate

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

**Q: 开发服务器无法启动**
```bash
# 检查端口占用
npm run build  # 先手动构建一次
npm run dev     # 再启动开发服务器
```

### 安装问题

**Q: Chrome 无法加载扩展**
- 确保使用 `dist/` 目录而不是项目根目录
- 检查 `manifest.json` 格式是否正确
- 查看 Chrome 扩展页面的错误信息

**Q: 扩展功能不工作**
- 检查是否启用了扩展权限
- 查看浏览器开发者控制台错误
- 确认目标网站不是特殊页面（如 `chrome://`）

### 性能问题

**Q: 划线响应较慢**
- 检查是否开启了性能模式（设置页面）
- 确认划线数量未超过限制（1000条）
- 清理旧的划线数据

---

## 🔍 调试指南

### Chrome DevTools 调试

1. **Content Script 调试**：
   - 在网页上右键 → 检查
   - Console 面板查看 content.js 日志

2. **Background Script 调试**：
   - `chrome://extensions/` → 找到 WebNote
   - 点击"Service Worker"链接
   - 在新开的 DevTools 中调试

3. **Popup 调试**：
   - 右键扩展图标 → 检查弹出内容
   - 在弹出的 DevTools 中调试

### 日志系统
扩展内置了详细的日志系统：
- 🎯 操作日志：记录用户操作和响应时间
- 📊 性能监控：跟踪各项性能指标
- ❌ 错误报告：捕获和记录错误信息

---

## 📊 性能基准

构建后的扩展应该满足：
- ✅ 总大小 < 1MB
- ✅ 划线响应时间 < 100ms
- ✅ 弹窗显示延迟 < 50ms
- ✅ 内存使用 < 50MB
- ✅ 支持 1000 条划线记录

运行 `npm run build` 后查看 `dist/build-report.json` 获取详细的构建报告。

---

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 开发并测试：`npm run dev`
4. 提交变更：`git commit -m "Add new feature"`
5. 推送分支：`git push origin feature/new-feature`
6. 创建 Pull Request

开发时请遵循：
- 📝 使用 TypeScript 类型定义
- ⚡ 保持高性能（< 100ms 响应）
- 🧪 添加适当的错误处理
- 📚 更新相关文档