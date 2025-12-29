// 主应用组件 - 绘本模式
import { useState } from 'react';
import { StorybookCreator } from './components/StorybookCreator';
import { StorybookViewer } from './components/StorybookViewer';
import { StorybookGallery } from './components/StorybookGallery';
import { Settings } from './components/Settings';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('create');
  const [viewingStorybookId, setViewingStorybookId] = useState(null);

  // 绘本创建成功后的处理
  const handleStorybookCreated = (storybook) => {
    setViewingStorybookId(storybook.id);
    setCurrentPage('view');
  };

  // 选择查看绘本
  const handleSelectStorybook = (id) => {
    setViewingStorybookId(id);
    setCurrentPage('view');
  };

  // 关闭绘本查看器
  const handleCloseViewer = () => {
    setViewingStorybookId(null);
    setCurrentPage('gallery');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'gallery':
        return <StorybookGallery onSelect={handleSelectStorybook} />;
      case 'settings':
        return <Settings />;
      case 'view':
        return (
          <StorybookViewer
            storybookId={viewingStorybookId}
            onClose={handleCloseViewer}
          />
        );
      case 'create':
      default:
        return <StorybookCreator onCreated={handleStorybookCreated} />;
    }
  };

  return (
    <div className="app">
      {/* 头部导航 */}
      <header className="header">
        <div className="header-content">
          <a className="logo" href="#" onClick={() => setCurrentPage('create')}>
            <span className="logo-icon">📚</span>
            <span className="logo-text">Pop-Up 绘本</span>
          </a>

          <nav className="nav">
            <button
              className={`nav-btn ${currentPage === 'create' ? 'active' : ''}`}
              onClick={() => setCurrentPage('create')}
            >
              <span className="nav-btn-icon">✨</span>
              <span>创作</span>
            </button>
            <button
              className={`nav-btn ${currentPage === 'gallery' || currentPage === 'view' ? 'active' : ''}`}
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
      `}</style>
    </div>
  );
}

export default App;
