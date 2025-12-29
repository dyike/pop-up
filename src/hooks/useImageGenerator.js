// 图片生成 Hook - 使用后端 API
import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateApi, settingsApi } from '../services/api';

export function useImageGenerator() {
    const { settings, setLoading, setError, setCurrentImage, addToGallery } = useAppStore();
    const [progress, setProgress] = useState('idle'); // 'idle' | 'generating' | 'done'
    const [isConfigured, setIsConfigured] = useState(false);
    const [checkingConfig, setCheckingConfig] = useState(true);

    // 检查当前供应商是否已配置 API Key
    const checkApiKeyStatus = useCallback(async () => {
        setCheckingConfig(true);
        try {
            const result = await settingsApi.getApiKeyStatus(settings.provider);
            if (result.success && result.data) {
                setIsConfigured(result.data.configured);
            } else {
                setIsConfigured(false);
            }
        } catch (error) {
            console.error('检查 API Key 状态失败:', error);
            setIsConfigured(false);
        } finally {
            setCheckingConfig(false);
        }
    }, [settings.provider]);

    // 当供应商变化时重新检查
    useEffect(() => {
        checkApiKeyStatus();
    }, [checkApiKeyStatus]);

    /**
     * 生成图片
     */
    const generate = useCallback(async (story) => {
        if (!story?.trim()) {
            setError('请输入故事内容');
            return null;
        }

        if (!isConfigured) {
            setError('请先在设置页面配置 API Key');
            return null;
        }

        try {
            setLoading(true);
            setProgress('generating');

            // 调用后端 API
            const result = await generateApi.generate(story, settings.style, settings.provider);

            if (!result.success || !result.data) {
                throw new Error(result.error || '生成失败');
            }

            const { id, image_url, enhanced_prompt, revised_prompt } = result.data;

            // 更新状态
            setCurrentImage(image_url, id);

            // 添加到画廊
            addToGallery({
                id,
                story,
                style: settings.style,
                provider: settings.provider,
                imageUrl: image_url,
                enhancedPrompt: enhanced_prompt,
                revisedPrompt: revised_prompt,
                isFavorite: false,
                createdAt: new Date().toISOString()
            });

            setProgress('done');
            return { id, imageUrl: image_url };

        } catch (error) {
            console.error('生成失败:', error);
            setError(error.message || '图片生成失败，请稍后重试');
            setProgress('idle');
            return null;
        } finally {
            setLoading(false);
        }
    }, [settings, isConfigured, setLoading, setError, setCurrentImage, addToGallery]);

    return {
        generate,
        progress,
        isConfigured,
        checkingConfig,
        checkApiKeyStatus, // 暴露刷新方法
    };
}

export default useImageGenerator;
