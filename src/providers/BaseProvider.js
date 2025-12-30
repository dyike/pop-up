// AI 绘图供应商基类
// 所有供应商都需要继承此类并实现相应方法

export class BaseProvider {
    constructor(config = {}) {
        this.config = config;
        this.apiKey = config.apiKey || '';
        this.baseUrl = config.baseUrl || '';
        this.modelName = config.modelName || '';
    }

    /**
     * 设置 API Key
     * @param {string} apiKey 
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * 设置 Base URL
     * @param {string} baseUrl 
     */
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
    }

    /**
     * 设置自定义 Model Name
     * @param {string} modelName 
     */
    setModelName(modelName) {
        this.modelName = modelName;
    }

    /**
     * 设置完整配置
     * @param {object} config - { apiKey, baseUrl, modelName }
     */
    setConfig(config = {}) {
        if (config.apiKey) this.apiKey = config.apiKey;
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.modelName) this.modelName = config.modelName;
    }

    /**
     * 获取实际使用的 Base URL
     * @returns {string}
     */
    getBaseUrl() {
        return this.baseUrl || this.getDefaultBaseUrl();
    }

    /**
     * 获取默认 Base URL（子类可重写）
     * @returns {string}
     */
    getDefaultBaseUrl() {
        return '';
    }

    /**
     * 获取实际使用的 Model Name
     * @returns {string}
     */
    getModelName() {
        return this.modelName || this.getDefaultModelName();
    }

    /**
     * 获取默认 Model Name（子类可重写）
     * @returns {string}
     */
    getDefaultModelName() {
        return '';
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

