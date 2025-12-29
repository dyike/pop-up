// 画廊组件
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getAllImages, deleteImage, toggleFavorite } from '../../services/storageService';
import { useVoiceReader } from '../../hooks/useVoiceReader';

export function Gallery() {
    const { gallery, setGalleryImages, removeFromGallery, updateGalleryImage } = useAppStore();
    const [filter, setFilter] = useState('all'); // all, favorites
    const [selectedImage, setSelectedImage] = useState(null);
    const { speak, stop, isPlaying } = useVoiceReader();

    // 加载图片
    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const images = await getAllImages();
            setGalleryImages(images);
        } catch (error) {
            console.error('加载图片失败:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e?.stopPropagation();
        if (!confirm('确定要删除这张图片吗？')) return;
        try {
            await deleteImage(id);
            removeFromGallery(id);
            if (selectedImage?.id === id) {
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    const handleFavorite = async (id, e) => {
        e?.stopPropagation();
        try {
            const newStatus = await toggleFavorite(id);
            updateGalleryImage(id, { isFavorite: newStatus });
        } catch (error) {
            console.error('收藏失败:', error);
        }
    };

    const handleSpeak = (story, e) => {
        e?.stopPropagation();
        if (isPlaying) {
            stop();
        } else {
            speak(story);
        }
    };

    const filteredImages = filter === 'favorites'
        ? gallery.images.filter(img => img.isFavorite)
        : gallery.images;

    return (
        <div className="gallery-page">
            <div className="page-title">
                <h1>🖼️ 我的画廊</h1>
                <p>收藏你喜欢的作品</p>
            </div>

            {/* 筛选器 */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📚 全部 ({gallery.images.length})
                </button>
                <button
                    className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
                    onClick={() => setFilter('favorites')}
                >
                    ⭐ 收藏 ({gallery.images.filter(i => i.isFavorite).length})
                </button>
            </div>

            {/* 图片网格 */}
            {filteredImages.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">
                        {filter === 'favorites' ? '⭐' : '🎨'}
                    </div>
                    <h2 className="empty-state-title">
                        {filter === 'favorites' ? '还没有收藏' : '还没有作品'}
                    </h2>
                    <p className="empty-state-text">
                        {filter === 'favorites'
                            ? '点击图片上的 ❤️ 可以收藏'
                            : '去首页创作你的第一幅画吧~'}
                    </p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredImages.map((image) => (
                        <div
                            key={image.id}
                            className="gallery-item"
                            onClick={() => setSelectedImage(image)}
                        >
                            <img src={image.imageUrl} alt={image.story} />
                            <div className="gallery-item-favorite">
                                {image.isFavorite ? '❤️' : ''}
                            </div>
                            <div className="gallery-item-overlay">
                                <p className="gallery-item-story">{image.story}</p>
                                <div className="gallery-item-actions">
                                    <button onClick={(e) => handleFavorite(image.id, e)}>
                                        {image.isFavorite ? '💔' : '❤️'}
                                    </button>
                                    <button onClick={(e) => handleSpeak(image.story, e)}>
                                        🔊
                                    </button>
                                    <button onClick={(e) => handleDelete(image.id, e)}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 图片详情模态框 */}
            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setSelectedImage(null)}
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.story}
                            className="modal-image"
                        />
                        <div className="modal-info">
                            <p className="modal-story">{selectedImage.story}</p>
                            <div className="modal-meta">
                                <span>🎨 {selectedImage.style}</span>
                                <span>📅 {new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleFavorite(selectedImage.id)}
                                >
                                    {selectedImage.isFavorite ? '💔 取消收藏' : '❤️ 收藏'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleSpeak(selectedImage.story)}
                                >
                                    {isPlaying ? '⏹️ 停止' : '🔊 朗读'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .gallery-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          justify-content: center;
        }
        
        .filter-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-full);
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .filter-btn:hover {
          background: var(--color-primary-light);
        }
        
        .filter-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .gallery-item-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .gallery-item-actions button {
          padding: 0.5rem;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        
        .gallery-item-actions button:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }
        
        .modal-story {
          font-size: var(--font-size-lg);
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .modal-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
          margin-bottom: 1rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
      `}</style>
        </div>
    );
}

export default Gallery;
