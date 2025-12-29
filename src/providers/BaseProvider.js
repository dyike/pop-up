// AI 绘图供应商基类
// 所有供应商都需要继承此类并实现相应方法

export class BaseProvider {
    constructor(config = {}) {
        this.config = config;
        this.apiKey = config.apiKey || '';
    }

    /**
     * 设置 API Key
     * @param {string} apiKey 
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * 检查是否已配置
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * 生成图片
     * @param {string} prompt - 增强后的 prompt
     * @param {object} options - 生成选项
     * @returns {Promise<{url: string, revisedPrompt?: string}>}
     */
    async generateImage(prompt, options = {}) {
        throw new Error('generateImage 方法必须由子类实现');
    }

    /**
     * 检查服务健康状态
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        throw new Error('checkHealth 方法必须由子类实现');
    }

    /**
     * 获取可用模型列表
     * @returns {Array<{id: string, name: string}>}
     */
    getAvailableModels() {
        return [];
    }

    /**
     * 获取供应商名称
     * @returns {string}
     */
    getName() {
        return 'Base Provider';
    }
}

export default BaseProvider;
