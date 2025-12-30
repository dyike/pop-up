// 豆包 Provider
import type { GenerateImageResult } from '../types/index.js';

interface DoubaoOptions {
    prompt: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    size?: string;
}

const DEFAULT_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3';

export async function generateWithDoubao(options: DoubaoOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, baseUrl, model = 'doubao-seedu-20241210', size = '1024x1024' } = options;
    const [width, height] = size.split('x').map(Number);
    const base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const endpoint = `${base}/images/generations`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
}

