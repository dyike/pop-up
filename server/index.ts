// Express 服务器入口
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDatabase, dbPath } from './db/index.js';
import settingsRouter from './routes/settings.js';
import imagesRouter from './routes/images.js';
import generateRouter from './routes/generate.js';
import storybookRouter from './routes/storybook.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
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
        database: dbPath
    });
});

// API 路由
app.use('/api/settings', settingsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/generate', generateRouter);
app.use('/api/storybook', storybookRouter);

// 错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: err.message || '服务器内部错误'
    });
});

// 404 处理
app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, error: '接口不存在' });
});

// 启动服务器
async function start(): Promise<void> {
    try {
        // 初始化数据库
        initDatabase();

        // 启动服务器
        app.listen(PORT, () => {
            console.log(`
🚀 Pop-Up 后端服务已启动
   - 地址: http://localhost:${PORT}
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
