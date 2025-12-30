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
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [modelNameInput, setModelNameInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState({ configured: false, masked: '', baseUrl: '', modelName: '' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // LLM 配置状态（故事生成用）
  const [llmApiKeyInput, setLlmApiKeyInput] = useState('');
  const [llmBaseUrlInput, setLlmBaseUrlInput] = useState('');
  const [llmModelNameInput, setLlmModelNameInput] = useState('');
  const [llmShowKey, setLlmShowKey] = useState(false);
  const [llmSaving, setLlmSaving] = useState(false);
  const [llmSaved, setLlmSaved] = useState(false);
  const [llmStatus, setLlmStatus] = useState({ configured: false, masked: '', baseUrl: '', modelName: '' });
  const [llmStatusLoading, setLlmStatusLoading] = useState(false);

  const currentProvider = getProviderById(settings.provider);

  // 加载 Provider 配置状态
  const loadKeyStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const result = await settingsApi.getApiKeyStatus(settings.provider);
      if (result.success && result.data) {
        setKeyStatus({
          configured: result.data.configured,
          masked: result.data.masked || '',
          baseUrl: result.data.baseUrl || '',
          modelName: result.data.modelName || ''
        });
        // 如果已配置，填充 Base URL 和 Model Name
        if (result.data.configured) {
          setBaseUrlInput(result.data.baseUrl || '');
          setModelNameInput(result.data.modelName || '');
        }
      }
    } catch (error) {
      console.error('加载 Provider 配置失败:', error);
    } finally {
      setStatusLoading(false);
    }
  }, [settings.provider]);

  useEffect(() => {
    loadKeyStatus();
    setApiKeyInput('');
    setShowKey(false);
    setShowAdvanced(false);
  }, [settings.provider, loadKeyStatus]);

  // 保存 Provider 配置
  const handleSaveConfig = async () => {
    if (!apiKeyInput.trim()) return;

    setSaving(true);
    try {
      const result = await settingsApi.saveApiKey(
        settings.provider,
        apiKeyInput.trim(),
        baseUrlInput.trim(),
        modelNameInput.trim()
      );
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

  // 重置为默认 Base URL
  const handleResetBaseUrl = () => {
    setBaseUrlInput(currentProvider?.defaultBaseUrl || '');
  };

  // 重置为默认 Model
  const handleResetModel = () => {
    setModelNameInput(currentProvider?.defaultModel || '');
  };

  // ============ LLM 配置（故事生成用） ============

  // 加载 LLM 配置
  const loadLLMConfig = useCallback(async () => {
    setLlmStatusLoading(true);
    try {
      const result = await settingsApi.getLLMConfig();
      if (result.success && result.data) {
        setLlmStatus({
          configured: result.data.configured,
          masked: result.data.masked || '',
          baseUrl: result.data.baseUrl || 'https://api.openai.com/v1',
          modelName: result.data.modelName || 'gpt-4o-mini'
        });
        // 填充默认值
        setLlmBaseUrlInput(result.data.baseUrl || 'https://api.openai.com/v1');
        setLlmModelNameInput(result.data.modelName || 'gpt-4o-mini');
      }
    } catch (error) {
      console.error('加载 LLM 配置失败:', error);
    } finally {
      setLlmStatusLoading(false);
    }
  }, []);

  // 页面加载时获取 LLM 配置
  useEffect(() => {
    loadLLMConfig();
  }, [loadLLMConfig]);

  // 保存 LLM 配置
  const handleSaveLLMConfig = async () => {
    if (!llmApiKeyInput.trim()) return;

    setLlmSaving(true);
    try {
      const result = await settingsApi.saveLLMConfig(
        llmApiKeyInput.trim(),
        llmBaseUrlInput.trim(),
        llmModelNameInput.trim()
      );
      if (result.success) {
        setLlmSaved(true);
        setLlmApiKeyInput('');
        loadLLMConfig();
        setTimeout(() => setLlmSaved(false), 2000);
      } else {
        alert(result.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败: ' + error.message);
    } finally {
      setLlmSaving(false);
    }
  };

  // 重置 LLM Base URL
  const handleResetLLMBaseUrl = () => {
    setLlmBaseUrlInput('https://api.openai.com/v1');
  };

  // 重置 LLM Model
  const handleResetLLMModel = () => {
    setLlmModelNameInput('gpt-4o-mini');
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

        {/* Provider 配置设置 */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>🔑</span>
            {currentProvider?.name} 配置
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

          <div className="provider-config">
            {/* API Key 输入 */}
            <div className="config-field">
              <label className="config-label">
                🔐 API Key <span className="required">*</span>
              </label>
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
            </div>

            {/* 高级配置切换 */}
            <div className="advanced-toggle">
              <button
                className="btn-text"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} 高级配置 (Base URL / Model Name)
              </button>
            </div>

            {/* 高级配置区域 */}
            {showAdvanced && (
              <div className="advanced-config">
                {/* Base URL 输入 */}
                {currentProvider?.supportsCustomBaseUrl && (
                  <div className="config-field">
                    <label className="config-label">
                      🌐 Base URL
                      <span className="hint">（可选，留空使用默认）</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="input"
                        value={baseUrlInput}
                        onChange={(e) => setBaseUrlInput(e.target.value)}
                        placeholder={currentProvider?.defaultBaseUrl || '默认 API 地址'}
                      />
                      <button
                        className="btn-reset"
                        onClick={handleResetBaseUrl}
                        type="button"
                        title="重置为默认值"
                      >
                        ↻
                      </button>
                    </div>
                    <div className="config-hint">
                      默认: {currentProvider?.defaultBaseUrl}
                    </div>
                  </div>
                )}

                {/* Model Name 输入 */}
                <div className="config-field">
                  <label className="config-label">
                    🤖 Model Name
                    <span className="hint">（可选，覆盖默认模型）</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input"
                      value={modelNameInput}
                      onChange={(e) => setModelNameInput(e.target.value)}
                      placeholder={currentProvider?.defaultModel || '默认模型'}
                    />
                    <button
                      className="btn-reset"
                      onClick={handleResetModel}
                      type="button"
                      title="重置为默认值"
                    >
                      ↻
                    </button>
                  </div>
                  <div className="config-hint">
                    可选模型: {currentProvider?.models?.map(m => m.id).join(', ')}
                  </div>
                </div>

                {/* 当前保存的配置显示 */}
                {keyStatus.configured && (keyStatus.baseUrl || keyStatus.modelName) && (
                  <div className="current-config">
                    <div className="current-config-title">📋 当前已保存配置:</div>
                    {keyStatus.baseUrl && (
                      <div className="current-config-item">
                        <span className="label">Base URL:</span>
                        <span className="value">{keyStatus.baseUrl}</span>
                      </div>
                    )}
                    {keyStatus.modelName && (
                      <div className="current-config-item">
                        <span className="label">Model:</span>
                        <span className="value">{keyStatus.modelName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 保存按钮 */}
            <button
              className="btn btn-primary save-btn"
              onClick={handleSaveConfig}
              disabled={!apiKeyInput.trim() || saving}
            >
              {saving ? '⏳ 保存中...' : saved ? '✅ 已保存' : '💾 保存配置'}
            </button>
          </div>
        </div>

        {/* LLM 配置（故事生成用） */}
        <div className="settings-section">
          <h3 className="settings-title">
            <span>🤖</span>
            LLM 配置（故事生成）
          </h3>
          <p className="settings-description">
            配置用于生成故事的 Chat 模型（支持 OpenAI 兼容格式的 API）
          </p>

          <div className="provider-config">
            {/* API Key 输入 */}
            <div className="config-field">
              <label className="config-label">
                🔐 API Key <span className="required">*</span>
              </label>
              <div className="input-group">
                <input
                  type={llmShowKey ? 'text' : 'password'}
                  className="input"
                  value={llmApiKeyInput}
                  onChange={(e) => setLlmApiKeyInput(e.target.value)}
                  placeholder="输入 LLM API Key..."
                />
                <button
                  className="toggle-visibility"
                  onClick={() => setLlmShowKey(!llmShowKey)}
                  type="button"
                >
                  {llmShowKey ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="api-key-status">
                {llmStatusLoading ? (
                  <span className="status-loading">加载中...</span>
                ) : llmStatus.configured ? (
                  <span className="status-configured">
                    ✅ 已配置: {llmStatus.masked}
                  </span>
                ) : (
                  <span className="status-not-configured">
                    ⚠️ 未配置
                  </span>
                )}
              </div>
            </div>

            {/* Base URL 输入 */}
            <div className="config-field">
              <label className="config-label">
                🌐 Base URL
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="input"
                  value={llmBaseUrlInput}
                  onChange={(e) => setLlmBaseUrlInput(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
                <button
                  className="btn-reset"
                  onClick={handleResetLLMBaseUrl}
                  type="button"
                  title="重置为默认值"
                >
                  ↻
                </button>
              </div>
              <div className="config-hint">
                默认: https://api.openai.com/v1（支持任何 OpenAI 兼容 API）
              </div>
            </div>

            {/* Model Name 输入 */}
            <div className="config-field">
              <label className="config-label">
                🤖 Model Name
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="input"
                  value={llmModelNameInput}
                  onChange={(e) => setLlmModelNameInput(e.target.value)}
                  placeholder="gpt-4o-mini"
                />
                <button
                  className="btn-reset"
                  onClick={handleResetLLMModel}
                  type="button"
                  title="重置为默认值"
                >
                  ↻
                </button>
              </div>
              <div className="config-hint">
                常用模型: gpt-4o-mini, gpt-4o, claude-3-sonnet, gemini-pro
              </div>
            </div>

            {/* 当前保存的配置显示 */}
            {llmStatus.configured && (
              <div className="current-config">
                <div className="current-config-title">📋 当前已保存配置:</div>
                <div className="current-config-item">
                  <span className="label">Base URL:</span>
                  <span className="value">{llmStatus.baseUrl}</span>
                </div>
                <div className="current-config-item">
                  <span className="label">Model:</span>
                  <span className="value">{llmStatus.modelName}</span>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <button
              className="btn btn-primary save-btn"
              onClick={handleSaveLLMConfig}
              disabled={!llmApiKeyInput.trim() || llmSaving}
            >
              {llmSaving ? '⏳ 保存中...' : llmSaved ? '✅ 已保存' : '💾 保存 LLM 配置'}
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

        /* Provider 配置区域样式 */
        .provider-config {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .config-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .config-label {
          font-weight: 600;
          font-size: var(--font-size-sm);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .config-label .required {
          color: #e53935;
        }

        .config-label .hint {
          font-weight: 400;
          color: var(--color-text-muted);
          font-size: var(--font-size-xs);
        }

        .config-hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-muted);
          padding-left: 0.25rem;
        }

        .btn-reset {
          padding: 0.75rem 1rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          cursor: pointer;
          font-size: 1.25rem;
          transition: var(--transition-fast);
        }

        .btn-reset:hover {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
        }

        /* 高级配置切换按钮 */
        .advanced-toggle {
          padding-top: 0.5rem;
        }

        .btn-text {
          background: none;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: var(--font-size-sm);
          font-weight: 500;
          padding: 0.5rem 0;
          transition: var(--transition-fast);
        }

        .btn-text:hover {
          color: var(--color-primary-dark);
          text-decoration: underline;
        }

        /* 高级配置区域 */
        .advanced-config {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.05), rgba(255, 107, 157, 0.05));
          border-radius: var(--radius-md);
          border: 1px solid rgba(108, 92, 231, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 当前配置显示 */
        .current-config {
          padding: 1rem;
          background: rgba(76, 175, 80, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(76, 175, 80, 0.2);
        }

        .current-config-title {
          font-weight: 600;
          font-size: var(--font-size-sm);
          margin-bottom: 0.75rem;
          color: #2e7d32;
        }

        .current-config-item {
          display: flex;
          gap: 0.5rem;
          font-size: var(--font-size-sm);
          margin-bottom: 0.25rem;
          word-break: break-all;
        }

        .current-config-item .label {
          color: var(--color-text-muted);
          min-width: 70px;
        }

        .current-config-item .value {
          color: var(--color-text);
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
        }

        .save-btn {
          margin-top: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .provider-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .provider-card { padding: 1rem 0.75rem; }
          .provider-icon { font-size: 1.5rem; }
          .provider-name { font-size: var(--font-size-sm); }
          .provider-desc { display: none; }
          .style-grid { grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
          .input-group { flex-direction: column; }
          .advanced-config { padding: 1rem; }
          .current-config-item { flex-direction: column; gap: 0.25rem; }
        }
      `}</style>
    </div>
  );
}

export default Settings;
