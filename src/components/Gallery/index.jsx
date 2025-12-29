// 画廊组件 - 使用后端 API
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { imagesApi } from '../../services/api';
import { getStyleById } from '../../config/styles';

export function Gallery({ onViewImage }) {
    const { gallery, setGalleryImages, removeFromGallery, updateGalleryImage } = useAppStore();
    const [filter, setFilter] = useState('all'); // 'all' | 'favorites'
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // 从后端加载图片
    const loadImages = useCallback(async () => {
        setLoading(true);
        try {
            const result = await imagesApi.getAll(filter === 'favorites');
            if (result.success && result.data) {
                // 转换格式
                const images = result.data.map(img => ({
                    id: img.id,
                    story: img.story,
                    style: img.style,
                    provider: img.provider,
                    imageUrl: img.image_url,
                    enhancedPrompt: img.enhanced_prompt,
                    revisedPrompt: img.revised_prompt,
                    isFavorite: img.is_favorite === 1,
                    createdAt: img.created_at
                }));
                setGalleryImages(images);
            }
        } catch (error) {
            console.error('加载图片失败:', error);
        } finally {
            setLoading(false);
        }
    }, [filter, setGalleryImages]);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    // 切换收藏
    const handleToggleFavorite = async (id) => {
        try {
            const result = await imagesApi.toggleFavorite(id);
            if (result.success) {
                updateGalleryImage(id, { isFavorite: result.data.is_favorite === 1 });
            }
        } catch (error) {
            console.error('切换收藏失败:', error);
        }
    };

    // 删除图片
    const handleDelete = async (id) => {
        if (!confirm('确定要删除这张图片吗？')) return;

        try {
            const result = await imagesApi.delete(id);
            if (result.success) {
                removeFromGallery(id);
                if (selectedImage?.id === id) {
                    setSelectedImage(null);
                }
            }
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    // 下载图片
    const handleDownload = (image) => {
        const link = document.createElement('a');
        link.href = image.imageUrl;
        link.download = `popup-${image.id}.png`;
        link.click();
    };

    const filteredImages = gallery.images;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">加载中...</p>
            </div>
        );
    }

    return (
        <div className="gallery-page">
            <div className="page-title">
                <h1>🖼️ 我的画廊</h1>
                <p>这里保存着所有生成的精彩作品</p>
            </div>

            {/* 筛选栏 */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📷 全部
                </button>
                <button
                    className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
                    onClick={() => setFilter('favorites')}
                >
                    ⭐ 收藏
                </button>
                <button className="filter-btn" onClick={loadImages}>
                    🔄 刷新
                </button>
            </div>

            {/* 空状态 */}
            {filteredImages.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        {filter === 'favorites' ? '⭐' : '🎨'}
                    </div>
                    <h3 className="empty-state-title">
                        {filter === 'favorites' ? '还没有收藏' : '画廊是空的'}
                    </h3>
                    <p className="empty-state-text">
                        {filter === 'favorites'
                            ? '点击图片上的星星来收藏你喜欢的作品'
                            : '去创作页面生成你的第一幅画吧！'}
                    </p>
                </div>
            ) : (
                <div className="gallery-grid">
                    {filteredImages.map((image) => {
                        const style = getStyleById(image.style);
                        return (
                            <div
                                key={image.id}
                                className="gallery-item"
                                onClick={() => setSelectedImage(image)}
                            >
                                <img src={image.imageUrl} alt={image.story} />
                                <div className="gallery-item-overlay">
                                    <p className="gallery-item-story">{image.story}</p>
                                </div>
                                <span className="gallery-item-favorite">
                                    {image.isFavorite ? '⭐' : '☆'}
                                </span>
                                <span className="gallery-item-style">{style?.icon}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 详情模态框 */}
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
                                <span>{getStyleById(selectedImage.style)?.icon} {getStyleById(selectedImage.style)?.name}</span>
                                <span>•</span>
                                <span>{new Date(selectedImage.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleToggleFavorite(selectedImage.id)}
                                >
                                    {selectedImage.isFavorite ? '💛 已收藏' : '⭐ 收藏'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleDownload(selectedImage)}
                                >
                                    📥 下载
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handleDelete(selectedImage.id)}
                                >
                                    🗑️ 删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .gallery-page { max-width: 1200px; margin: 0 auto; }
        
        .filter-bar {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
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
        
        .gallery-item-style {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          font-size: 1.25rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        
        .modal-story {
          font-size: var(--font-size-lg);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .modal-meta {
          display: flex;
          gap: 0.5rem;
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
          margin-bottom: 1rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .modal-actions .btn {
          flex: 1;
          min-width: 100px;
        }
      `}</style>
        </div>
    );
}

export default Gallery;
