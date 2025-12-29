// 绘本画廊组件
import { useState, useEffect, useCallback } from 'react';
import { storybookApi } from '../../services/api';
import { getStyleById } from '../../config/styles';

export function StorybookGallery({ onSelect }) {
    const [storybooks, setStorybooks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    // 加载绘本列表
    const loadStorybooks = useCallback(async () => {
        setLoading(true);
        try {
            const result = await storybookApi.getAll(filter === 'favorites');
            if (result.success && result.data) {
                setStorybooks(result.data);
            }
        } catch (error) {
            console.error('加载绘本失败:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        loadStorybooks();
    }, [loadStorybooks]);

    // 删除绘本
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('确定要删除这本绘本吗？')) return;

        try {
            await storybookApi.delete(id);
            setStorybooks(prev => prev.filter(sb => sb.id !== id));
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    // 切换收藏
    const handleToggleFavorite = async (id, e) => {
        e.stopPropagation();
        try {
            const result = await storybookApi.toggleFavorite(id);
            if (result.success) {
                setStorybooks(prev => prev.map(sb =>
                    sb.id === id ? { ...sb, is_favorite: result.data.is_favorite } : sb
                ));
            }
        } catch (error) {
            console.error('收藏失败:', error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return { text: '✅ 完成', class: 'completed' };
            case 'generating': return { text: '🎨 生成中', class: 'generating' };
            case 'partial': return { text: '⚠️ 部分完成', class: 'partial' };
            case 'failed': return { text: '❌ 失败', class: 'failed' };
            default: return { text: '⏳ 等待', class: 'pending' };
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">加载绘本中...</p>
            </div>
        );
    }

    return (
        <div className="storybook-gallery">
            <div className="page-title">
                <h1>📚 我的绘本</h1>
                <p>这里保存着你创作的所有绘本</p>
            </div>

            {/* 筛选栏 */}
            <div className="filter-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    📚 全部
                </button>
                <button
                    className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
                    onClick={() => setFilter('favorites')}
                >
                    ⭐ 收藏
                </button>
                <button className="filter-btn" onClick={loadStorybooks}>
                    🔄 刷新
                </button>
            </div>

            {/* 空状态 */}
            {storybooks.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3 className="empty-state-title">
                        {filter === 'favorites' ? '还没有收藏的绘本' : '还没有创作绘本'}
                    </h3>
                    <p className="empty-state-text">
                        去创作页面创作你的第一本绘本吧！
                    </p>
                </div>
            ) : (
                <div className="storybook-grid">
                    {storybooks.map((sb) => {
                        const style = getStyleById(sb.style);
                        const status = getStatusBadge(sb.status);
                        return (
                            <div
                                key={sb.id}
                                className="storybook-card"
                                onClick={() => onSelect(sb.id)}
                            >
                                <div className="card-header">
                                    <span className={`status-badge ${status.class}`}>{status.text}</span>
                                    <button
                                        className="favorite-btn"
                                        onClick={(e) => handleToggleFavorite(sb.id, e)}
                                    >
                                        {sb.is_favorite ? '⭐' : '☆'}
                                    </button>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{sb.title}</h3>
                                    <p className="card-theme">{sb.theme}</p>
                                    <div className="card-meta">
                                        <span>{style?.icon} {style?.name}</span>
                                        <span>·</span>
                                        <span>{sb.scene_count} 页</span>
                                    </div>
                                    <p className="card-date">
                                        {new Date(sb.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDelete(sb.id, e)}
                                >
                                    🗑️
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
        .storybook-gallery {
          max-width: 1200px;
          margin: 0 auto;
        }
        
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
        
        .storybook-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        
        .storybook-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: var(--transition-normal);
          position: relative;
        }
        
        .storybook-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: 600;
        }
        
        .status-badge.completed { background: #E8F5E9; color: #2E7D32; }
        .status-badge.generating { background: #FFF3E0; color: #E65100; animation: pulse 2s infinite; }
        .status-badge.partial { background: #FFF8E1; color: #F9A825; }
        .status-badge.failed { background: #FFEBEE; color: #C62828; }
        .status-badge.pending { background: var(--color-bg); color: var(--color-text-light); }
        
        .favorite-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .favorite-btn:hover {
          transform: scale(1.2);
        }
        
        .card-title {
          font-size: var(--font-size-lg);
          margin: 0 0 0.5rem 0;
        }
        
        .card-theme {
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
          margin: 0 0 0.75rem 0;
        }
        
        .card-meta {
          display: flex;
          gap: 0.5rem;
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
        }
        
        .card-date {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          margin: 0.75rem 0 0 0;
        }
        
        .delete-btn {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          opacity: 0;
          transition: var(--transition-normal);
        }
        
        .storybook-card:hover .delete-btn {
          opacity: 1;
        }
        
        @media (max-width: 768px) {
          .storybook-grid {
            grid-template-columns: 1fr;
          }
          
          .delete-btn {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}

export default StorybookGallery;
