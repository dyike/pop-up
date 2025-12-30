// Gemini 图片生成 Provider
// 支持 Google Gemini API (使用 generateContent 端点)
import type { GenerateImageResult } from '../types/index.js';

interface GeminiOptions {
    prompt: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    size?: string;
}

// 默认使用 Google API
const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com';

export async function generateWithGemini(options: GeminiOptions): Promise<GenerateImageResult> {
    const { prompt, apiKey, baseUrl, model = 'gemini-2.0-flash-exp', size = '1024x1024' } = options;

    // 移除末尾斜杠
    let base = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');

    // 如果 base URL 不包含 v1beta 或 v1，添加 /v1beta
    if (!base.includes('/v1beta') && !base.includes('/v1/')) {
        base = `${base}/v1beta`;
    }

    // Gemini 使用 generateContent 端点
    const endpoint = `${base}/models/${model}:generateContent`;

    console.log(`🔗 Gemini 请求: endpoint=${endpoint}, model=${model}`);

    // 构建请求体 - Gemini 图片生成格式
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],  // 请求图片输出
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192
        }
    };

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
                'Authorization': `Bearer ${apiKey}`  // 有些代理可能使用 Bearer
            },
            body: JSON.stringify(requestBody)
        });
    } catch (fetchError) {
        console.error('❌ Gemini 网络请求失败:', fetchError);
        throw new Error(`无法连接到 Gemini 服务: ${(fetchError as Error).message}`);
    }

    // 读取响应文本
    const responseText = await response.text();

    if (!responseText || responseText.trim() === '') {
        console.error('❌ Gemini 返回空响应, status:', response.status);
        throw new Error(`Gemini 返回空响应 (HTTP ${response.status})`);
    }

    // 尝试解析 JSON
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error('❌ Gemini 响应不是有效的 JSON:', responseText.slice(0, 500));
        throw new Error(`无法解析 Gemini 响应: ${responseText.slice(0, 200)}`);
    }

    // 检查错误响应
    if (!response.ok) {
        console.error('❌ Gemini 返回错误:', data);
        const errorMessage = data.error?.message || data.message || `Gemini 生成失败 (HTTP ${response.status})`;
        throw new Error(errorMessage);
    }

    console.log('📦 Gemini 响应结构:', JSON.stringify(data, null, 2).slice(0, 500));

    // 解析 generateContent 响应格式
    // 格式: { candidates: [{ content: { parts: [{ inlineData: { mimeType, data } }] } }] }
    if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        const parts = candidate.content?.parts || [];

        for (const part of parts) {
            // 检查 inlineData (base64 图片)
            if (part.inlineData) {
                const { mimeType, data: imageData } = part.inlineData;
                return {
                    url: `data:${mimeType || 'image/png'};base64,${imageData}`,
                    revisedPrompt: prompt
                };
            }

            // 检查 fileData (URL 格式)
            if (part.fileData) {
                return {
                    url: part.fileData.fileUri || part.fileData.uri,
                    revisedPrompt: prompt
                };
            }

            // 检查 image 字段
            if (part.image) {
                if (part.image.url) {
                    return { url: part.image.url, revisedPrompt: prompt };
                }
                if (part.image.base64 || part.image.data) {
                    return {
                        url: `data:image/png;base64,${part.image.base64 || part.image.data}`,
                        revisedPrompt: prompt
                    };
                }
            }
        }
    }

    // 尝试 Imagen 格式响应
    if (data.predictions && data.predictions.length > 0) {
        const prediction = data.predictions[0];
        if (prediction.bytesBase64Encoded) {
            return {
                url: `data:${prediction.mimeType || 'image/png'};base64,${prediction.bytesBase64Encoded}`,
                revisedPrompt: prompt
            };
        }
    }

    // 尝试简单格式
    if (data.images && data.images.length > 0) {
        const image = data.images[0];
        return {
            url: image.url || `data:image/png;base64,${image.base64 || image.data}`,
            revisedPrompt: prompt
        };
    }

    // 尝试 OpenAI 兼容格式
    if (data.data && data.data.length > 0) {
        const image = data.data[0];
        return {
            url: image.url || `data:image/png;base64,${image.b64_json}`,
            revisedPrompt: image.revised_prompt || prompt
        };
    }

    console.error('❌ Gemini 响应格式未知，完整响应:', JSON.stringify(data, null, 2));
    throw new Error('Gemini 响应中未找到图片数据。请检查模型是否支持图片生成。');
}
