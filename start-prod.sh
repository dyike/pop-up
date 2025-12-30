#!/bin/bash
# Pop-Up 绘本助手 - 生产环境启动脚本

set -e

echo "🔨 构建前端..."
npm run build

echo ""
echo "🚀 启动生产服务器..."
NODE_ENV=production npm run server
