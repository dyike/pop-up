// 图片展示组件
import { useAppStore } from '../../store/useAppStore';
import { useVoiceReader } from '../../hooks/useVoiceReader';
import { toggleFavorite, getImage } from '../../services/storageService';
import { useState, useEffect } from 'react';

export function ImageDisplay() {
    const { generation, updateGalleryImage } = useAppStore();
    const { speak, stop, isPlaying, isPaused, toggle } = useVoiceReader();
    const [isFavorite, setIsFavorite] = useState(false);

    const { currentImage, currentImageId, currentStory } = generation;

    // 加载收藏状态
    useEffect(() => {
        if (currentImageId) {
            getImage(currentImageId).then(img => {
                if (img) setIsFavorite(img.isFavorite);
            });
        }
    }, [currentImageId]);

    if (generation.isLoading) {
        return (
            <div className="card loading-container">
                <div className="loading-animation">
                    <div className="loading-brush">🖌️</div>
                    <div className="loading-canvas">🎨</div>
                </div>
                <div className="loading-spinner"></div>
                <p className="loading-text">正在创作中，请稍候...</p>
                <p className="loading-hint">小画家正在认真画画哦~</p>

                <style>{`
          .loading-animation {
            display: flex;
            gap: 1rem;
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .loading-brush {
            animation: brush 0.5s ease-in-out infinite alternate;
          }
          .loading-canvas {
            animation: canvas 1s ease-in-out infinite;
          }
          @keyframes brush {
            from { transform: rotate(-10deg); }
            to { transform: rotate(10deg); }
          }
          @keyframes canvas {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .loading-hint {
            color: var(--color-text-muted);
            font-size: var(--font-size-sm);
            margin-top: 0.5rem;
          }
        `}</style>
            </div>
        );
    }

    if (!currentImage) {
        return null;
    }

    const handleFavorite = async () => {
        if (!currentImageId) return;
        try {
            const newStatus = await toggleFavorite(currentImageId);
            setIsFavorite(newStatus);
            updateGalleryImage(currentImageId, { isFavorite: newStatus });
        } catch (error) {
            console.error('收藏失败:', error);
        }
    };

    const handleVoice = () => {
        if (isPlaying) {
            stop();
        } else {
            speak(generation.currentStory || '这是一幅美丽的图画');
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(currentImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pop-up-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('下载失败:', error);
        }
    };

    return (
        <div className="image-display">
            <div className="card">
                <div className="image-container">
                    <img
                        src={currentImage}
                        alt="生成的插画"
                        className="generated-image"
                    />
                </div>

                <div className="image-actions">
                    <button
                        className={`btn btn-icon ${isFavorite ? 'favorite-active' : 'btn-secondary'}`}
                        onClick={handleFavorite}
                        title={isFavorite ? '取消收藏' : '收藏'}
                    >
                        {isFavorite ? '❤️' : '🤍'}
                    </button>

                    <button
                        className={`btn btn-icon ${isPlaying ? 'voice-active' : 'btn-secondary'}`}
                        onClick={handleVoice}
                        title={isPlaying ? '停止朗读' : '朗读故事'}
                    >
                        {isPlaying ? '⏹️' : '🔊'}
                    </button>

                    <button
                        className="btn btn-icon btn-secondary"
                        onClick={handleDownload}
                        title="下载图片"
                    >
                        💾
                    </button>
                </div>

                {generation.currentStory && (
                    <div className="voice-reader">
                        <button
                            className={`voice-btn ${isPlaying ? 'playing' : ''}`}
                            onClick={handleVoice}
                        >
                            {isPlaying ? (isPaused ? '▶️' : '⏸️') : '🔊'}
                        </button>
                        <div className="voice-text">
                            {isPlaying ? '正在朗读...' : '点击播放故事'}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        .image-display {
          max-width: 800px;
          margin: 2rem auto 0;
        }
        
        .image-display .card {
          padding: 1.5rem;
        }
        
        .favorite-active {
          background: #FFEBEE !important;
          border-color: #FF5252 !important;
        }
        
        .voice-active {
          background: #E8F5E9 !important;
          border-color: #4CAF50 !important;
        }
      `}</style>
        </div>
    );
}

export default ImageDisplay;
