# WebNote Chrome 扩展 - 核心功能开发

## Story
实现 WebNote Chrome 浏览器扩展的核心功能，包括网页文本划线、颜色选择浮窗、控制台管理页面以及数据备份恢复功能。

## Acceptance Criteria

### 功能要求
- 用户可以在任何网页选择文本并显示颜色选择浮窗
- 点击颜色后文本被相应颜色划线标记
- 控制台页面显示所有划线内容，支持点击跳转到原页面位置
- 支持数据导入导出功能
- 划线数据持久化存储且跨页面同步

### 性能要求
- 划线响应时间：从文本选择到高亮显示 < 100ms
- 浮窗显示延迟：文本选择后浮窗出现 < 50ms
- 控制台加载时间：打开 Popup 到数据显示完成 < 200ms
- 页面跳转响应：点击跳转到原页面位置 < 150ms
- 数据查询性能：搜索和筛选操作响应 < 100ms

### 容量限制
- 支持最多 1000 条活跃划线记录
- 单个页面最多支持 50 条划线
- 划线文本长度限制：最大 500 字符
- 存储空间限制：总数据大小 < 10MB

### 资源消耗
- 内存占用：扩展运行时总内存 < 50MB
- CPU 使用：划线操作期间 CPU 占用 < 5%
- 存储 I/O：批量操作时写入频率 < 10次/秒

### 兼容性要求
- Chrome 版本支持：Chrome 88+ (Manifest V3)
- 网站兼容性：支持 95% 的常见网站（包括 CSP 限制站点）
- 页面类型：支持静态页面、SPA 应用、动态加载内容
- 设备支持：桌面版 Chrome（Windows/macOS/Linux）

### 稳定性要求
- 错误率：划线操作失败率 < 1%
- 数据一致性：跨页面同步准确率 > 99%
- 崩溃恢复：扩展崩溃后能自动恢复状态
- 数据完整性：导入导出操作数据丢失率 = 0%

## Dev Notes
基于架构师设计：
- 使用 Plasmo 框架构建 Chrome 扩展
- React + TypeScript + Zustand 技术栈
- Chrome Storage API 数据持久化
- Content Scripts + Background Script 架构

## Tasks

### Task 1: 项目初始化和基础配置
- [x] 1.1 初始化 Plasmo 项目
- [x] 1.2 配置 TypeScript 和基础开发环境
- [x] 1.3 设置项目结构和依赖
- [x] 1.4 配置 Tailwind CSS 和 Radix UI

### Task 2: Chrome 扩展清单和权限配置
- [ ] 2.1 配置 manifest.json 权限
- [ ] 2.2 设置 Content Scripts 注入规则
- [ ] 2.3 配置 Background Script

### Task 3: 数据模型和类型定义
- [ ] 3.1 定义划线数据接口
- [ ] 3.2 创建共享类型定义
- [ ] 3.3 设计消息传递接口

### Task 4: Content Script - 文本选择和划线功能
- [ ] 4.1 实现文本选择监听
- [ ] 4.2 创建颜色选择浮窗组件
- [ ] 4.3 实现划线渲染引擎
- [ ] 4.4 处理页面坐标和位置记录

### Task 5: Background Script - 数据管理
- [ ] 5.1 实现 Chrome Storage 数据层
- [ ] 5.2 处理跨页面消息传递
- [ ] 5.3 实现数据同步逻辑

### Task 6: Popup 控制台界面
- [ ] 6.1 创建划线列表展示
- [ ] 6.2 实现搜索和筛选功能
- [ ] 6.3 添加跳转到原页面功能
- [ ] 6.4 实现数据导入导出

### Task 7: 性能优化和质量保证
- [ ] 7.1 实施性能监控和度量
- [ ] 7.2 优化划线响应时间（目标 < 100ms）
- [ ] 7.3 内存使用优化（目标 < 50MB）
- [ ] 7.4 大数据量测试（1000条划线记录）
- [ ] 7.5 兼容性测试（Chrome 88+，各类网站）
- [ ] 7.6 稳定性和错误处理测试

### Task 8: 测试验证
- [ ] 8.1 单元测试覆盖率 > 90%
- [ ] 8.2 集成测试和 E2E 测试
- [ ] 8.3 性能基准测试验证
- [ ] 8.4 手动兼容性测试

## Testing

### 单元测试
- Framework: Jest + React Testing Library
- Coverage Target: > 90% 代码覆盖率
- Performance Tests: 响应时间和内存使用测试

### 集成测试
- E2E Tests: Playwright
- Chrome Extension Testing: Puppeteer + Chrome Extension API
- Cross-page Sync Testing: 多标签页数据一致性测试

### 性能测试
- Load Testing: 1000条划线记录加载测试
- Stress Testing: 高频操作压力测试
- Memory Profiling: Chrome DevTools 内存分析
- Response Time Monitoring: 实时性能监控

### 兼容性测试
- Browser Testing: Chrome 88, 90, 95, 100, Latest
- Website Testing: 主流网站（百度、知乎、GitHub、Wikipedia等）
- CSP Testing: 内容安全策略兼容性测试
- Dynamic Content Testing: SPA 应用和动态加载内容

## Dev Agent Record

### Agent Model Used
Claude Opus 4.1

### Debug Log References
Debug logs will be stored in .ai/debug-log.md

### Completion Notes
- [x] 项目初始化完成
- [ ] 基础功能实现完成
- [ ] 性能指标全部达标（响应时间、内存、容量限制）
- [ ] 测试覆盖率达到 90%+
- [ ] 兼容性测试通过（Chrome 88+，主流网站）
- [ ] 稳定性验证完成（错误率 < 1%，数据一致性 > 99%）

### File List
- `manifest.json` - Chrome 扩展清单文件
- `package.json` - 项目包管理配置
- `tsconfig.json` - TypeScript 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `postcss.config.js` - PostCSS 配置
- `content.css` - Content Script 专用样式
- `src/shared/types/index.ts` - 核心数据类型定义
- `src/shared/types/messages.ts` - 消息传递类型
- `src/shared/constants/index.ts` - 应用常量
- `src/shared/utils/index.ts` - 通用工具函数
- `src/shared/utils/ui.ts` - UI 工具类
- `src/shared/styles/globals.css` - 全局样式
- `scripts/validate.js` - 项目验证脚本
- `scripts/type-check.js` - TypeScript 验证
- `scripts/dependency-manager.js` - 依赖管理
- `scripts/style-validator.js` - 样式系统验证
- `README.md` - 项目说明文档

### Change Log
| Date | Change | Reason |
|------|---------|---------|
| 2025-09-04 | Story created | Initial development planning |
| 2025-09-04 | Added performance requirements | User requested performance-focused acceptance criteria |
| 2025-09-04 | Enhanced testing strategy | Added comprehensive performance and compatibility testing |

## Status
In Progress