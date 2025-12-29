// 类型定义

// 设置相关
export interface Setting {
    key: string;
    value: string;
    updated_at?: string;
}

export interface ApiKey {
    provider: string;
    encrypted_key: string;
    updated_at?: string;
}

// 图片相关
export interface Image {
    id?: number;
    story: string;
    style: string;
    provider: string;
    image_url: string;
    image_data?: Buffer | null;
    enhanced_prompt?: string;
    revised_prompt?: string;
    is_favorite: number;
    created_at?: string;
}

export interface CreateImageRequest {
    story: string;
    style: string;
    provider: string;
    image_url: string;
    enhanced_prompt?: string;
    revised_prompt?: string;
}

// AI 生成相关
export interface GenerateRequest {
    story: string;
    style: string;
    provider: string;
}

export interface GenerateResponse {
    success: boolean;
    data?: {
        id: number;
        image_url: string;
        enhanced_prompt: string;
        revised_prompt?: string;
    };
    error?: string;
}

// Provider 相关
export interface ProviderConfig {
    id: string;
    name: string;
    icon: string;
    description: string;
    enabled: boolean;
    models: ProviderModel[];
    defaultModel: string;
    sizes?: Record<string, string[]>;
    defaultSize?: string;
}

export interface ProviderModel {
    id: string;
    name: string;
    recommended?: boolean;
}

export interface GenerateImageResult {
    url: string;
    revisedPrompt?: string;
}

// API 响应
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// 风格配置
export interface StyleConfig {
    id: string;
    name: string;
    nameEn: string;
    prompt: string;
    icon: string;
    description: string;
}
