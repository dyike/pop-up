// 主应用组件
import { useState } from 'react';
import { StoryInput } from './components/StoryInput';
import { ImageDisplay } from './components/ImageDisplay';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';
import { StorybookCreator } from './components/StorybookCreator';
import { StorybookViewer } from './components/StorybookViewer';
import { StorybookGallery } from './components/StorybookGallery';
import { useAppStore } from './store/useAppStore';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [viewingStorybookId, setViewingStorybookId] = useState(null);
  const { generation } = useAppStore();

  // 绘本创建成功后的处理
  const handleStorybookCreated = (storybook) => {
    setViewingStorybookId(storybook.id);
    setCurrentPage('storybook-view');
  };

  // 选择查看绘本
  const handleSelectStorybook = (id) => {
    setViewingStorybookId(id);
    setCurrentPage('storybook-view');
  };

  // 关闭绘本查看器
  const handleCloseViewer = () => {
    setViewingStorybookId(null);
    setCurrentPage('storybook-gallery');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'gallery':
        return <Gallery />;
      case 'settings':
        return <Settings />;
      case 'storybook':
        return <StorybookCreator onCreated={handleStorybookCreated} />;
      case 'storybook-gallery':
        return <StorybookGallery onSelect={handleSelectStorybook} />;
      case 'storybook-view':
        return (
          <StorybookViewer
            storybookId={viewingStorybookId}
            onClose={handleCloseViewer}
          />
        );
      case 'home':
      default:
        return (
          <>
            <StoryInput />
            <ImageDisplay />
          </>
        );
    }
  };

  return (
    <div className="app">
      {/* 头部导航 */}
      <header className="header">
        <div className="header-content">
          <a className="logo" href="#" onClick={() => setCurrentPage('home')}>
            <span className="logo-icon">🎨</span>
            <span className="logo-text">Pop-Up</span>
          </a>

          <nav className="nav">
            <button
              className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              <span className="nav-btn-icon">✨</span>
              <span>单图</span>
            </button>
            <button
              className={`nav-btn ${currentPage === 'storybook' || currentPage === 'storybook-gallery' || currentPage === 'storybook-view' ? 'active' : ''}`}
              onClick={() => setCurrentPage('storybook')}
            >
              <span className="nav-btn-icon">📚</span>
              <span>绘本</span>
            </button>
            <button
              className={`nav-btn ${currentPage === 'gallery' ? 'active' : ''}`}
              onClick={() => setCurrentPage('gallery')}
            >
              <span className="nav-btn-icon">🖼️</span>
              <span>画廊</span>
            </button>
            <button
              className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentPage('settings')}
            >
              <span className="nav-btn-icon">⚙️</span>
              <span>设置</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 绘本子导航 */}
      {(currentPage === 'storybook' || currentPage === 'storybook-gallery') && (
        <div className="sub-nav">
          <button
            className={`sub-nav-btn ${currentPage === 'storybook' ? 'active' : ''}`}
            onClick={() => setCurrentPage('storybook')}
          >
            ➕ 创作新绘本
          </button>
          <button
            className={`sub-nav-btn ${currentPage === 'storybook-gallery' ? 'active' : ''}`}
            onClick={() => setCurrentPage('storybook-gallery')}
          >
            📚 我的绘本
          </button>
        </div>
      )}

      {/* 主内容区 */}
      <main className="main">
        {renderPage()}
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <p>Made with ❤️ for little artists</p>
      </footer>

      <style>{`
        .footer {
          text-align: center;
          padding: 2rem;
          color: var(--color-text-muted);
          font-size: var(--font-size-sm);
        }
        
        .sub-nav {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .sub-nav-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-full);
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .sub-nav-btn:hover {
          background: var(--color-primary-light);
        }
        
        .sub-nav-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        @media (max-width: 768px) {
          .sub-nav {
            padding: 0.75rem;
            gap: 0.5rem;
          }
          
          .sub-nav-btn {
            padding: 0.5rem 1rem;
            font-size: var(--font-size-sm);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
