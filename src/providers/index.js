// AI Provider 管理器
// 统一管理所有 AI 绘图供应商

import { OpenAIProvider } from './OpenAIProvider';
import {
    DoubaoProvider,
    ZhipuProvider,
    TongyiProvider,
    StabilityProvider,
    ReplicateProvider,
    GeminiProvider
} from './GenericProviders';
import { DEFAULT_PROVIDER, getProviderById } from '../config/providers';

// 供应商实例缓存
const providerInstances = {};

// 供应商类映射
const providerClasses = {
    openai: OpenAIProvider,
    doubao: DoubaoProvider,
    zhipu: ZhipuProvider,
    tongyi: TongyiProvider,
    stabilityai: StabilityProvider,
    replicate: ReplicateProvider,
    gemini: GeminiProvider,
};

/**
 * 获取供应商实例
 * @param {string} providerId - 供应商 ID
 * @returns {BaseProvider}
 */
export function getProvider(providerId = DEFAULT_PROVIDER) {
    // 检查缓存
    if (providerInstances[providerId]) {
        return providerInstances[providerId];
    }

    // 创建新实例
    const ProviderClass = providerClasses[providerId];
    if (!ProviderClass) {
        throw new Error(`未知的供应商: ${providerId}`);
    }

    const config = getProviderById(providerId);
    const instance = new ProviderClass({
        model: config?.defaultModel,
        size: config?.defaultSize
    });

    providerInstances[providerId] = instance;
    return instance;
}

/**
 * 设置供应商的 API Key
 * @param {string} providerId - 供应商 ID
 * @param {string} apiKey - API Key
 */
export function setProviderApiKey(providerId, apiKey) {
    const provider = getProvider(providerId);
    provider.setApiKey(apiKey);
}

/**
 * 检查供应商是否已配置
 * @param {string} providerId - 供应商 ID
 * @returns {boolean}
 */
export function isProviderConfigured(providerId = DEFAULT_PROVIDER) {
    const provider = getProvider(providerId);
    return provider.isConfigured();
}

/**
 * 使用指定供应商生成图片
 * @param {string} prompt - 增强后的 prompt
 * @param {object} options - 生成选项
 * @returns {Promise<{url: string, revisedPrompt?: string}>}
 */
export async function generateImage(prompt, options = {}) {
    const providerId = options.provider || DEFAULT_PROVIDER;
    const provider = getProvider(providerId);

    if (!provider.isConfigured()) {
        throw new Error(`请先配置 ${provider.getName()} 的 API Key`);
    }

    return provider.generateImage(prompt, options);
}

// 导出所有 Provider 类
export {
    OpenAIProvider,
    DoubaoProvider,
    ZhipuProvider,
    TongyiProvider,
    StabilityProvider,
    ReplicateProvider,
    GeminiProvider
};
