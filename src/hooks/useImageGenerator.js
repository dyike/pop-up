// 图片生成 Hook
// 封装图片生成的完整流程

import { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateImage, setProviderApiKey, isProviderConfigured } from '../providers';
import { enhancePrompt } from '../services/promptEnhancer';
import { saveImage } from '../services/storageService';

export function useImageGenerator() {
    const { settings, setLoading, setError, setCurrentImage, addToGallery } = useAppStore();
    const [progress, setProgress] = useState('idle'); // idle, enhancing, generating, saving, done

    /**
     * 生成图片
     * @param {string} story - 用户输入的故事
     * @returns {Promise<object>} - 生成结果
     */
    const generate = useCallback(async (story) => {
        if (!story?.trim()) {
            setError('请输入故事内容');
            return null;
        }

        // 检查 API Key
        const apiKey = settings.apiKeys[settings.provider];
        if (!apiKey) {
            setError(`请先在设置中配置 API Key`);
            return null;
        }

        // 设置 API Key
        setProviderApiKey(settings.provider, apiKey);

        try {
            setLoading(true);
            setProgress('enhancing');

            // 1. 增强 prompt
            const enhancedPrompt = enhancePrompt(story, settings.style);
            console.log('Enhanced prompt:', enhancedPrompt);

            setProgress('generating');

            // 2. 调用 AI 生成图片
            const result = await generateImage(enhancedPrompt, {
                provider: settings.provider
            });

            setProgress('saving');

            // 3. 保存到本地存储
            const imageData = {
                story,
                style: settings.style,
                provider: settings.provider,
                imageUrl: result.url,
                revisedPrompt: result.revisedPrompt,
                enhancedPrompt,
            };

            const imageId = await saveImage(imageData);
            const savedImage = { ...imageData, id: imageId };

            // 4. 更新状态
            setCurrentImage(result.url, imageId);
            addToGallery(savedImage);

            setProgress('done');
            return savedImage;

        } catch (error) {
            console.error('生成失败:', error);
            setError(error.message || '图片生成失败，请稍后重试');
            setProgress('idle');
            return null;
        }
    }, [settings, setLoading, setError, setCurrentImage, addToGallery]);

    /**
     * 检查是否已配置
     */
    const checkConfigured = useCallback(() => {
        return isProviderConfigured(settings.provider);
    }, [settings.provider]);

    return {
        generate,
        progress,
        checkConfigured,
        isConfigured: !!settings.apiKeys[settings.provider]
    };
}

export default useImageGenerator;
