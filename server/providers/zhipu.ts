// 智谱 CogView Provider
import type { GenerateImageResult } from '../types/index.js';

interface ZhipuOptions {
    prompt: string;
    apiKey: string;
    model?: string;
    size?: string;
}

export async function generateWithZhipu(options: ZhipuOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, model = 'cogview-3-plus', size = '1024x1024' } = options;

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
}
