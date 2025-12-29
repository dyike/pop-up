// Prompt 增强服务
// 将用户输入的故事转换为适合 AI 绘图的 prompt，并确保儿童友好

import { getStyleById } from '../config/styles';

// 儿童友好安全词（会自动添加到所有 prompt）
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

// 图片质量增强词
const QUALITY_MODIFIERS = [
    'high quality',
    'detailed',
    'beautiful illustration',
    'vibrant colors',
    'professional artwork'
];

/**
 * 增强 prompt，使其适合生成儿童友好的插画
 * @param {string} userInput - 用户输入的故事/描述
 * @param {string} styleId - 选择的风格 ID
 * @param {object} options - 额外选项
 * @returns {string} 增强后的 prompt
 */
export function enhancePrompt(userInput, styleId = 'cartoon', options = {}) {
    const style = getStyleById(styleId);

    // 构建增强后的 prompt
    const parts = [];

    // 1. 添加场景描述（基于用户输入）
    const sceneDescription = convertToSceneDescription(userInput);
    parts.push(sceneDescription);

    // 2. 添加风格修饰
    parts.push(style.prompt);

    // 3. 添加儿童安全修饰
    parts.push(CHILD_SAFE_MODIFIERS.join(', '));

    // 4. 添加质量增强（可选）
    if (options.highQuality !== false) {
        parts.push(QUALITY_MODIFIERS.slice(0, 3).join(', '));
    }

    // 5. 添加自定义修饰（如果有）
    if (options.additionalModifiers) {
        parts.push(options.additionalModifiers);
    }

    return parts.join(', ');
}

/**
 * 将用户故事转换为场景描述
 * @param {string} story - 用户输入的故事
 * @returns {string} 场景描述
 */
function convertToSceneDescription(story) {
    // 清理输入
    let scene = story.trim();

    // 如果故事太长，提取关键场景
    if (scene.length > 200) {
        // 简单策略：取前200个字符
        scene = scene.slice(0, 200) + '...';
    }

    // 添加插画描述前缀
    return `Illustration of: ${scene}`;
}

/**
 * 生成适合朗读的文本
 * @param {string} text - 原始文本
 * @returns {string} 适合语音合成的文本
 */
export function prepareForSpeech(text) {
    // 清理文本，使其更适合朗读
    return text
        .replace(/\s+/g, ' ')  // 规范化空白
        .replace(/[。！？]/g, match => match + ' ')  // 句号后加空格
        .trim();
}

export default {
    enhancePrompt,
    prepareForSpeech
};
