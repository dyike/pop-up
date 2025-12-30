// 绘本 API 路由
import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import { generateStoryWithLLM, getLLMConfig, type GeneratedStory, type Scene } from '../services/storyService.js';
import { generateImage, enhancePrompt, STYLES } from '../services/aiService.js';

const router = Router();

interface Storybook {
    id: number;
    title: string;
    theme: string;
    style: string;
    provider: string;
    scene_count: number;
    status: string;
    is_favorite: number;
    created_at: string;
}

interface StorybookPage {
    id: number;
    storybook_id: number;
    page_index: number;
    text: string;
    image_prompt: string | null;
    image_url: string | null;
    status: string;
}

// 获取绘本列表
router.get('/', (req: Request, res: Response) => {
    try {
        const { favorites } = req.query;

        let sql = 'SELECT * FROM storybooks';
        if (favorites === 'true') {
            sql += ' WHERE is_favorite = 1';
        }
        sql += ' ORDER BY created_at DESC';

        const storybooks = db.prepare(sql).all() as Storybook[];

        res.json({ success: true, data: storybooks });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 获取单个绘本（含所有页面）
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const storybook = db.prepare('SELECT * FROM storybooks WHERE id = ?').get(id) as Storybook | undefined;

        if (!storybook) {
            return res.status(404).json({ success: false, error: '绘本不存在' });
        }

        const pages = db.prepare(
            'SELECT * FROM storybook_pages WHERE storybook_id = ? ORDER BY page_index'
        ).all(id) as StorybookPage[];

        res.json({
            success: true,
            data: { ...storybook, pages }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 创建绘本（生成故事 + 图片）
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { theme, sceneCount = 4, style = 'cartoon', provider = 'openai' } = req.body;

        if (!theme?.trim()) {
            return res.status(400).json({ success: false, error: '请输入绘本主题' });
        }

        if (sceneCount < 2 || sceneCount > 8) {
            return res.status(400).json({ success: false, error: '页数应在 2-8 之间' });
        }

        // 检查 LLM 配置（故事生成）
        const llmConfig = getLLMConfig();
        if (!llmConfig) {
            return res.status(400).json({ success: false, error: '请先在设置中配置 LLM（故事生成）的 API Key' });
        }

        // 检查图片生成配置
        const imageConfigRow = db.prepare('SELECT api_key, base_url, model_name FROM api_keys WHERE provider = ?').get(provider) as { api_key: string; base_url: string | null; model_name: string | null } | undefined;
        if (!imageConfigRow) {
            return res.status(400).json({ success: false, error: `请先配置 ${provider} 的 API Key` });
        }

        console.log(`📖 开始生成绘本: theme=${theme}, sceneCount=${sceneCount}`);

        // Step 1: 生成故事（使用 LLM 配置）
        console.log('📝 正在生成故事...');
        const story = await generateStoryWithLLM(theme, sceneCount);
        console.log(`✅ 故事生成完成: ${story.title}`);

        // Step 2: 创建绘本记录
        const insertResult = db.prepare(`
      INSERT INTO storybooks (title, theme, style, provider, scene_count, status)
      VALUES (?, ?, ?, ?, ?, 'generating')
    `).run(story.title, theme, style, provider, story.scenes.length);

        const storybookId = insertResult.lastInsertRowid as number;

        // Step 3: 创建页面记录
        const insertPage = db.prepare(`
      INSERT INTO storybook_pages (storybook_id, page_index, text, image_prompt, status)
      VALUES (?, ?, ?, ?, 'pending')
    `);

        for (const scene of story.scenes) {
            insertPage.run(storybookId, scene.index, scene.text, scene.imagePrompt);
        }

        // Step 4: 异步生成图片（返回响应后继续生成）
        res.json({
            success: true,
            data: {
                id: storybookId,
                title: story.title,
                theme,
                status: 'generating',
                sceneCount: story.scenes.length
            }
        });

        // 后台继续生成图片（传递完整配置）
        generateStorybookImages(
            storybookId,
            story.scenes,
            style,
            provider,
            imageConfigRow.api_key,
            imageConfigRow.base_url || undefined,
            imageConfigRow.model_name || undefined
        )
            .then(() => {
                console.log(`✅ 绘本 ${storybookId} 图片生成完成`);
            })
            .catch((error) => {
                console.error(`❌ 绘本 ${storybookId} 图片生成失败:`, error);
                db.prepare('UPDATE storybooks SET status = ? WHERE id = ?').run('failed', storybookId);
            });

    } catch (error) {
        console.error('❌ 创建绘本失败:', error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 生成绘本图片（内部函数）
async function generateStorybookImages(
    storybookId: number,
    scenes: Scene[],
    style: string,
    provider: string,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
): Promise<void> {
    const styleConfig = STYLES[style] || STYLES.cartoon;

    for (const scene of scenes) {
        try {
            console.log(`🎨 生成第 ${scene.index} 页图片...`);

            // 增强 prompt
            const enhancedPrompt = `${scene.imagePrompt}, ${styleConfig.prompt}, child-friendly, safe for kids, high quality illustration`;

            // 生成图片（传递完整配置）
            const result = await generateImage({
                prompt: enhancedPrompt,
                provider,
                apiKey,
                baseUrl,
                model: modelName
            });

            // 更新页面记录
            db.prepare(`
        UPDATE storybook_pages 
        SET image_url = ?, status = 'completed'
        WHERE storybook_id = ? AND page_index = ?
      `).run(result.url, storybookId, scene.index);

            console.log(`✅ 第 ${scene.index} 页完成`);

        } catch (error) {
            console.error(`❌ 第 ${scene.index} 页失败:`, error);
            db.prepare(`
        UPDATE storybook_pages 
        SET status = 'failed'
        WHERE storybook_id = ? AND page_index = ?
      `).run(storybookId, scene.index);
        }
    }

    // 检查是否全部完成
    const failedPages = db.prepare(
        'SELECT COUNT(*) as count FROM storybook_pages WHERE storybook_id = ? AND status = ?'
    ).get(storybookId, 'failed') as { count: number };

    const status = failedPages.count > 0 ? 'partial' : 'completed';
    db.prepare('UPDATE storybooks SET status = ? WHERE id = ?').run(status, storybookId);
}

// 获取绘本生成状态
router.get('/:id/status', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const storybook = db.prepare('SELECT id, status FROM storybooks WHERE id = ?').get(id) as { id: number; status: string } | undefined;

        if (!storybook) {
            return res.status(404).json({ success: false, error: '绘本不存在' });
        }

        const pages = db.prepare(`
      SELECT page_index, status, image_url 
      FROM storybook_pages 
      WHERE storybook_id = ? 
      ORDER BY page_index
    `).all(id) as { page_index: number; status: string; image_url: string | null }[];

        const completedCount = pages.filter(p => p.status === 'completed').length;

        res.json({
            success: true,
            data: {
                id: storybook.id,
                status: storybook.status,
                progress: {
                    total: pages.length,
                    completed: completedCount,
                    percent: Math.round((completedCount / pages.length) * 100)
                },
                pages
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 切换收藏状态
router.patch('/:id/favorite', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const storybook = db.prepare('SELECT is_favorite FROM storybooks WHERE id = ?').get(id) as { is_favorite: number } | undefined;

        if (!storybook) {
            return res.status(404).json({ success: false, error: '绘本不存在' });
        }

        const newStatus = storybook.is_favorite ? 0 : 1;
        db.prepare('UPDATE storybooks SET is_favorite = ? WHERE id = ?').run(newStatus, id);

        res.json({ success: true, data: { is_favorite: newStatus } });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 删除绘本
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 级联删除会自动删除页面
        const result = db.prepare('DELETE FROM storybooks WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: '绘本不存在' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;
