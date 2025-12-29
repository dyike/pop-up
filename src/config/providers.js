// AI 绘图供应商配置

export const PROVIDERS = {
    openai: {
        id: 'openai',
        name: 'OpenAI DALL-E',
        description: 'OpenAI 的 DALL-E 图像生成模型',
        enabled: true,
        models: [
            { id: 'dall-e-3', name: 'DALL-E 3', recommended: true },
            { id: 'dall-e-2', name: 'DALL-E 2' }
        ],
        defaultModel: 'dall-e-3',
        // 图片尺寸选项
        sizes: {
            'dall-e-3': ['1024x1024', '1792x1024', '1024x1792'],
            'dall-e-2': ['256x256', '512x512', '1024x1024']
        },
        defaultSize: '1024x1024'
    },
    // 预留：通义万相
    tongyi: {
        id: 'tongyi',
        name: '通义万相',
        description: '阿里云通义万相图像生成',
        enabled: false, // 暂未实现
        models: [
            { id: 'wanx-v1', name: '万相 V1' }
        ],
        defaultModel: 'wanx-v1'
    },
    // 预留：Stable Diffusion
    stabilityai: {
        id: 'stabilityai',
        name: 'Stable Diffusion',
        description: 'Stability AI 的开源图像生成模型',
        enabled: false,
        models: [
            { id: 'stable-diffusion-xl', name: 'SDXL' }
        ],
        defaultModel: 'stable-diffusion-xl'
    }
};

// 默认供应商
export const DEFAULT_PROVIDER = 'openai';

// 获取启用的供应商列表
export const getEnabledProviders = () =>
    Object.values(PROVIDERS).filter(p => p.enabled);

// 根据ID获取供应商
export const getProviderById = (id) => PROVIDERS[id];
