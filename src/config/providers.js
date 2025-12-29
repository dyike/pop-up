// AI 绘图供应商配置

export const PROVIDERS = {
    openai: {
        id: 'openai',
        name: 'OpenAI DALL-E',
        icon: '🤖',
        description: 'OpenAI 的 DALL-E 图像生成模型，质量高，推荐使用',
        enabled: true,
        models: [
            { id: 'dall-e-3', name: 'DALL-E 3', recommended: true },
            { id: 'dall-e-2', name: 'DALL-E 2' }
        ],
        defaultModel: 'dall-e-3',
        sizes: {
            'dall-e-3': ['1024x1024', '1792x1024', '1024x1792'],
            'dall-e-2': ['256x256', '512x512', '1024x1024']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHelp: 'https://platform.openai.com/api-keys'
    },

    // 豆包（字节跳动）
    doubao: {
        id: 'doubao',
        name: '豆包',
        icon: '🫘',
        description: '字节跳动豆包大模型，支持中文理解',
        enabled: true,
        models: [
            { id: 'doubao-seedu-20241210', name: 'Seed-U', recommended: true },
            { id: 'doubao-seede-241210', name: 'Seed-E' }
        ],
        defaultModel: 'doubao-seedu-20241210',
        sizes: {
            'doubao-seedu-20241210': ['1024x1024', '768x1024', '1024x768'],
            'doubao-seede-241210': ['1024x1024', '768x1024', '1024x768']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: '输入 API Key...',
        apiKeyHelp: 'https://console.volcengine.com/ark'
    },

    // 智谱 AI
    zhipu: {
        id: 'zhipu',
        name: '智谱 CogView',
        icon: '🎨',
        description: '智谱 AI 文生图模型，国产优质选择',
        enabled: true,
        models: [
            { id: 'cogview-3-plus', name: 'CogView-3-Plus', recommended: true },
            { id: 'cogview-3', name: 'CogView-3' }
        ],
        defaultModel: 'cogview-3-plus',
        sizes: {
            'cogview-3-plus': ['1024x1024', '768x1344', '1344x768'],
            'cogview-3': ['1024x1024']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: '输入 API Key...',
        apiKeyHelp: 'https://open.bigmodel.cn/'
    },

    // 通义万相（阿里云）
    tongyi: {
        id: 'tongyi',
        name: '通义万相',
        icon: '✨',
        description: '阿里云通义万相图像生成',
        enabled: true,
        models: [
            { id: 'wanx-v1', name: '万相 V1', recommended: true },
            { id: 'wanx2.1-t2i-turbo', name: '万相 2.1 Turbo' }
        ],
        defaultModel: 'wanx-v1',
        sizes: {
            'wanx-v1': ['1024x1024', '720x1280', '1280x720'],
            'wanx2.1-t2i-turbo': ['1024x1024', '720x1280', '1280x720']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: '输入 API Key...',
        apiKeyHelp: 'https://dashscope.console.aliyun.com/'
    },

    // Stability AI
    stabilityai: {
        id: 'stabilityai',
        name: 'Stable Diffusion',
        icon: '🖼️',
        description: 'Stability AI 开源图像生成模型',
        enabled: true,
        models: [
            { id: 'stable-diffusion-xl-1024-v1-0', name: 'SDXL 1.0', recommended: true },
            { id: 'stable-diffusion-v1-6', name: 'SD 1.6' }
        ],
        defaultModel: 'stable-diffusion-xl-1024-v1-0',
        sizes: {
            'stable-diffusion-xl-1024-v1-0': ['1024x1024', '1152x896', '896x1152'],
            'stable-diffusion-v1-6': ['512x512', '768x768']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: 'sk-...',
        apiKeyHelp: 'https://platform.stability.ai/'
    },

    // Replicate
    replicate: {
        id: 'replicate',
        name: 'Replicate',
        icon: '🔄',
        description: '支持多种开源模型的云平台',
        enabled: true,
        models: [
            { id: 'flux-schnell', name: 'Flux Schnell', recommended: true },
            { id: 'flux-dev', name: 'Flux Dev' },
            { id: 'sdxl', name: 'SDXL' }
        ],
        defaultModel: 'flux-schnell',
        sizes: {
            'flux-schnell': ['1024x1024', '1024x768', '768x1024'],
            'flux-dev': ['1024x1024', '1024x768', '768x1024'],
            'sdxl': ['1024x1024', '1152x896', '896x1152']
        },
        defaultSize: '1024x1024',
        apiKeyPlaceholder: 'r8_...',
        apiKeyHelp: 'https://replicate.com/account/api-tokens'
    }
};

// 默认供应商
export const DEFAULT_PROVIDER = 'openai';

// 获取启用的供应商列表
export const getEnabledProviders = () =>
    Object.values(PROVIDERS).filter(p => p.enabled);

// 根据ID获取供应商
export const getProviderById = (id) => PROVIDERS[id];

// 获取所有供应商列表（包括未启用的）
export const getAllProviders = () => Object.values(PROVIDERS);
