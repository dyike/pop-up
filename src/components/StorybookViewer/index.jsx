// 绘本查看器组件 - 卡片式浏览
import { useState, useEffect, useCallback } from 'react';
import { storybookApi } from '../../services/api';
import { getStyleById } from '../../config/styles';

export function StorybookViewer({ storybookId, onClose }) {
  const [storybook, setStorybook] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'flip'
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    loadStorybook();

    // 如果绘本还在生成，定时刷新
    const interval = setInterval(async () => {
      if (!storybook || storybook.status === 'completed') {
        clearInterval(interval);
        return;
      }
      await loadStorybook();
    }, 3000);

    return () => clearInterval(interval);
  }, [loadStorybook, storybook?.status]);

  // 翻页
  const goToPage = (index) => {
    if (index >= 0 && index < (storybook?.pages?.length || 0)) {
      setCurrentPage(index);
    }
  };

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
  const style = getStyleById(storybook.style);
  const completedCount = pages.filter(p => p.status === 'completed').length;
  const isGenerating = storybook.status === 'generating';

  return (
    <div className="storybook-viewer">
      {/* 头部 */}
      <div className="viewer-header">
        <button className="back-btn" onClick={onClose}>← 返回</button>
        <div className="book-info">
          <h2>{storybook.title}</h2>
          <span className="book-meta">{style?.icon} {style?.name} · {pages.length} 页</span>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
            onClick={() => setViewMode('card')}
          >
            📋 卡片
          </button>
          <button
            className={`toggle-btn ${viewMode === 'flip' ? 'active' : ''}`}
            onClick={() => setViewMode('flip')}
          >
            📖 翻页
          </button>
        </div>
      </div>

      {/* 生成进度 */}
      {isGenerating && (
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedCount / pages.length) * 100}%` }}
            />
          </div>
          <span className="progress-text">🎨 生成中 {completedCount}/{pages.length}</span>
        </div>
      )}

      {/* 卡片模式 */}
      {viewMode === 'card' && (
        <div className="card-view">
          <div className="page-cards">
            {pages.map((page, index) => (
              <div key={page.id || index} className="page-card">
                <div className="card-image">
                  {page.image_url ? (
                    <img src={page.image_url} alt={`第 ${index + 1} 页`} />
                  ) : (
                    <div className="image-placeholder">
                      {page.status === 'pending' ? (
                        <><span>🎨</span><p>等待绘制</p></>
                      ) : (
                        <><span className="loading-spinner small"></span><p>生成中...</p></>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-page-num">第 {index + 1} 页</div>
                  <p className="card-text">{page.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 翻页模式 */}
      {viewMode === 'flip' && (
        <div className="flip-view">
          <div className="flip-content">
            {/* 当前页图片 */}
            <div className="flip-image-container">
              {pages[currentPage]?.image_url ? (
                <img
                  src={pages[currentPage].image_url}
                  alt={`第 ${currentPage + 1} 页`}
                  className="flip-image"
                />
              ) : (
                <div className="flip-placeholder">
                  <div className="loading-spinner"></div>
                  <p>正在生成第 {currentPage + 1} 页...</p>
                </div>
              )}
            </div>

            {/* 文字内容 */}
            <div className="flip-text">
              <p>{pages[currentPage]?.text}</p>
            </div>

            {/* 翻页控制 */}
            <div className="flip-navigation">
              <button
                className="nav-arrow prev"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ←
              </button>

              <div className="page-dots">
                {pages.map((page, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentPage ? 'active' : ''} ${page.image_url ? 'completed' : ''}`}
                    onClick={() => goToPage(index)}
                  />
                ))}
              </div>

              <button
                className="nav-arrow next"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === pages.length - 1}
              >
                →
              </button>
            </div>

            <div className="flip-page-number">
              {currentPage + 1} / {pages.length}
            </div>
          </div>
        </div>
      )}

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
          flex-wrap: wrap;
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
          min-width: 200px;
        }
        
        .book-info h2 {
          font-size: var(--font-size-lg);
          margin: 0;
        }
        
        .book-meta {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }
        
        .toggle-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--color-primary-light);
          background: white;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .toggle-btn:hover {
          background: var(--color-primary-light);
        }
        
        .toggle-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        /* 进度条 */
        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          background: white;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--color-bg);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        
        .progress-text {
          font-size: var(--font-size-sm);
          font-weight: 600;
          white-space: nowrap;
        }
        
        /* 卡片模式 */
        .card-view {
          padding: 1.5rem;
        }
        
        .page-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .page-card {
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-normal);
        }
        
        .page-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }
        
        .card-image {
          aspect-ratio: 1;
          background: var(--color-bg);
        }
        
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
          gap: 0.5rem;
        }
        
        .image-placeholder span {
          font-size: 3rem;
        }
        
        .card-content {
          padding: 1.25rem;
        }
        
        .card-page-num {
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 0.5rem;
        }
        
        .card-text {
          font-size: var(--font-size-base);
          line-height: 1.6;
          margin: 0;
          color: var(--color-text);
        }
        
        /* 翻页模式 */
        .flip-view {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .flip-image-container {
          aspect-ratio: 1;
          background: white;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          margin-bottom: 1.5rem;
        }
        
        .flip-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .flip-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-text-light);
          gap: 1rem;
        }
        
        .flip-text {
          background: white;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 1.5rem;
          font-size: var(--font-size-xl);
          line-height: 1.8;
          text-align: center;
        }
        
        .flip-text p { margin: 0; }
        
        .flip-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        
        .nav-arrow {
          width: 48px;
          height: 48px;
          border: 2px solid var(--color-primary);
          background: white;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .nav-arrow:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
        }
        
        .nav-arrow:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .page-dots {
          display: flex;
          gap: 0.5rem;
        }
        
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--color-primary-light);
          background: white;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .dot.completed {
          background: var(--color-primary-light);
        }
        
        .dot.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          transform: scale(1.3);
        }
        
        .flip-page-number {
          text-align: center;
          margin-top: 1rem;
          color: var(--color-text-muted);
        }
        
        .loading-spinner.small {
          width: 32px;
          height: 32px;
        }
        
        @media (max-width: 768px) {
          .page-cards {
            grid-template-columns: 1fr;
          }
          
          .flip-text {
            font-size: var(--font-size-lg);
            padding: 1rem;
          }
          
          .nav-arrow {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

export default StorybookViewer;
