// 通用 Provider 实现
// 使用 fetch 直接调用各种 API，避免安装额外的 SDK

import { BaseProvider } from './BaseProvider';

/**
 * 豆包（字节跳动）图像生成 Provider
 */
export class DoubaoProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.model = config.model || 'doubao-seedu-20241210';
        this.size = config.size || '1024x1024';
    }

    getDefaultBaseUrl() {
        return 'https://ark.cn-beijing.volces.com/api/v3';
    }

    getDefaultModelName() {
        return 'doubao-seedu-20241210';
    }

    async generateImage(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('请先配置豆包 API Key');
        }

        const model = this.getModelName() || options.model || this.model;
        const size = options.size || this.size;
        const [width, height] = size.split('x').map(Number);
        const baseUrl = this.getBaseUrl();

        try {
            const response = await fetch(`${baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    prompt,
                    n: 1,
                    size,
                    width,
                    height
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '豆包生成失败');
            }

            const data = await response.json();
            return {
                url: data.data[0].url,
                revisedPrompt: prompt
            };
        } catch (error) {
            console.error('豆包生成失败:', error);
            throw error;
        }
    }

    getName() {
        return '豆包';
    }
}

/**
 * 智谱 CogView Provider
 */
export class ZhipuProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.model = config.model || 'cogview-3-plus';
        this.size = config.size || '1024x1024';
    }

    getDefaultBaseUrl() {
        return 'https://open.bigmodel.cn/api/paas/v4';
    }

    getDefaultModelName() {
        return 'cogview-3-plus';
    }

    async generateImage(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('请先配置智谱 API Key');
        }

        const model = this.getModelName() || options.model || this.model;
        const size = options.size || this.size;
        const baseUrl = this.getBaseUrl();

        try {
            const response = await fetch(`${baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    prompt,
                    size
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || '智谱生成失败');
            }

            const data = await response.json();
            return {
                url: data.data[0].url,
                revisedPrompt: prompt
            };
        } catch (error) {
            console.error('智谱生成失败:', error);
            throw error;
        }
    }

    getName() {
        return '智谱 CogView';
    }
}

/**
 * 通义万相 Provider
 */
export class TongyiProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.model = config.model || 'wanx-v1';
        this.size = config.size || '1024x1024';
    }

    getDefaultBaseUrl() {
        return 'https://dashscope.aliyuncs.com/api/v1';
    }

    getDefaultModelName() {
        return 'wanx-v1';
    }

    async generateImage(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('请先配置通义万相 API Key');
        }

        const model = this.getModelName() || options.model || this.model;
        const size = options.size || this.size;
        const baseUrl = this.getBaseUrl();

        try {
            // 通义万相使用异步任务模式
            const response = await fetch(`${baseUrl}/services/aigc/text2image/image-synthesis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-DashScope-Async': 'enable'
                },
                body: JSON.stringify({
                    model,
                    input: {
                        prompt
                    },
                    parameters: {
                        size,
                        n: 1
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '通义万相生成失败');
            }

            const data = await response.json();
            const taskId = data.output.task_id;

            // 轮询获取结果
            return await this.pollResult(taskId);
        } catch (error) {
            console.error('通义万相生成失败:', error);
            throw error;
        }
    }

    async pollResult(taskId, maxAttempts = 60) {
        const baseUrl = this.getBaseUrl();
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            const data = await response.json();

            if (data.output.task_status === 'SUCCEEDED') {
                return {
                    url: data.output.results[0].url,
                    revisedPrompt: data.output.results[0].prompt || ''
                };
            } else if (data.output.task_status === 'FAILED') {
                throw new Error(data.output.message || '生成失败');
            }
        }
        throw new Error('生成超时');
    }

    getName() {
        return '通义万相';
    }
}

/**
 * Stability AI Provider
 */
export class StabilityProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.model = config.model || 'stable-diffusion-xl-1024-v1-0';
        this.size = config.size || '1024x1024';
    }

    getDefaultBaseUrl() {
        return 'https://api.stability.ai/v1';
    }

    getDefaultModelName() {
        return 'stable-diffusion-xl-1024-v1-0';
    }

    async generateImage(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('请先配置 Stability AI API Key');
        }

        const model = this.getModelName() || options.model || this.model;
        const size = options.size || this.size;
        const [width, height] = size.split('x').map(Number);
        const baseUrl = this.getBaseUrl();

        try {
            const response = await fetch(
                `${baseUrl}/generation/${model}/text-to-image`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        text_prompts: [{ text: prompt }],
                        cfg_scale: 7,
                        width,
                        height,
                        samples: 1,
                        steps: 30
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Stability AI 生成失败');
            }

            const data = await response.json();
            // Stability AI 返回 base64 图片
            const base64Image = data.artifacts[0].base64;
            return {
                url: `data:image/png;base64,${base64Image}`,
                revisedPrompt: prompt
            };
        } catch (error) {
            console.error('Stability AI 生成失败:', error);
            throw error;
        }
    }

    getName() {
        return 'Stable Diffusion';
    }
}

/**
 * Replicate Provider
 */
export class ReplicateProvider extends BaseProvider {
    constructor(config = {}) {
        super(config);
        this.model = config.model || 'flux-schnell';
        this.size = config.size || '1024x1024';
    }

    getDefaultBaseUrl() {
        return 'https://api.replicate.com/v1';
    }

    getDefaultModelName() {
        return 'flux-schnell';
    }

    getModelVersion() {
        const model = this.getModelName() || this.model;
        const versions = {
            'flux-schnell': 'black-forest-labs/flux-schnell',
            'flux-dev': 'black-forest-labs/flux-dev',
            'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
        };
        return versions[model] || model;
    }

    async generateImage(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('请先配置 Replicate API Key');
        }

        const size = options.size || this.size;
        const [width, height] = size.split('x').map(Number);
        const baseUrl = this.getBaseUrl();

        try {
            const response = await fetch(`${baseUrl}/predictions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.apiKey}`
                },
                body: JSON.stringify({
                    version: this.getModelVersion(),
                    input: {
                        prompt,
                        width,
                        height
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Replicate 生成失败');
            }

            const prediction = await response.json();

            // 轮询获取结果
            return await this.pollPrediction(prediction.urls.get);
        } catch (error) {
            console.error('Replicate 生成失败:', error);
            throw error;
        }
    }

    async pollPrediction(url, maxAttempts = 60) {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${this.apiKey}`
                }
            });

            const prediction = await response.json();

            if (prediction.status === 'succeeded') {
                const output = prediction.output;
                const imageUrl = Array.isArray(output) ? output[0] : output;
                return {
                    url: imageUrl,
                    revisedPrompt: ''
                };
            } else if (prediction.status === 'failed') {
                throw new Error(prediction.error || '生成失败');
            }
        }
        throw new Error('生成超时');
    }

    getName() {
        return 'Replicate';
    }
}
