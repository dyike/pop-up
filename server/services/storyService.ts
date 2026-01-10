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

export interface LLMConfig {
    apiKey: string;
    baseUrl: string;
    modelName: string;
}

function extractJsonBlock(content: string): string | null {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
        return null;
    }
    return content.slice(start, end + 1);
}

function escapeControlCharsInStrings(raw: string): string {
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < raw.length; i += 1) {
        const ch = raw[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                result += ch;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                result += ch;
                continue;
            }
            if (ch === '"') {
                inString = false;
                result += ch;
                continue;
            }
            if (ch === '\n') {
                result += '\\n';
                continue;
            }
            if (ch === '\r') {
                result += '\\r';
                continue;
            }
            if (ch === '\t') {
                result += '\\t';
                continue;
            }
            if (ch < ' ') {
                result += ' ';
                continue;
            }
            result += ch;
            continue;
        }

        if (ch === '"') {
            inString = true;
            result += ch;
            continue;
        }
        result += ch;
    }

    return result;
}

function removeTrailingCommas(raw: string): string {
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < raw.length; i += 1) {
        const ch = raw[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                result += ch;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                result += ch;
                continue;
            }
            if (ch === '"') {
                inString = false;
                result += ch;
                continue;
            }
            result += ch;
            continue;
        }

        if (ch === '"') {
            inString = true;
            result += ch;
            continue;
        }

        if (ch === ',') {
            let j = i + 1;
            while (j < raw.length && /\s/.test(raw[j])) {
                j += 1;
            }
            if (j < raw.length && (raw[j] === '}' || raw[j] === ']')) {
                continue;
            }
        }
        result += ch;
    }

    return result;
}

function parseStoryJson(content: string): GeneratedStory {
    const jsonBlock = extractJsonBlock(content);
    if (!jsonBlock) {
        throw new Error('无法解析故事内容');
    }

    try {
        return JSON.parse(jsonBlock) as GeneratedStory;
    } catch {
        const repaired = removeTrailingCommas(escapeControlCharsInStrings(jsonBlock));
        return JSON.parse(repaired) as GeneratedStory;
    }
}

/**
 * 获取 LLM 配置
 */
export function getLLMConfig(): LLMConfig | null {
    const row = db.prepare('SELECT api_key, base_url, model_name FROM llm_config WHERE id = 1').get() as {
        api_key: string;
        base_url: string;
        model_name: string
    } | undefined;

    if (!row?.api_key) {
        return null;
    }

    return {
        apiKey: row.api_key,
        baseUrl: row.base_url || 'https://api.openai.com/v1',
        modelName: row.model_name || 'gpt-4o-mini'
    };
}

/**
 * 调用 LLM 生成故事
 */
export async function generateStoryWithLLM(
    theme: string,
    sceneCount: number
): Promise<GeneratedStory> {
    const config = getLLMConfig();

    if (!config) {
        throw new Error('请先在设置中配置 LLM（故事生成）的 API Key');
    }

    const prompt = STORY_PROMPT_TEMPLATE
        .replace('{theme}', theme)
        .replace('{sceneCount}', sceneCount.toString());

    // 调用通用 Chat API
    const content = await callChatAPI(prompt, config);

    // 解析 JSON 结果
    try {
        const story = parseStoryJson(content);

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
 * 通用 Chat API 调用（兼容 OpenAI 格式的 API）
 */
async function callChatAPI(prompt: string, config: LLMConfig): Promise<string> {
    // 移除末尾斜杠
    const baseUrl = config.baseUrl.replace(/\/+$/, '');
    const endpoint = `${baseUrl}/chat/completions`;

    console.log(`🤖 LLM 请求: endpoint=${endpoint}, model=${config.modelName}`);

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.modelName,
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
        console.error('LLM 调用失败:', error);
        throw new Error(error.error?.message || 'LLM 调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * 获取用于故事生成的配置（兼容旧接口）
 * @deprecated 使用 getLLMConfig() 替代
 */
export function getStoryApiKey(): { provider: string; apiKey: string } | null {
    const config = getLLMConfig();
    if (!config) {
        return null;
    }
    return { provider: 'llm', apiKey: config.apiKey };
}
