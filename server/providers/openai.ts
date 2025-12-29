// OpenAI DALL-E Provider
import type { GenerateImageResult } from '../types/index.js';

interface OpenAIOptions {
    prompt: string;
    apiKey: string;
    model?: string;
    size?: string;
}

export async function generateWithOpenAI(options: OpenAIOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, model = 'dall-e-3', size = '1024x1024' } = options;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
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
            quality: model === 'dall-e-3' ? 'hd' : undefined
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI 生成失败');
    }

    const data = await response.json();
    const image = data.data[0];

    return {
        url: image.url,
        revisedPrompt: image.revised_prompt
    };
}
