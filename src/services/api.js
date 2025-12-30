// 前端 API 客户端
// 统一的后端 API 调用接口

const API_BASE = 'http://localhost:3001/api';

// 通用请求函数
async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        return {
            success: false,
            error: error.message || '网络请求失败',
        };
    }
}

// ============ 设置 API ============

export const settingsApi = {
    getAll: () => request('/settings'),
    get: (key) => request(`/settings/${key}`),
    set: (key, value) =>
        request(`/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
        }),
    getConfiguredProviders: () => request('/settings/api-keys/list'),
    getApiKeyStatus: (provider) => request(`/settings/api-keys/${provider}`),
    saveApiKey: (provider, apiKey, baseUrl = '', modelName = '') =>
        request(`/settings/api-keys/${provider}`, {
            method: 'PUT',
            body: JSON.stringify({ apiKey, baseUrl, modelName }),
        }),
    deleteApiKey: (provider) =>
        request(`/settings/api-keys/${provider}`, { method: 'DELETE' }),

    // LLM 配置（故事生成用）
    getLLMConfig: () => request('/settings/llm-config'),
    saveLLMConfig: (apiKey, baseUrl = '', modelName = '') =>
        request('/settings/llm-config', {
            method: 'PUT',
            body: JSON.stringify({ apiKey, baseUrl, modelName }),
        }),
};

// ============ 图片 API ============

export const imagesApi = {
    getAll: (favoritesOnly = false) =>
        request(`/images${favoritesOnly ? '?favorites=true' : ''}`),
    get: (id) => request(`/images/${id}`),
    toggleFavorite: (id) =>
        request(`/images/${id}/favorite`, { method: 'PATCH' }),
    delete: (id) =>
        request(`/images/${id}`, { method: 'DELETE' }),
    batchDelete: (ids) =>
        request('/images/batch-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
};

// ============ 生成 API ============

export const generateApi = {
    generate: (story, style, provider) =>
        request('/generate', {
            method: 'POST',
            body: JSON.stringify({ story, style, provider }),
        }),
    getConfiguredProviders: () => request('/generate/providers'),
};

// ============ 绘本 API ============

export const storybookApi = {
    // 获取绘本列表
    getAll: (favoritesOnly = false) =>
        request(`/storybook${favoritesOnly ? '?favorites=true' : ''}`),

    // 获取单个绘本（含所有页面）
    get: (id) => request(`/storybook/${id}`),

    // 生成绘本
    generate: (theme, sceneCount, style, provider) =>
        request('/storybook/generate', {
            method: 'POST',
            body: JSON.stringify({ theme, sceneCount, style, provider }),
        }),

    // 获取生成状态
    getStatus: (id) => request(`/storybook/${id}/status`),

    // 切换收藏
    toggleFavorite: (id) =>
        request(`/storybook/${id}/favorite`, { method: 'PATCH' }),

    // 删除绘本
    delete: (id) =>
        request(`/storybook/${id}`, { method: 'DELETE' }),
};

// 健康检查
export const healthApi = {
    check: () => request('/health'),
};

export default {
    settings: settingsApi,
    images: imagesApi,
    generate: generateApi,
    storybook: storybookApi,
    health: healthApi,
};
