// Express 服务器入口
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { initDatabase, dbPath } from './db/index.js';
import settingsRouter from './routes/settings.js';
import imagesRouter from './routes/images.js';
import generateRouter from './routes/generate.js';
import storybookRouter from './routes/storybook.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// 中间件
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// 请求日志
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbPath,
        environment: isProduction ? 'production' : 'development'
    });
});

// API 路由
app.use('/api/settings', settingsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/generate', generateRouter);
app.use('/api/storybook', storybookRouter);

// 生产环境：提供静态文件服务
if (isProduction) {
    const distPath = join(__dirname, '..', 'dist');

    if (existsSync(distPath)) {
        console.log(`📦 静态文件目录: ${distPath}`);

        // 静态文件服务
        app.use(express.static(distPath));

        // SPA 回退：所有非 API 请求返回 index.html
        app.get('*', (req: Request, res: Response) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(join(distPath, 'index.html'));
            }
        });
    } else {
        console.warn('⚠️ 未找到 dist 目录，静态文件服务未启用');
    }
}

// 错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
    });
});

// 404 处理（仅用于 API 路由）
app.use((req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ success: false, error: '接口不存在' });
    } else if (!isProduction) {
        res.status(404).json({ success: false, error: '开发模式下请访问 http://localhost:5173' });
    }
});

// 启动服务器
async function start(): Promise<void> {
    try {
        // 初始化数据库
        initDatabase();

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`
🚀 Pop-Up 绘本助手已启动
   - 地址: http://localhost:${PORT}
   - 模式: ${isProduction ? '🏭 生产环境' : '🔧 开发环境'}
   - 数据库: ${dbPath}
   - 时间: ${new Date().toLocaleString()}
      `);
        });
    } catch (error) {
        console.error('❌ 启动失败:', error);
        process.exit(1);
    }
}

start();

export default app;

