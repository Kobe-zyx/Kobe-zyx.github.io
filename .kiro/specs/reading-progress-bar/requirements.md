# 需求文档：阅读进度条功能

## 简介

为 Jekyll 博客添加一个视觉化的阅读进度条，在用户阅读文章时提供实时的阅读进度反馈。进度条将显示在页面顶部，随着用户滚动文章内容而平滑填充，提升阅读体验。

## 术语表

- **Progress_Bar**: 显示在页面顶部的阅读进度指示器
- **Blog_Post_Page**: 包含文章内容的页面（通过 Jekyll 的 `page.layout` 或 `page.url` 识别）
- **Scroll_Progress**: 用户当前滚动位置相对于文档总高度的百分比
- **Theme_System**: 现有的深色/浅色主题切换系统
- **Primary_Color**: CSS 变量 `--primary-color`，定义网站主题色
- **Viewport**: 浏览器可视区域

## 需求

### 需求 1：进度条视觉呈现

**用户故事：** 作为博客读者，我想在页面顶部看到一个细长的进度条，以便直观了解文章阅读进度。

#### 验收标准

1. THE Progress_Bar SHALL 显示在页面顶部，位置固定（fixed positioning）
2. THE Progress_Bar SHALL 具有 3px 的高度
3. THE Progress_Bar SHALL 使用 Primary_Color 作为填充颜色
4. THE Progress_Bar SHALL 初始宽度为 0%
5. THE Progress_Bar SHALL 具有 z-index 值确保显示在其他内容之上

### 需求 2：进度计算与更新

**用户故事：** 作为博客读者，我想在滚动文章时看到进度条实时更新，以便了解我的阅读位置。

#### 验收标准

1. WHEN 用户滚动页面，THE Progress_Bar SHALL 根据 Scroll_Progress 更新宽度
2. THE Scroll_Progress SHALL 计算为：`(当前滚动距离) / (文档总高度 - Viewport 高度) * 100%`
3. WHEN 用户滚动到页面顶部，THE Progress_Bar SHALL 显示 0% 宽度
4. WHEN 用户滚动到页面底部，THE Progress_Bar SHALL 显示 100% 宽度
5. THE Progress_Bar SHALL 使用 CSS transition 实现平滑的宽度变化

### 需求 3：性能优化

**用户故事：** 作为博客读者，我想在滚动时获得流畅的体验，不希望因为进度条而导致页面卡顿。

#### 验收标准

1. THE Progress_Bar SHALL 使用 `requestAnimationFrame` 节流滚动事件处理
2. THE Progress_Bar SHALL 仅更新 CSS transform 或 width 属性，避免触发页面重排
3. WHEN 滚动事件触发，THE Progress_Bar SHALL 在下一个动画帧中批量更新
4. THE Progress_Bar SHALL 使用 GPU 加速的 CSS 属性（如 `transform: scaleX()` 或 `width`）

### 需求 4：页面类型识别

**用户故事：** 作为博客读者，我只想在阅读文章时看到进度条，而不是在首页或其他页面。

#### 验收标准

1. THE Progress_Bar SHALL 仅在 Blog_Post_Page 上显示
2. WHEN 页面 URL 包含 `/blog/` 且不是 `/blog/` 或 `/blog/index.html`，THE Progress_Bar SHALL 显示
3. WHEN 页面是首页、时间轴、项目页或归档页，THE Progress_Bar SHALL 不显示
4. THE Progress_Bar SHALL 通过 JavaScript 检测页面类型并动态添加或移除 DOM 元素

### 需求 5：主题适配

**用户故事：** 作为博客读者，我想进度条颜色与网站主题保持一致，在切换深色/浅色模式时自动适配。

#### 验收标准

1. THE Progress_Bar SHALL 使用 CSS 变量 `--primary-color` 作为填充颜色
2. WHEN Theme_System 切换到深色模式，THE Progress_Bar SHALL 自动使用深色模式的 Primary_Color
3. WHEN Theme_System 切换到浅色模式，THE Progress_Bar SHALL 自动使用浅色模式的 Primary_Color
4. THE Progress_Bar SHALL 具有 0.3s 的颜色过渡动画，与主题切换动画同步

### 需求 6：响应式设计

**用户故事：** 作为移动设备用户，我想在手机上也能看到清晰的阅读进度条。

#### 验收标准

1. THE Progress_Bar SHALL 在所有屏幕尺寸下保持 100% 宽度
2. WHEN 设备宽度小于 768px，THE Progress_Bar SHALL 保持 3px 高度
3. THE Progress_Bar SHALL 不影响现有的移动端导航栏布局
4. THE Progress_Bar SHALL 在移动设备上使用相同的滚动计算逻辑

### 需求 7：初始化与清理

**用户故事：** 作为开发者，我想确保进度条功能不会造成内存泄漏或影响页面性能。

#### 验收标准

1. WHEN 页面加载完成，THE Progress_Bar SHALL 初始化并绑定滚动事件监听器
2. WHEN 页面卸载，THE Progress_Bar SHALL 移除所有事件监听器
3. THE Progress_Bar SHALL 使用单一的滚动事件监听器，避免重复绑定
4. THE Progress_Bar SHALL 在 DOM 中仅创建一个进度条元素

### 需求 8：视觉细节与动画

**用户故事：** 作为博客读者，我想看到流畅自然的进度条动画，提升阅读体验。

#### 验收标准

1. THE Progress_Bar SHALL 使用 `transition: width 0.2s ease-out` 实现平滑动画
2. THE Progress_Bar SHALL 具有轻微的阴影效果（`box-shadow`），增强视觉层次
3. WHEN 页面首次加载，THE Progress_Bar SHALL 从 0% 开始，无突兀的闪现
4. THE Progress_Bar SHALL 使用 `will-change: width` 提示浏览器优化渲染

## 实现约束

- 必须使用原生 JavaScript，不依赖外部库
- 必须与现有的 `script.js` 集成，不创建新的 JS 文件
- 必须使用现有的 CSS 变量系统
- 必须在 `DOMContentLoaded` 事件后初始化
- 必须兼容现有的页面淡入淡出动画
- 必须不影响现有的回到顶部按钮功能

## 非功能性需求

- 进度条更新频率应控制在 60fps 以内
- 滚动事件处理应在 16ms 内完成
- 进度条 DOM 元素应在页面加载后 100ms 内创建
- 代码应遵循现有项目的命名和格式规范
