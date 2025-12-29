# 🎨 Pop-Up - 幼儿故事绘图 Agent

> 为3岁以下幼儿打造的 AI 故事绘图应用，输入故事自动生成精美插画

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![OpenAI](https://img.shields.io/badge/OpenAI-DALL·E-412991?logo=openai)

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 🎨 **AI 绘图** | 输入故事，自动生成儿童友好的插画 |
| 🖌️ **多种画风** | 可爱卡通、水彩绘本、简笔画、3D动画、吉卜力 |
| 🔊 **语音朗读** | 将故事朗读给宝宝听 |
| ⭐ **收藏功能** | 保存喜欢的作品到本地画廊 |
| 🔌 **可扩展** | 支持接入多个 AI 绘图供应商 |

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 配置 API Key

1. 点击右上角「⚙️ 设置」
2. 输入你的 OpenAI API Key
3. 点击「保存」

---

## 🏗️ 项目结构

```
src/
├── components/         # UI 组件
│   ├── StoryInput/     # 故事输入
│   ├── ImageDisplay/   # 图片展示
│   ├── Gallery/        # 收藏画廊
│   └── Settings/       # 设置页面
├── providers/          # AI 供应商抽象层
│   ├── BaseProvider.js
│   └── OpenAIProvider.js
├── services/           # 核心服务
│   ├── promptEnhancer.js   # Prompt 增强
│   ├── voiceService.js     # 语音朗读
│   └── storageService.js   # 本地存储
├── hooks/              # 自定义 Hooks
├── store/              # Zustand 状态管理
└── config/             # 配置文件
    ├── styles.js       # 绘画风格
    └── providers.js    # 供应商配置
```

---

## 🎨 绘画风格

| 风格 | 描述 |
|------|------|
| 🎨 可爱卡通 | 明亮可爱的卡通风格 |
| 🖌️ 水彩绘本 | 柔和梦幻的水彩画风 |
| ✏️ 简笔画 | 简单清晰的线条画 |
| 🎬 3D动画 | 精美的3D动画风格 |
| 🏯 吉卜力 | 温暖治愈的吉卜力风格 |

---

## 🔧 技术栈

- **前端**: React 18 + Vite
- **状态管理**: Zustand
- **AI 绘图**: OpenAI DALL-E
- **语音合成**: Web Speech API
- **本地存储**: IndexedDB

---

## 📝 开发计划

- [ ] 添加通义万相供应商
- [ ] 添加 Stable Diffusion 支持
- [ ] 故事模板库
- [ ] 打印/分享功能
- [ ] PWA 离线支持

---

## 📄 License

MIT
