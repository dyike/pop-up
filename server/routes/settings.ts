// 设置 API 路由
import { Router, Request, Response } from 'express';
import db from '../db/index.js';
import type { Setting, ApiKey, ApiResponse } from '../types/index.js';

const router = Router();

// 获取所有设置
router.get('/', (_req: Request, res: Response) => {
    try {
        const settings = db.prepare('SELECT key, value FROM settings').all() as Setting[];
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        res.json({ success: true, data: settingsMap });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// ============ LLM 配置（故事生成用） ============
// 注意：这些路由必须在 /:key 之前定义，否则会被通配符匹配

// 获取 LLM 配置
router.get('/llm-config', (_req: Request, res: Response) => {
    try {
        const row = db.prepare('SELECT api_key, base_url, model_name FROM llm_config WHERE id = 1').get() as { api_key: string | null; base_url: string; model_name: string } | undefined;

        if (!row || !row.api_key) {
            return res.json({
                success: true,
                data: {
                    configured: false,
                    baseUrl: row?.base_url || 'https://api.openai.com/v1',
                    modelName: row?.model_name || 'gpt-4o-mini'
                }
            });
        }

        // 部分隐藏 API Key
        const key = row.api_key;
        const masked = key.length > 8
            ? key.slice(0, 4) + '••••••••' + key.slice(-4)
            : '••••••••';

        res.json({
            success: true,
            data: {
                configured: true,
                masked,
                baseUrl: row.base_url || 'https://api.openai.com/v1',
                modelName: row.model_name || 'gpt-4o-mini'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 保存 LLM 配置
router.put('/llm-config', (req: Request, res: Response) => {
    try {
        const { apiKey, baseUrl, modelName } = req.body;

        console.log(`💾 保存 LLM 配置: baseUrl=${baseUrl || '(默认)'}, modelName=${modelName || '(默认)'}`);

        if (!apiKey) {
            return res.status(400).json({ success: false, error: '缺少 apiKey 参数' });
        }

        db.prepare(`
      INSERT INTO llm_config (id, api_key, base_url, model_name, updated_at) 
      VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET 
        api_key = ?, 
        base_url = ?,
        model_name = ?,
        updated_at = CURRENT_TIMESTAMP
    `).run(
            apiKey,
            baseUrl || 'https://api.openai.com/v1',
            modelName || 'gpt-4o-mini',
            apiKey,
            baseUrl || 'https://api.openai.com/v1',
            modelName || 'gpt-4o-mini'
        );

        console.log(`✅ LLM 配置已保存`);
        res.json({ success: true, data: { configured: true } });
    } catch (error) {
        console.error('❌ 保存 LLM 配置失败:', error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// ============ Settings Key-Value ============

// 获取单个设置
router.get('/:key', (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as Setting | undefined;

        if (!setting) {
            return res.status(404).json({ success: false, error: '设置不存在' });
        }

        res.json({ success: true, data: setting.value });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 更新设置
router.put('/:key', (req: Request, res: Response) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({ success: false, error: '缺少 value 参数' });
        }

        db.prepare(`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(key, value, value);

        res.json({ success: true, data: { key, value } });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// ============ API Keys ============

// 获取已配置的供应商列表
router.get('/api-keys/list', (_req: Request, res: Response) => {
    try {
        const keys = db.prepare('SELECT provider FROM api_keys').all() as { provider: string }[];
        const providers = keys.map(k => k.provider);

        res.json({ success: true, data: providers });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 获取单个供应商的配置 (API Key 部分隐藏)
router.get('/api-keys/:provider', (req: Request, res: Response) => {
    try {
        const { provider } = req.params;
        const row = db.prepare('SELECT api_key, base_url, model_name FROM api_keys WHERE provider = ?').get(provider) as { api_key: string; base_url: string | null; model_name: string | null } | undefined;

        if (!row) {
            return res.json({ success: true, data: { configured: false } });
        }

        // 部分隐藏 API Key
        const key = row.api_key;
        const masked = key.length > 8
            ? key.slice(0, 4) + '••••••••' + key.slice(-4)
            : '••••••••';

        res.json({
            success: true,
            data: {
                configured: true,
                masked,
                baseUrl: row.base_url || '',
                modelName: row.model_name || ''
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 保存 Provider 配置 (API Key, Base URL, Model Name)
router.put('/api-keys/:provider', (req: Request, res: Response) => {
    try {
        const { provider } = req.params;
        const { apiKey, baseUrl, modelName } = req.body;

        console.log(`💾 保存配置: provider=${provider}, baseUrl=${baseUrl || '(空)'}, modelName=${modelName || '(空)'}`);

        if (!apiKey) {
            return res.status(400).json({ success: false, error: '缺少 apiKey 参数' });
        }

        db.prepare(`
      INSERT INTO api_keys (provider, api_key, base_url, model_name, updated_at) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(provider) DO UPDATE SET 
        api_key = ?, 
        base_url = ?,
        model_name = ?,
        updated_at = CURRENT_TIMESTAMP
    `).run(provider, apiKey, baseUrl || null, modelName || null, apiKey, baseUrl || null, modelName || null);

        console.log(`✅ 配置已保存到数据库`);
        res.json({ success: true, data: { provider, configured: true } });
    } catch (error) {
        console.error('❌ 保存配置失败:', error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

// 删除 API Key
router.delete('/api-keys/:provider', (req: Request, res: Response) => {
    try {
        const { provider } = req.params;
        db.prepare('DELETE FROM api_keys WHERE provider = ?').run(provider);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});

export default router;


