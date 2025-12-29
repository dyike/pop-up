// 故事生成服务 - 使用 LLM 生成故事并拆解为场景
import db from '../db/index.js';

// 故事生成 Prompt 模板
const STORY_PROMPT_TEMPLATE = `你是一个专业的儿童绘本作家。请为3岁以下幼儿创作一个关于"{theme}"的简短故事。

要求：
1. 故事要温馨、有趣、积极向上
2. 语言要简单，适合幼儿理解
3. 将故事分成{sceneCount}个场景/页面
4. 每个场景2-3句话
5. 给整个故事起一个吸引人的标题

请严格按照以下 JSON 格式返回：
{
  "title": "故事标题",
  "scenes": [
    {
      "index": 1,
      "text": "场景1的故事内容",
      "imagePrompt": "用英文描述这个场景的插画，包含角色、动作、场景、氛围等"
    }
  ]
}

注意：imagePrompt 必须是英文，要详细描述画面内容，适合用于AI绘图。`;

export interface Scene {
    index: number;
    text: string;
    imagePrompt: string;
}

export interface GeneratedStory {
    title: string;
    scenes: Scene[];
}

/**
 * 调用 LLM 生成故事
 */
export async function generateStoryWithLLM(
    theme: string,
    sceneCount: number,
    provider: string,
    apiKey: string
): Promise<GeneratedStory> {
    const prompt = STORY_PROMPT_TEMPLATE
        .replace('{theme}', theme)
        .replace('{sceneCount}', sceneCount.toString());

    let content: string;

    // 根据不同供应商调用对应的 LLM API
    switch (provider) {
        case 'openai':
            content = await callOpenAIChat(prompt, apiKey);
            break;
        case 'doubao':
            content = await callDoubaoChat(prompt, apiKey);
            break;
        case 'zhipu':
            content = await callZhipuChat(prompt, apiKey);
            break;
        default:
            // 默认使用 OpenAI
            content = await callOpenAIChat(prompt, apiKey);
    }

    // 解析 JSON 结果
    try {
        // 提取 JSON 部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('无法解析故事内容');
        }
        const story = JSON.parse(jsonMatch[0]) as GeneratedStory;

        // 验证结构
        if (!story.title || !Array.isArray(story.scenes) || story.scenes.length === 0) {
            throw new Error('故事格式不正确');
        }

        return story;
    } catch (error) {
        console.error('解析故事失败:', error, content);
        throw new Error('故事生成失败，请重试');
    }
}

/**
 * 调用 OpenAI Chat API
 */
async function callOpenAIChat(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: '你是一个专业的儿童绘本作家。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI 调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 调用豆包 Chat API
 */
async function callDoubaoChat(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'doubao-pro-32k',
            messages: [
                { role: 'system', content: '你是一个专业的儿童绘本作家。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '豆包调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 调用智谱 Chat API
 */
async function callZhipuChat(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
                { role: 'system', content: '你是一个专业的儿童绘本作家。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '智谱调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 获取用于故事生成的 API Key
 * 优先使用 OpenAI，然后豆包，然后智谱
 */
export function getStoryApiKey(): { provider: string; apiKey: string } | null {
    const providers = ['openai', 'doubao', 'zhipu'];

    for (const provider of providers) {
        const row = db.prepare('SELECT api_key FROM api_keys WHERE provider = ?').get(provider) as { api_key: string } | undefined;
        if (row?.api_key) {
            return { provider, apiKey: row.api_key };
        }
    }

    return null;
}
