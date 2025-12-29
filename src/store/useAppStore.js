// 全局状态管理 - 使用后端 API
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
    persist(
        (set) => ({
            // 设置（本地缓存，与后端同步）
            settings: {
                provider: 'openai',
                style: 'cartoon',
            },
            setProvider: (provider) => set((state) => ({
                settings: { ...state.settings, provider }
            })),
            setStyle: (style) => set((state) => ({
                settings: { ...state.settings, style }
            })),

            // 生成状态
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
            clearGeneration: () => set(() => ({
                generation: {
                    isLoading: false,
                    error: null,
                    currentStory: '',
                    currentImage: null,
                    currentImageId: null,
                }
            })),

            // 语音状态
            voice: {
                isPlaying: false,
                isPaused: false,
            },
            setVoiceStatus: (isPlaying, isPaused = false) => set((state) => ({
                voice: { ...state.voice, isPlaying, isPaused }
            })),

            // 画廊（本地缓存）
            gallery: {
                images: [],
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
            partialize: (state) => ({
                settings: state.settings,
                gallery: state.gallery
            }),
        }
    )
);

export default useAppStore;
