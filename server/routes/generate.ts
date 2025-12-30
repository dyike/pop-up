// AI 图片生成 API 路由
import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import { generateImage, enhancePrompt } from '../services/aiService.js';
import type { GenerateRequest, Image } from '../types/index.js';

const router = Router();

// 生成图片
router.post('/', async (req: Request, res: Response) => {
    try {
        const { story, style, provider } = req.body as GenerateRequest;

        // 验证参数
        if (!story || !story.trim()) {
            return res.status(400).json({ success: false, error: '请输入故事内容' });
        }

        if (!style) {
            return res.status(400).json({ success: false, error: '请选择绘画风格' });
        }

        if (!provider) {
            return res.status(400).json({ success: false, error: '请选择 AI 供应商' });
        }

        // 检查 API Key 和获取完整配置
        const configRow = db.prepare('SELECT api_key, base_url, model_name FROM api_keys WHERE provider = ?').get(provider) as { api_key: string; base_url: string | null; model_name: string | null } | undefined;

        if (!configRow) {
            return res.status(400).json({ success: false, error: `请先配置 ${provider} 的 API Key` });
        }

        console.log(`📝 生成请求: provider=${provider}, style=${style}`);
        console.log(`📖 故事: ${story.slice(0, 50)}...`);
        console.log(`🔧 配置: baseUrl=${configRow.base_url || '(默认)'}, model=${configRow.model_name || '(默认)'}`);

        // 增强 prompt
        const enhancedPrompt = enhancePrompt(story, style);
        console.log(`✨ 增强后: ${enhancedPrompt.slice(0, 100)}...`);

        // 调用 AI 生成
        const result = await generateImage({
            prompt: enhancedPrompt,
            provider,
            apiKey: configRow.api_key,
            baseUrl: configRow.base_url || undefined,
            model: configRow.model_name || undefined
        });

        console.log(`🎨 生成成功: ${result.url.slice(0, 50)}...`);

        // 保存到数据库
        const insertResult = db.prepare(`
      INSERT INTO images (story, style, provider, image_url, enhanced_prompt, revised_prompt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(story, style, provider, result.url, enhancedPrompt, result.revisedPrompt || null);

        const newImage = db.prepare('SELECT * FROM images WHERE id = ?').get(insertResult.lastInsertRowid) as Image;

        res.json({
            success: true,
            data: {
                id: newImage.id,
                image_url: result.url,
                enhanced_prompt: enhancedPrompt,
                revised_prompt: result.revisedPrompt
            }
        });

    } catch (error) {
        console.error('❌ 生成失败:', error);
        res.status(500).json({ success: false, error: (error as Error).message || '图片生成失败' });
    }
});

// 获取可用的供应商和配置状态
router.get('/providers', (_req: Request, res: Response) => {
    try {
        const configuredKeys = db.prepare('SELECT provider FROM api_keys').all() as { provider: string }[];
        const configuredProviders = configuredKeys.map(k => k.provider);

        res.json({
            success: true,
            data: { configuredProviders }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;
