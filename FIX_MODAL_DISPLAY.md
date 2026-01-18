# Modal 显示修复记录

## 问题描述
用户反馈“创建新课程的界面显示有问题”。我们发现 Modal 组件显示为一个极窄的垂直条带，内容不可读。

## 原因分析
1.  **不兼容的动画类**：Modal 组件使用了 `tailwindcss-animate` 插件提供的类（`animate-in` 等），但项目使用的是 Tailwind CSS v4 且未安装该插件。这可能导致 Tailwind 解析样式时出现异常。
2.  **宽度样式失效**：即使移除了无效类，Modal 的宽度依然异常。这表明在当前 Flex 布局和 Tailwind v4 环境下，单纯依靠 class 可能存在优先级或解析问题。

## 解决方案
1.  **移除无效类**：删除了所有 `tailwindcss-animate` 相关的类名。
2.  **添加自定义动画**：在 `globals.css` 中手动定义了简单的 `fadeIn` 和 `modalIn` 动画。
3.  **强制内联样式**：为了确保万无一失，直接在 Modal 组件的 JSX 中使用 `style` 属性强制设置 `width: 100%` 和基于 size props 的 `maxWidth`，以及动画属性。

## 验证结果
通过自动化浏览器测试和截图确认，Modal 现在可以正常居中显示，宽度适宜，布局和交互恢复正常。
