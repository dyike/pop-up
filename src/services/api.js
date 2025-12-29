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
    // 获取所有设置
    getAll: () => request('/settings'),

    // 获取单个设置
    get: (key) => request(`/settings/${key}`),

    // 更新设置
    set: (key, value) =>
        request(`/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
        }),

    // 获取已配置的供应商列表
    getConfiguredProviders: () =>
        request('/settings/api-keys/list'),

    // 获取 API Key 状态
    getApiKeyStatus: (provider) =>
        request(`/settings/api-keys/${provider}`),

    // 保存 API Key
    saveApiKey: (provider, apiKey) =>
        request(`/settings/api-keys/${provider}`, {
            method: 'PUT',
            body: JSON.stringify({ apiKey }),
        }),

    // 删除 API Key
    deleteApiKey: (provider) =>
        request(`/settings/api-keys/${provider}`, { method: 'DELETE' }),
};

// ============ 图片 API ============

export const imagesApi = {
    // 获取图片列表
    getAll: (favoritesOnly = false) =>
        request(`/images${favoritesOnly ? '?favorites=true' : ''}`),

    // 获取单个图片
    get: (id) => request(`/images/${id}`),

    // 切换收藏
    toggleFavorite: (id) =>
        request(`/images/${id}/favorite`, { method: 'PATCH' }),

    // 删除图片
    delete: (id) =>
        request(`/images/${id}`, { method: 'DELETE' }),

    // 批量删除
    batchDelete: (ids) =>
        request('/images/batch-delete', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
};

// ============ 生成 API ============

export const generateApi = {
    // 生成图片
    generate: (story, style, provider) =>
        request('/generate', {
            method: 'POST',
            body: JSON.stringify({ story, style, provider }),
        }),

    // 获取已配置的供应商
    getConfiguredProviders: () =>
        request('/generate/providers'),
};

// 健康检查
export const healthApi = {
    check: () => request('/health'),
};

export default {
    settings: settingsApi,
    images: imagesApi,
    generate: generateApi,
    health: healthApi,
};
