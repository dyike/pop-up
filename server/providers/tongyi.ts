// 通义万相 Provider
import type { GenerateImageResult } from '../types/index.js';

interface TongyiOptions {
    prompt: string;
    apiKey: string;
    model?: string;
    size?: string;
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateWithTongyi(options: TongyiOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, model = 'wanx-v1', size = '1024x1024' } = options;

    // 提交任务
    const submitResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify({
            model,
            input: { prompt },
            parameters: { size, n: 1 }
        })
    });

    if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new Error(error.message || '通义万相提交失败');
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.output.task_id;

    // 轮询结果
    for (let i = 0; i < 60; i++) {
        await sleep(2000);

        const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        const statusData = await statusResponse.json();

        if (statusData.output.task_status === 'SUCCEEDED') {
            return {
                url: statusData.output.results[0].url,
                revisedPrompt: statusData.output.results[0].prompt || prompt
            };
        } else if (statusData.output.task_status === 'FAILED') {
            throw new Error(statusData.output.message || '生成失败');
        }
    }

    throw new Error('生成超时');
}
