# 🎨 Pop-Up - 幼儿故事绘本 Agent

> 为3岁以下幼儿打造的 AI 故事绘本应用，输入主题自动生成完整绘本

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)

---

## ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 📖 **AI 绘本** | 输入主题，自动生成多页故事绘本 |
| 🎨 **AI 绘图** | 为故事自动生成精美儿童友好插画 |
| 🖌️ **多种画风** | 可爱卡通、水彩绘本、简笔画、3D动画、吉卜力 |
| 🔊 **语音朗读** | 将故事朗读给宝宝听 |
| ⭐ **收藏功能** | 保存喜欢的作品到画廊 |
| 🔌 **多 Provider** | 支持 OpenAI、豆包、智谱、通义、Stability AI、Replicate、Gemini |

---

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 另开终端，启动后端服务器
npm run server

# 或一键启动前后端
npm run dev:all
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 配置

1. 点击右上角「⚙️ 设置」
2. 选择 AI 服务商（OpenAI、Gemini 等）
3. 配置 API Key、Base URL、Model Name
4. 配置 LLM（用于故事生成）
5. 点击「保存」

---

## 🐳 Docker 部署（推荐用于 NAS）

### 方式一：Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方式二：Docker 命令

```bash
# 构建镜像
docker build -t popup-storybook .

# 运行容器
docker run -d \
  --name popup-storybook \
  -p 3001:3001 \
  -v popup-data:/app/data \
  --restart unless-stopped \
  popup-storybook
```

### 访问应用

部署后访问: `http://<你的NAS-IP>:3001`

### 数据持久化

数据库存储在 Docker Volume `popup-data` 中，包括：
- 配置信息（API Keys、设置）
- 绘本历史
- 图片数据

---

## 🏠 内网部署配置

如果你在内网使用 API 代理（如 Antigravity 代理），请按以下方式配置：

### LLM 配置（故事生成）

| 配置项 | 值 |
|--------|-----|
| API Key | `sk-xxxx`（你的代理 Key） |
| Base URL | `http://127.0.0.1:8045/v1beta`（代理地址） |
| Model Name | `gemini-3-flash`（支持的模型） |

### 图片生成配置（Gemini）

| 配置项 | 值 |
|--------|-----|
| Provider | Google Gemini 💎 |
| API Key | `sk-xxxx`（你的代理 Key） |
| Base URL | `http://127.0.0.1:8045/v1beta` |
| Model Name | `gemini-3-pro-image` |

### 代理地址说明

- 内网代理地址格式：`http://<代理IP>:<端口>/v1beta`
- 如果代理在本机：`http://127.0.0.1:8045/v1beta`
- 如果代理在 NAS：`http://<NAS-IP>:8045/v1beta`

### Docker 网络注意事项

在 Docker 容器中，`127.0.0.1` 指向容器本身，如需访问宿主机的代理，请使用：

```yaml
# docker-compose.yml
services:
  popup:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

然后配置 Base URL 为：`http://host.docker.internal:8045/v1beta`

## 🏗️ 项目结构

```
pop-up/
├── src/                    # 前端源码
│   ├── components/         # UI 组件
│   ├── providers/          # AI Provider 抽象
│   ├── services/           # 核心服务
│   ├── store/              # Zustand 状态管理
│   └── config/             # 配置
├── server/                 # 后端源码
│   ├── routes/             # API 路由
│   ├── providers/          # AI Provider 实现
│   ├── services/           # 后端服务
│   └── db/                 # 数据库
├── data/                   # SQLite 数据库文件
├── Dockerfile              # Docker 镜像定义
└── docker-compose.yml      # Docker Compose 配置
```

---

## 🔌 支持的 AI 服务商

| 服务商 | 功能 | 说明 |
|--------|------|------|
| OpenAI | 图片生成 | DALL-E 3/2 |
| Google Gemini | 图片生成 | Imagen / Gemini Pro Image |
| 豆包 | 图片生成 | 字节跳动 |
| 智谱 AI | 图片生成 | CogView |
| 通义万相 | 图片生成 | 阿里云 |
| Stability AI | 图片生成 | Stable Diffusion |
| Replicate | 图片生成 | Flux / SDXL |
| LLM（通用） | 故事生成 | 任何 OpenAI 兼容 API |

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

- **前端**: React 19 + Vite 7
- **后端**: Express 5 + TypeScript
- **数据库**: SQLite (better-sqlite3)
- **状态管理**: Zustand
- **语音合成**: Web Speech API
- **容器化**: Docker

---

## 📝 API 接口

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/settings` | GET/PUT | 设置管理 |
| `/api/settings/llm-config` | GET/PUT | LLM 配置 |
| `/api/settings/api-keys/:provider` | GET/PUT/DELETE | Provider 配置 |
| `/api/storybook/generate` | POST | 生成绘本 |
| `/api/storybook/:id` | GET | 获取绘本详情 |
| `/api/storybook/:id/status` | GET | 获取生成状态 |

---

## 📄 License

MIT

