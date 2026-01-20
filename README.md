# 🐬 海豚英语 / Dolphin English

让每篇文章都变成一堂英语课 | Turn every article into an English lesson

一款面向 A1-C2 学习者的英语学习应用，通过真实文章完成 30 分钟系统学习课程。

## ✨ 功能特点

### 📚 六大学习模块

1. **学习目标** - 明确本课学习重点
2. **整体听读** - 全文朗读，培养语感
3. **分段精讲** - 逐段分析，深入理解
4. **词汇学习** - 分层词汇，高效记忆
5. **理解检测** - 多轮测试，巩固理解
6. **内容复现** - 时间线排序 + 关键词复述

### 🎯 核心特性

- **AI 智能分析** - 自动分析文章难度、提取词汇、生成练习题
- **CEFR 难度分级** - 支持 A1 到 C2 全级别
- **双语界面** - 中英文自由切换
- **进度追踪** - 实时保存学习进度
- **TTS 朗读** - 原生语音合成，支持多种语速

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **数据库**: [Convex](https://convex.dev/) (实时数据库)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI**: OpenAI GPT-4 (文章分析)
- **字体**: Outfit (正文) + Mali (英文手写) + ZCOOL KuaiLe (中文手写)
- **语言**: TypeScript

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
# Convex
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# OpenAI (用于文章分析)
OPENAI_API_KEY=your_openai_api_key
```

### 启动开发服务器

```bash
# 启动 Convex 后端
pnpm convex dev

# 启动 Next.js 前端 (新终端)
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📁 项目结构

```
dolphin-english/
├── convex/              # Convex 后端
│   ├── courses.ts       # 课程相关函数
│   ├── progress.ts      # 进度相关函数
│   └── schema.ts        # 数据库 Schema
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API 路由
│   │   ├── course/      # 课程页面
│   │   └── page.tsx     # 首页
│   ├── components/      # React 组件
│   │   ├── course/      # 课程相关组件
│   │   ├── layout/      # 布局组件
│   │   ├── modules/     # 学习模块组件
│   │   └── ui/          # 通用 UI 组件
│   └── lib/             # 工具库
│       ├── i18n/        # 国际化
│       ├── schemas/     # Zod Schema
│       └── constants.ts # 常量配置
└── public/              # 静态资源
```

## 📝 使用说明

1. **创建课程** - 粘贴英文文章或上传图片
2. **AI 分析** - 系统自动分析文章并生成学习内容
3. **开始学习** - 按顺序完成六个学习模块
4. **追踪进度** - 随时查看学习进度，支持断点续学

## 🌐 国际化

应用支持中英文双语：

- 🇨🇳 中文 - 界面语言 + 中文手写字体 (ZCOOL KuaiLe)
- 🇺🇸 English - Interface language + English handwriting font (Mali)

## 📄 License

MIT License

---

Made with ❤️ for English learners
