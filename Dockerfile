# Pop-Up 绘本助手 Docker 镜像
# 适用于 NAS 内网部署

# ============ 构建阶段 ============
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++ 

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# ============ 运行阶段 ============
FROM node:20-alpine AS runner

WORKDIR /app

# 安装运行时依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 创建非 root 用户
RUN addgroup --system --gid 1001 popup && \
    adduser --system --uid 1001 popup

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖 + tsx（运行 TypeScript 需要）
RUN npm ci --omit=dev && \
    npm install tsx

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# 创建数据目录
RUN mkdir -p /app/data && chown -R popup:popup /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 数据卷（持久化数据库）
VOLUME ["/app/data"]

# 切换到非 root 用户
USER popup

# 启动命令
CMD ["npx", "tsx", "server/index.ts"]
