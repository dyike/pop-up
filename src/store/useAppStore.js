// 全局状态管理
// 使用 Zustand 管理应用状态

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_STYLE } from '../config/styles';
import { DEFAULT_PROVIDER } from '../config/providers';

export const useAppStore = create(
    persist(
        (set, get) => ({
            // ============ 设置相关 ============
            settings: {
                provider: DEFAULT_PROVIDER,
                style: DEFAULT_STYLE,
                apiKeys: {},  // { providerId: apiKey }
            },

            setApiKey: (providerId, apiKey) => set((state) => ({
                settings: {
                    ...state.settings,
                    apiKeys: {
                        ...state.settings.apiKeys,
                        [providerId]: apiKey
                    }
                }
            })),

            getApiKey: (providerId) => get().settings.apiKeys[providerId] || '',

            setProvider: (provider) => set((state) => ({
                settings: { ...state.settings, provider }
            })),

            setStyle: (style) => set((state) => ({
                settings: { ...state.settings, style }
            })),

            // ============ 生成状态 ============
            generation: {
                isLoading: false,
                error: null,
                currentStory: '',
                currentImage: null,
                currentImageId: null,
            },

            setLoading: (isLoading) => set((state) => ({
                generation: { ...state.generation, isLoading, error: null }
            })),

            setError: (error) => set((state) => ({
                generation: { ...state.generation, error, isLoading: false }
            })),

            setCurrentStory: (currentStory) => set((state) => ({
                generation: { ...state.generation, currentStory }
            })),

            setCurrentImage: (currentImage, currentImageId = null) => set((state) => ({
                generation: {
                    ...state.generation,
                    currentImage,
                    currentImageId,
                    isLoading: false,
                    error: null
                }
            })),

            clearGeneration: () => set((state) => ({
                generation: {
                    isLoading: false,
                    error: null,
                    currentStory: '',
                    currentImage: null,
                    currentImageId: null,
                }
            })),

            // ============ 语音状态 ============
            voice: {
                isPlaying: false,
                isPaused: false,
            },

            setVoiceStatus: (isPlaying, isPaused = false) => set((state) => ({
                voice: { ...state.voice, isPlaying, isPaused }
            })),

            // ============ 画廊状态 ============
            gallery: {
                images: [],
                isLoading: false,
            },

            setGalleryImages: (images) => set((state) => ({
                gallery: { ...state.gallery, images }
            })),

            addToGallery: (image) => set((state) => ({
                gallery: {
                    ...state.gallery,
                    images: [image, ...state.gallery.images]
                }
            })),

            removeFromGallery: (id) => set((state) => ({
                gallery: {
                    ...state.gallery,
                    images: state.gallery.images.filter(img => img.id !== id)
                }
            })),

            updateGalleryImage: (id, updates) => set((state) => ({
                gallery: {
                    ...state.gallery,
                    images: state.gallery.images.map(img =>
                        img.id === id ? { ...img, ...updates } : img
                    )
                }
            })),

        }),
        {
            name: 'pop-up-storage',
            partialize: (state) => ({ settings: state.settings }),
        }
    )
);

export default useAppStore;
