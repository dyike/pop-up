// 绘本创建组件
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStyleList } from '../../config/styles';
import { getEnabledProviders } from '../../config/providers';
import { storybookApi } from '../../services/api';

export function StorybookCreator({ onCreated }) {
    const { settings } = useAppStore();
    const styles = getStyleList();
    const providers = getEnabledProviders();

    const [theme, setTheme] = useState('');
    const [sceneCount, setSceneCount] = useState(4);
    const [style, setStyle] = useState(settings.style || 'watercolor');
    const [provider, setProvider] = useState(settings.provider || 'openai');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!theme.trim()) {
            setError('请输入绘本主题');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await storybookApi.generate(theme.trim(), sceneCount, style, provider);

            if (!result.success) {
                throw new Error(result.error || '创建失败');
            }

            if (onCreated) {
                onCreated(result.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const themeExamples = [
        '小兔子去森林探险',
        '小猫咪学游泳',
        '小熊和蜜蜂交朋友',
        '小鸟学飞翔',
        '小狗找回家的路',
    ];

    return (
        <div className="storybook-creator">
            <div className="page-title">
                <h1>📚 创作绘本</h1>
                <p>输入主题，AI 帮你生成完整的绘本故事</p>
            </div>

            <form className="card" onSubmit={handleSubmit}>
                {/* 主题输入 */}
                <div className="form-section">
                    <label className="form-label">📝 绘本主题</label>
                    <textarea
                        className="textarea"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="例如：小兔子去森林探险、小猫咪学游泳..."
                        disabled={loading}
                        rows={3}
                    />
                    <div className="theme-examples">
                        <span className="examples-label">试试：</span>
                        {themeExamples.map((example, i) => (
                            <button
                                key={i}
                                type="button"
                                className="example-tag"
                                onClick={() => setTheme(example)}
                                disabled={loading}
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 页数选择 */}
                <div className="form-section">
                    <label className="form-label">📖 绘本页数</label>
                    <div className="scene-count-selector">
                        {[2, 3, 4, 5, 6, 8].map((count) => (
                            <button
                                key={count}
                                type="button"
                                className={`count-option ${sceneCount === count ? 'active' : ''}`}
                                onClick={() => setSceneCount(count)}
                                disabled={loading}
                            >
                                {count} 页
                            </button>
                        ))}
                    </div>
                    <p className="form-hint">页数越多，生成时间越长</p>
                </div>

                {/* 画风选择 */}
                <div className="form-section">
                    <label className="form-label">🎨 绘画风格</label>
                    <div className="style-selector">
                        {styles.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`style-option ${style === s.id ? 'active' : ''}`}
                                onClick={() => setStyle(s.id)}
                                disabled={loading}
                            >
                                <span className="style-icon">{s.icon}</span>
                                <span className="style-name">{s.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 供应商选择 */}
                <div className="form-section">
                    <label className="form-label">🔌 绘图服务</label>
                    <div className="provider-selector">
                        {providers.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className={`provider-option ${provider === p.id ? 'active' : ''}`}
                                onClick={() => setProvider(p.id)}
                                disabled={loading}
                            >
                                <span>{p.icon}</span>
                                <span>{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 错误提示 */}
                {error && (
                    <div className="error-message">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* 提交按钮 */}
                <div className="submit-section">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={!theme.trim() || loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading-icon">⏳</span>
                                正在创作绘本...
                            </>
                        ) : (
                            <>
                                <span>✨</span>
                                开始创作
                            </>
                        )}
                    </button>
                </div>

                {loading && (
                    <div className="loading-hint">
                        <p>📝 正在生成故事...</p>
                        <p>🎨 然后会依次生成每一页的插画</p>
                        <p>⏱ 预计需要 {sceneCount * 15}-{sceneCount * 30} 秒</p>
                    </div>
                )}
            </form>

            <style>{`
        .storybook-creator {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-section {
          margin-bottom: 2rem;
        }
        
        .form-label {
          display: block;
          font-weight: 700;
          font-size: var(--font-size-lg);
          margin-bottom: 0.75rem;
        }
        
        .form-hint {
          font-size: var(--font-size-sm);
          color: var(--color-text-muted);
          margin-top: 0.5rem;
        }
        
        .theme-examples {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
          align-items: center;
        }
        
        .examples-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-light);
        }
        
        .example-tag {
          padding: 0.5rem 1rem;
          border: 1px solid var(--color-primary-light);
          border-radius: var(--radius-full);
          background: white;
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .example-tag:hover {
          background: var(--color-primary-light);
          border-color: var(--color-primary);
        }
        
        .scene-count-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .count-option {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-primary-light);
          border-radius: var(--radius-md);
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .count-option:hover {
          background: var(--color-primary-light);
        }
        
        .count-option.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        
        .provider-selector {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .provider-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
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
        
        .submit-section {
          margin-top: 2rem;
          text-align: center;
        }
        
        .loading-icon {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        .loading-hint {
          text-align: center;
          margin-top: 1.5rem;
          padding: 1rem;
          background: var(--color-bg);
          border-radius: var(--radius-md);
          color: var(--color-text-light);
        }
        
        .loading-hint p {
          margin: 0.5rem 0;
        }
        
        @media (max-width: 768px) {
          .scene-count-selector {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }
          
          .provider-selector {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
        </div>
    );
}

export default StorybookCreator;
