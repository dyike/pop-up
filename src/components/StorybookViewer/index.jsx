// 绘本查看器组件
import { useState, useEffect, useCallback } from 'react';
import { storybookApi } from '../../services/api';
import { getStyleById } from '../../config/styles';

export function StorybookViewer({ storybookId, onClose }) {
    const [storybook, setStorybook] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 加载绘本数据
    const loadStorybook = useCallback(async () => {
        try {
            const result = await storybookApi.get(storybookId);
            if (result.success && result.data) {
                setStorybook(result.data);
            }
        } catch (error) {
            console.error('加载绘本失败:', error);
        } finally {
            setLoading(false);
        }
    }, [storybookId]);

    // 轮询状态（如果还在生成中）
    const pollStatus = useCallback(async () => {
        if (!storybook || storybook.status === 'completed' || storybook.status === 'failed') {
            return;
        }

        setRefreshing(true);
        try {
            const result = await storybookApi.getStatus(storybookId);
            if (result.success && result.data) {
                // 更新页面状态
                if (result.data.status === 'completed' || result.data.status === 'partial') {
                    await loadStorybook();
                } else {
                    // 继续轮询
                    setTimeout(pollStatus, 3000);
                }
            }
        } catch (error) {
            console.error('获取状态失败:', error);
        } finally {
            setRefreshing(false);
        }
    }, [storybook, storybookId, loadStorybook]);

    useEffect(() => {
        loadStorybook();
    }, [loadStorybook]);

    useEffect(() => {
        if (storybook && storybook.status === 'generating') {
            const timer = setTimeout(pollStatus, 3000);
            return () => clearTimeout(timer);
        }
    }, [storybook, pollStatus]);

    // 翻页
    const goToPage = (index) => {
        if (index >= 0 && index < (storybook?.pages?.length || 0)) {
            setCurrentPage(index);
        }
    };

    const prevPage = () => goToPage(currentPage - 1);
    const nextPage = () => goToPage(currentPage + 1);

    if (loading) {
        return (
            <div className="storybook-viewer">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">加载绘本中...</p>
                </div>
            </div>
        );
    }

    if (!storybook) {
        return (
            <div className="storybook-viewer">
                <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3>绘本不存在</h3>
                    <button className="btn btn-primary" onClick={onClose}>返回</button>
                </div>
            </div>
        );
    }

    const pages = storybook.pages || [];
    const currentPageData = pages[currentPage];
    const style = getStyleById(storybook.style);
    const isGenerating = storybook.status === 'generating';
    const completedCount = pages.filter(p => p.status === 'completed').length;

    return (
        <div className="storybook-viewer">
            {/* 头部 */}
            <div className="viewer-header">
                <button className="back-btn" onClick={onClose}>← 返回</button>
                <div className="book-info">
                    <h2>{storybook.title}</h2>
                    <span className="book-meta">{style?.icon} {style?.name} · {pages.length} 页</span>
                </div>
                {isGenerating && (
                    <span className="generating-badge">
                        🎨 生成中 {completedCount}/{pages.length}
                    </span>
                )}
            </div>

            {/* 绘本内容 */}
            <div className="book-content">
                {/* 当前页图片 */}
                <div className="page-image-container">
                    {currentPageData?.image_url ? (
                        <img
                            src={currentPageData.image_url}
                            alt={`第 ${currentPage + 1} 页`}
                            className="page-image"
                        />
                    ) : currentPageData?.status === 'pending' ? (
                        <div className="page-placeholder">
                            <div className="loading-spinner"></div>
                            <p>正在生成第 {currentPage + 1} 页...</p>
                        </div>
                    ) : (
                        <div className="page-placeholder failed">
                            <span>❌</span>
                            <p>生成失败</p>
                        </div>
                    )}
                </div>

                {/* 文字内容 */}
                <div className="page-text">
                    <p>{currentPageData?.text}</p>
                </div>

                {/* 翻页控制 */}
                <div className="page-navigation">
                    <button
                        className="nav-btn prev"
                        onClick={prevPage}
                        disabled={currentPage === 0}
                    >
                        ← 上一页
                    </button>

                    <div className="page-indicator">
                        {pages.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator-dot ${index === currentPage ? 'active' : ''} ${pages[index]?.status === 'completed' ? 'completed' : ''}`}
                                onClick={() => goToPage(index)}
                            />
                        ))}
                    </div>

                    <button
                        className="nav-btn next"
                        onClick={nextPage}
                        disabled={currentPage === pages.length - 1}
                    >
                        下一页 →
                    </button>
                </div>

                <div className="page-number">
                    第 {currentPage + 1} / {pages.length} 页
                </div>
            </div>

            <style>{`
        .storybook-viewer {
          min-height: 100vh;
          background: var(--color-bg);
        }
        
        .viewer-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: white;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .back-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: var(--color-bg);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
        }
        
        .book-info {
          flex: 1;
        }
        
        .book-info h2 {
          font-size: var(--font-size-lg);
          margin: 0;
        }
        
        .book-meta {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .generating-badge {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          font-weight: 600;
          animation: pulse 2s infinite;
        }
        
        .book-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .page-image-container {
          aspect-ratio: 1;
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          margin-bottom: 1.5rem;
        }
        
        .page-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .page-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-light);
          gap: 1rem;
        }
        
        .page-placeholder.failed {
          color: #E53935;
        }
        
        .page-placeholder span {
          font-size: 3rem;
        }
        
        .page-text {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 1.5rem;
          font-size: var(--font-size-xl);
          line-height: 1.8;
          text-align: center;
        }
        
        .page-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        
        .nav-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-primary);
          background: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .nav-btn:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
        }
        
        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .page-indicator {
          display: flex;
          gap: 0.5rem;
        }
        
        .indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--color-primary-light);
          background: white;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .indicator-dot.completed {
          background: var(--color-primary-light);
        }
        
        .indicator-dot.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: scale(1.2);
        }
        
        .page-number {
          text-align: center;
          margin-top: 1rem;
          color: var(--color-text-light);
          font-size: var(--font-size-sm);
        }
        
        @media (max-width: 768px) {
          .viewer-header {
            flex-wrap: wrap;
          }
          
          .nav-btn {
            padding: 0.5rem 1rem;
            font-size: var(--font-size-sm);
          }
          
          .page-text {
            font-size: var(--font-size-lg);
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
}

export default StorybookViewer;
