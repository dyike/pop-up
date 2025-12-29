import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';

/**
 * OpenAI DALL-E 图像生成供应商
 */
export class OpenAIProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.client = null;
        this.model = config.model || 'dall-e-3';
        this.size = config.size || '1024x1024';
    }

    /**
     * 获取或创建 OpenAI 客户端
     */
    getClient() {
        if (!this.client && this.apiKey) {
            this.client = new OpenAI({
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true // 仅用于演示，生产环境应使用后端代理
            });
        }
        return this.client;
    }

    /**
     * 设置 API Key（重写以重置客户端）
     */
    setApiKey(apiKey) {
        super.setApiKey(apiKey);
        this.client = null; // 重置客户端
    }

    /**
     * 设置模型
     */
    setModel(model) {
        this.model = model;
    }

    /**
     * 设置图片尺寸
     */
    setSize(size) {
        this.size = size;
    }

    /**
     * 生成图片
     * @param {string} prompt - 增强后的 prompt
     * @param {object} options - 生成选项
     * @returns {Promise<{url: string, revisedPrompt?: string}>}
     */
    async generateImage(prompt, options = {}) {
        const client = this.getClient();
        if (!client) {
            throw new Error('请先配置 OpenAI API Key');
        }

        const model = options.model || this.model;
        const size = options.size || this.size;

        try {
            const response = await client.images.generate({
                model,
                prompt,
                n: 1,
                size,
                quality: model === 'dall-e-3' ? 'hd' : undefined,
            });

            const image = response.data[0];
            return {
                url: image.url,
                revisedPrompt: image.revised_prompt
            };
        } catch (error) {
            console.error('OpenAI 图片生成失败:', error);
            throw new Error(error.message || '图片生成失败，请稍后重试');
        }
    }

    /**
     * 检查服务健康状态
     */
    async checkHealth() {
        try {
            const client = this.getClient();
            if (!client) return false;

            // 简单检查 API 是否可用
            await client.models.list();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取可用模型列表
     */
    getAvailableModels() {
        return [
            { id: 'dall-e-3', name: 'DALL-E 3', recommended: true },
            { id: 'dall-e-2', name: 'DALL-E 2' }
        ];
    }

    /**
     * 获取供应商名称
     */
    getName() {
        return 'OpenAI DALL-E';
    }
}

export default OpenAIProvider;
