// Replicate Provider
import type { GenerateImageResult } from '../types/index.js';

interface ReplicateOptions {
    prompt: string;
    apiKey: string;
    model?: string;
    size?: string;
}

const MODEL_VERSIONS: Record<string, string> = {
    'flux-schnell': 'black-forest-labs/flux-schnell',
    'flux-dev': 'black-forest-labs/flux-dev',
    'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
};

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateWithReplicate(options: ReplicateOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, model = 'flux-schnell', size = '1024x1024' } = options;
    const [width, height] = size.split('x').map(Number);
    const version = MODEL_VERSIONS[model] || MODEL_VERSIONS['flux-schnell'];

    // 创建预测
    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${apiKey}`
        },
        body: JSON.stringify({
            version,
            input: { prompt, width, height }
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Replicate 生成失败');
    }

    const prediction = await response.json();
    const pollUrl = prediction.urls.get;

    // 轮询结果
    for (let i = 0; i < 60; i++) {
        await sleep(2000);

        const statusResponse = await fetch(pollUrl, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'succeeded') {
            const output = statusData.output;
            const imageUrl = Array.isArray(output) ? output[0] : output;
            return { url: imageUrl, revisedPrompt: '' };
        } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || '生成失败');
        }
    }

    throw new Error('生成超时');
}
