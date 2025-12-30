// AI 服务 - 统一的 AI 调用接口
import { generateWithOpenAI } from '../providers/openai.js';
import { generateWithDoubao } from '../providers/doubao.js';
import { generateWithZhipu } from '../providers/zhipu.js';
import { generateWithTongyi } from '../providers/tongyi.js';
import { generateWithStability } from '../providers/stability.js';
import { generateWithReplicate } from '../providers/replicate.js';
import type { GenerateImageResult, StyleConfig } from '../types/index.js';

// 风格配置
const STYLES: Record<string, StyleConfig> = {
    cartoon: {
        id: 'cartoon',
        name: '可爱卡通',
        nameEn: 'Cute Cartoon',
        prompt: 'cute cartoon style, bright vivid colors, simple rounded shapes, child-friendly, kawaii, adorable characters, soft lighting',
        icon: '🎨',
        description: '明亮可爱的卡通风格'
    },
    watercolor: {
        id: 'watercolor',
        name: '水彩绘本',
        nameEn: 'Watercolor Storybook',
        prompt: 'watercolor illustration, soft pastel colors, storybook style, gentle brushstrokes, dreamy atmosphere, children book illustration',
        icon: '🖌️',
        description: '柔和梦幻的水彩画风'
    },
    sketch: {
        id: 'sketch',
        name: '简笔画',
        nameEn: 'Simple Sketch',
        prompt: 'simple line drawing, minimal colors, black outline, easy to understand, clean design, children doodle style',
        icon: '✏️',
        description: '简单清晰的线条画'
    },
    pixar: {
        id: 'pixar',
        name: '3D动画',
        nameEn: '3D Animation',
        prompt: 'pixar style 3D render, colorful, friendly characters, high quality, smooth textures, disney-like animation style',
        icon: '🎬',
        description: '精美的3D动画风格'
    },
    ghibli: {
        id: 'ghibli',
        name: '吉卜力',
        nameEn: 'Ghibli Style',
        prompt: 'studio ghibli style, anime illustration, warm colors, detailed background, magical atmosphere, miyazaki style',
        icon: '🏯',
        description: '温暖治愈的吉卜力风格'
    }
};

// 儿童友好安全词
const CHILD_SAFE_MODIFIERS = [
    'child-friendly',
    'safe for kids',
    'age-appropriate',
    'no violence',
    'no scary elements',
    'gentle',
    'wholesome',
    'cute',
    'friendly'
];

// 质量增强词
const QUALITY_MODIFIERS = [
    'high quality',
    'detailed',
    'beautiful illustration',
    'vibrant colors',
    'professional artwork'
];

/**
 * 增强 prompt
 */
export function enhancePrompt(story: string, styleId: string): string {
    const style = STYLES[styleId] || STYLES.cartoon;

    // 清理和限制故事长度
    let scene = story.trim();
    if (scene.length > 200) {
        scene = scene.slice(0, 200) + '...';
    }

    const parts = [
        `Illustration of: ${scene}`,
        style.prompt,
        CHILD_SAFE_MODIFIERS.join(', '),
        QUALITY_MODIFIERS.slice(0, 3).join(', ')
    ];

    return parts.join(', ');
}

/**
 * 生成图片的统一接口
 */
interface GenerateOptions {
    prompt: string;
    provider: string;
    apiKey: string;
    baseUrl?: string;
    model?: string;
    size?: string;
}

export async function generateImage(options: GenerateOptions): Promise<GenerateImageResult> {
    const { prompt, provider, apiKey, baseUrl, model, size } = options;

    switch (provider) {
        case 'openai':
            return generateWithOpenAI({ prompt, apiKey, baseUrl, model, size });
        case 'doubao':
            return generateWithDoubao({ prompt, apiKey, baseUrl, model, size });
        case 'zhipu':
            return generateWithZhipu({ prompt, apiKey, baseUrl, model, size });
        case 'tongyi':
            return generateWithTongyi({ prompt, apiKey, baseUrl, model, size });
        case 'stabilityai':
            return generateWithStability({ prompt, apiKey, baseUrl, model, size });
        case 'replicate':
            return generateWithReplicate({ prompt, apiKey, baseUrl, model, size });
        default:
            throw new Error(`不支持的供应商: ${provider}`);
    }
}

export { STYLES };
