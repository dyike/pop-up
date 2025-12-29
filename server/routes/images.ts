// 图片 API 路由
import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import type { Image, ApiResponse } from '../types/index.js';

const router = Router();

// 获取图片列表
router.get('/', (req: Request, res: Response) => {
    try {
        const { favorites } = req.query;

        let sql = 'SELECT id, story, style, provider, image_url, enhanced_prompt, revised_prompt, is_favorite, created_at FROM images';

        if (favorites === 'true') {
            sql += ' WHERE is_favorite = 1';
        }

        sql += ' ORDER BY created_at DESC';

        const images = db.prepare(sql).all() as Image[];

        res.json({ success: true, data: images });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 获取单个图片
router.get('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const image = db.prepare(
            'SELECT id, story, style, provider, image_url, enhanced_prompt, revised_prompt, is_favorite, created_at FROM images WHERE id = ?'
        ).get(id) as Image | undefined;

        if (!image) {
            return res.status(404).json({ success: false, error: '图片不存在' });
        }

        res.json({ success: true, data: image });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 创建图片记录
router.post('/', (req: Request, res: Response) => {
    try {
        const { story, style, provider, image_url, enhanced_prompt, revised_prompt } = req.body;

        if (!story || !style || !provider || !image_url) {
            return res.status(400).json({ success: false, error: '缺少必要参数' });
        }

        const result = db.prepare(`
      INSERT INTO images (story, style, provider, image_url, enhanced_prompt, revised_prompt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(story, style, provider, image_url, enhanced_prompt || null, revised_prompt || null);

        const newImage = db.prepare('SELECT * FROM images WHERE id = ?').get(result.lastInsertRowid) as Image;

        res.json({ success: true, data: newImage });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 切换收藏状态
router.patch('/:id/favorite', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 获取当前状态
        const image = db.prepare('SELECT is_favorite FROM images WHERE id = ?').get(id) as Image | undefined;

        if (!image) {
            return res.status(404).json({ success: false, error: '图片不存在' });
        }

        const newStatus = image.is_favorite ? 0 : 1;
        db.prepare('UPDATE images SET is_favorite = ? WHERE id = ?').run(newStatus, id);

        res.json({ success: true, data: { is_favorite: newStatus } });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 删除图片
router.delete('/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = db.prepare('DELETE FROM images WHERE id = ?').run(id);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: '图片不存在' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 批量删除
router.post('/batch-delete', (req: Request, res: Response) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, error: '缺少 ids 参数' });
        }

        const placeholders = ids.map(() => '?').join(',');
        db.prepare(`DELETE FROM images WHERE id IN (${placeholders})`).run(...ids);

        res.json({ success: true, data: { deleted: ids.length } });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;
