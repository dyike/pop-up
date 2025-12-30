// OpenAI DALL-E Provider
import type { GenerateImageResult } from '../types/index.js';

interface OpenAIOptions {
    prompt: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    size?: string;
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

export async function generateWithOpenAI(options: OpenAIOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, baseUrl, model = 'dall-e-3', size = '1024x1024' } = options;
    // 移除末尾斜杠以避免双斜杠问题
    const base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const endpoint = `${base}/images/generations`;

    console.log(`🔗 OpenAI 请求: endpoint=${endpoint}, model=${model}`);

    let response: Response;
    try {
        response = await fetch(endpoint, {
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
    } catch (fetchError) {
        console.error('❌ 网络请求失败:', fetchError);
        throw new Error(`无法连接到图片生成服务: ${(fetchError as Error).message}`);
    }

    // 读取响应文本
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
        console.error('❌ 服务器返回空响应, status:', response.status);
        throw new Error(`图片生成服务返回空响应 (HTTP ${response.status})。请检查服务器是否支持 /images/generations 端点。`);
    }

    // 尝试解析 JSON
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error('❌ 响应不是有效的 JSON:', responseText.slice(0, 500));
        throw new Error(`无法解析服务器响应: ${responseText.slice(0, 200)}`);
    }

    // 检查错误响应
    if (!response.ok) {
        console.error('❌ 服务器返回错误:', data);
        throw new Error(data.error?.message || data.message || `图片生成失败 (HTTP ${response.status})`);
    }

    // 检查响应格式
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        console.error('❌ 响应格式不正确:', data);
        throw new Error('服务器响应格式不正确，缺少 data 数组');
    }

    const image = data.data[0];

    if (!image.url && !image.b64_json) {
        console.error('❌ 图片数据缺失:', image);
        throw new Error('服务器响应中缺少图片 URL 或 base64 数据');
    }

    return {
        url: image.url || `data:image/png;base64,${image.b64_json}`,
        revisedPrompt: image.revised_prompt
    };
}


