// 设置页面组件 - 使用后端 API
import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { settingsApi } from '../../services/api';
import { getEnabledProviders, getProviderById } from '../../config/providers';
import { getStyleList } from '../../config/styles';

export function Settings() {
  const { settings, setProvider, setStyle } = useAppStore();
  const providers = getEnabledProviders();
  const styles = getStyleList();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState({ configured: false, masked: '' });
  const [statusLoading, setStatusLoading] = useState(false);

  const currentProvider = getProviderById(settings.provider);

  // 加载 API Key 状态
  const loadKeyStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const result = await settingsApi.getApiKeyStatus(settings.provider);
      if (result.success && result.data) {
        setKeyStatus({
          configured: result.data.configured,
          masked: result.data.masked || ''
        });
      }
    } catch (error) {
      console.error('加载 API Key 状态失败:', error);
    } finally {
      setStatusLoading(false);
    }
  }, [settings.provider]);

  useEffect(() => {
    loadKeyStatus();
    setApiKeyInput('');
    setShowKey(false);
  }, [settings.provider, loadKeyStatus]);

  // 保存 API Key
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;

    setSaving(true);
    try {
      const result = await settingsApi.saveApiKey(settings.provider, apiKeyInput.trim());
      if (result.success) {
        setSaved(true);
        setApiKeyInput('');
        loadKeyStatus();
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(result.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 保存设置到后端
  const handleProviderChange = async (providerId) => {
    setProvider(providerId);
    // 同步到后端
    await settingsApi.set('default_provider', providerId);
  };

  const handleStyleChange = async (styleId) => {
    setStyle(styleId);
    // 同步到后端
    await settingsApi.set('default_style', styleId);
  };

  return (
    <div className="settings-page">
      <div className="page-title">
        <h1>⚙️ 设置</h1>
        <p>配置你的绘图助手</p>
      </div>

      <div className="card">
        {/* 供应商选择 */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>🔌</span>
            选择 AI 服务商
          </h3>
          <p className="settings-description">
            选择你要使用的 AI 图像生成服务
          </p>

          <div className="provider-grid">
            {providers.map((provider) => (
              <button
                key={provider.id}
                className={`provider-card ${settings.provider === provider.id ? 'active' : ''}`}
                onClick={() => handleProviderChange(provider.id)}
              >
                <span className="provider-icon">{provider.icon}</span>
                <span className="provider-name">{provider.name}</span>
                <span className="provider-desc">{provider.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key 设置 */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>🔑</span>
            {currentProvider?.name} API Key
          </h3>
          <p className="settings-description">
            {currentProvider?.description}
            {currentProvider?.apiKeyHelp && (
              <a
                href={currentProvider.apiKeyHelp}
                target="_blank"
                rel="noopener noreferrer"
                className="api-help-link"
              >
                获取 API Key →
              </a>
            )}
          </p>

          <div className="api-key-input">
            <div className="input-group">
              <input
                type={showKey ? 'text' : 'password'}
                className="input"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={currentProvider?.apiKeyPlaceholder || '输入 API Key...'}
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="api-key-status">
              {statusLoading ? (
                <span className="status-loading">加载中...</span>
              ) : keyStatus.configured ? (
                <span className="status-configured">
                  ✅ 已配置: {keyStatus.masked}
                </span>
              ) : (
                <span className="status-not-configured">
                  ⚠️ 未配置
                </span>
              )}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || saving}
            >
              {saving ? '⏳ 保存中...' : saved ? '✅ 已保存' : '💾 保存到后端'}
            </button>
          </div>
        </div>

        {/* 默认风格设置 */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>🎨</span>
            默认绘画风格
          </h3>
          <p className="settings-description">
            选择你喜欢的默认绘画风格
          </p>

          <div className="style-grid">
            {styles.map((style) => (
              <button
                key={style.id}
                className={`style-card ${settings.style === style.id ? 'active' : ''}`}
                onClick={() => handleStyleChange(style.id)}
              >
                <span className="style-icon">{style.icon}</span>
                <span className="style-name">{style.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 关于 */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>ℹ️</span>
            关于 Pop-Up
          </h3>
          <div className="about-content">
            <p>Pop-Up 是一个为3岁以下幼儿设计的故事绘图助手。</p>
            <p>💾 配置数据保存在后端 SQLite 数据库中</p>
            <div className="features">
              <span className="feature">🎨 多种画风</span>
              <span className="feature">🔊 语音朗读</span>
              <span className="feature">⭐ 收藏功能</span>
              <span className="feature">🔌 6个 AI 供应商</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .settings-section {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .settings-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .provider-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }
        
        .provider-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.25rem 1rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          transition: var(--transition-normal);
          text-align: center;
        }
        
        .provider-card:hover {
          border-color: var(--color-primary);
          background: var(--color-bg);
        }
        
        .provider-card.active {
          border-color: var(--color-primary);
          background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(108, 92, 231, 0.1));
          box-shadow: var(--shadow-sm);
        }
        
        .provider-icon { font-size: 2rem; }
        .provider-name { font-weight: 700; font-size: var(--font-size-base); }
        .provider-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-light);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .style-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
        }
        
        .style-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid transparent;
          border-radius: var(--radius-md);
          background: var(--color-bg);
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .style-card:hover { background: var(--color-primary-light); }
        
        .style-card.active {
          border-color: var(--color-primary);
          background: white;
          box-shadow: var(--shadow-sm);
        }
        
        .style-card .style-icon { font-size: 1.75rem; }
        .style-card .style-name { font-size: var(--font-size-sm); font-weight: 600; }
        
        .api-key-input {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .input-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-group .input { flex: 1; }
        
        .toggle-visibility {
          padding: 0.75rem 1rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          font-size: 1.25rem;
        }
        
        .api-key-status { font-size: var(--font-size-sm); }
        .status-configured { color: var(--color-accent-3); }
        .status-not-configured { color: #E65100; }
        .status-loading { color: var(--color-text-muted); }
        
        .api-help-link {
          display: inline-block;
          margin-left: 0.5rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }
        
        .about-content {
          color: var(--color-text-light);
          line-height: 1.8;
        }
        
        .features {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        
        .feature {
          padding: 0.5rem 1rem;
          background: var(--color-bg);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
        }
        
        @media (max-width: 768px) {
          .provider-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .provider-card { padding: 1rem 0.75rem; }
          .provider-icon { font-size: 1.5rem; }
          .provider-name { font-size: var(--font-size-sm); }
          .provider-desc { display: none; }
          .style-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
          .input-group { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

export default Settings;
