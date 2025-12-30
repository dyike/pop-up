// Stability AI Provider
import type { GenerateImageResult } from '../types/index.js';

interface StabilityOptions {
    prompt: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    size?: string;
}

const DEFAULT_BASE_URL = 'https://api.stability.ai/v1';

export async function generateWithStability(options: StabilityOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, baseUrl, model = 'stable-diffusion-xl-1024-v1-0', size = '1024x1024' } = options;
    const [width, height] = size.split('x').map(Number);
    const base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const endpoint = `${base}/generation/${model}/text-to-image`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
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
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Stability AI 生成失败');
    }

    const data = await response.json();
    const base64Image = data.artifacts[0].base64;

    return {
        url: `data:image/png;base64,${base64Image}`,
        revisedPrompt: prompt
    };
}

