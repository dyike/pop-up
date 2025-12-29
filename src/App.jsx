// 主应用组件
import { useState } from 'react';
import { StoryInput } from './components/StoryInput';
import { ImageDisplay } from './components/ImageDisplay';
import { Gallery } from './components/Gallery';
import { Settings } from './components/Settings';
import { useAppStore } from './store/useAppStore';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { generation } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'gallery':
        return <Gallery />;
      case 'settings':
        return <Settings />;
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
              <span>创作</span>
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
