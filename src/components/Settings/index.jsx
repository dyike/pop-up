// 设置页面组件
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getEnabledProviders } from '../../config/providers';
import { getStyleList, DEFAULT_STYLE } from '../../config/styles';

export function Settings() {
    const { settings, setApiKey, getApiKey, setProvider, setStyle } = useAppStore();
    const providers = getEnabledProviders();
    const styles = getStyleList();

    const [apiKeyInput, setApiKeyInput] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    // 加载当前的 API Key
    useEffect(() => {
        const currentKey = getApiKey(settings.provider);
        setApiKeyInput(currentKey);
    }, [settings.provider, getApiKey]);

    const handleSaveApiKey = () => {
        setApiKey(settings.provider, apiKeyInput);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const maskApiKey = (key) => {
        if (!key) return '';
        if (key.length <= 8) return '••••••••';
        return key.slice(0, 4) + '••••••••' + key.slice(-4);
    };

    return (
        <div className="settings-page">
            <div className="page-title">
                <h1>⚙️ 设置</h1>
                <p>配置你的绘图助手</p>
            </div>

            <div className="card">
                {/* API Key 设置 */}
                <div className="settings-section">
                    <h3 className="settings-title">
                        <span>🔑</span>
                        API Key 配置
                    </h3>
                    <p className="settings-description">
                        输入你的 AI 服务 API Key，用于生成图片。
                    </p>

                    {/* 供应商选择 */}
                    <div className="provider-selector">
                        <label>选择服务商：</label>
                        <div className="provider-options">
                            {providers.map((provider) => (
                                <button
                                    key={provider.id}
                                    className={`provider-option ${settings.provider === provider.id ? 'active' : ''}`}
                                    onClick={() => setProvider(provider.id)}
                                >
                                    {provider.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* API Key 输入 */}
                    <div className="api-key-input">
                        <div className="input-group">
                            <input
                                type={showKey ? 'text' : 'password'}
                                className="input"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="输入 API Key..."
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
                            {getApiKey(settings.provider) ? (
                                <span className="status-configured">
                                    ✅ 已配置: {maskApiKey(getApiKey(settings.provider))}
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
                            disabled={!apiKeyInput}
                        >
                            {saved ? '✅ 已保存' : '💾 保存'}
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
                        选择你喜欢的默认绘画风格。
                    </p>

                    <div className="style-selector">
                        {styles.map((style) => (
                            <button
                                key={style.id}
                                className={`style-option ${settings.style === style.id ? 'active' : ''}`}
                                onClick={() => setStyle(style.id)}
                            >
                                <span className="style-icon">{style.icon}</span>
                                <span className="style-name">{style.name}</span>
                                <span className="style-desc">{style.description}</span>
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
                        <p>输入故事，AI 将为你绘制精美的插画，还可以朗读给宝宝听~</p>
                        <div className="features">
                            <span className="feature">🎨 多种画风</span>
                            <span className="feature">🔊 语音朗读</span>
                            <span className="feature">⭐ 收藏功能</span>
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
        
        .provider-selector {
          margin-bottom: 1.5rem;
        }
        
        .provider-selector label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .provider-options {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .provider-option {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .provider-option:hover {
          background: var(--color-primary-light);
        }
        
        .provider-option.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .api-key-input {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .input-group {
          display: flex;
          gap: 0.5rem;
        }
        
        .input-group .input {
          flex: 1;
        }
        
        .toggle-visibility {
          padding: 0.75rem 1rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          font-size: 1.25rem;
        }
        
        .api-key-status {
          font-size: var(--font-size-sm);
        }
        
        .status-configured {
          color: var(--color-accent-3);
        }
        
        .status-not-configured {
          color: #E65100;
        }
        
        .style-option {
          flex-direction: column;
          text-align: center;
          min-width: 120px;
        }
        
        .style-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-light);
          margin-top: 0.25rem;
        }
        
        .about-content {
          color: var(--color-text-light);
          line-height: 1.8;
        }
        
        .about-content p {
          margin-bottom: 0.5rem;
        }
        
        .features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        
        .feature {
          padding: 0.5rem 1rem;
          background: var(--color-bg);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
        }
      `}</style>
        </div>
    );
}

export default Settings;
