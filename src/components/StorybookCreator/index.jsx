// 绘本创建组件 - 支持故事预览后再画图
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStyleList } from '../../config/styles';
import { getEnabledProviders } from '../../config/providers';
import { storybookApi } from '../../services/api';

export function StorybookCreator({ onCreated }) {
  const { settings } = useAppStore();
  const styles = getStyleList();
  const providers = getEnabledProviders();

  // 创作状态
  const [step, setStep] = useState('input'); // 'input' | 'preview' | 'generating'
  const [theme, setTheme] = useState('');
  const [sceneCount, setSceneCount] = useState(4);
  const [style, setStyle] = useState(settings.style || 'watercolor');
  const [provider, setProvider] = useState(settings.provider || 'openai');

  // 故事预览
  const [storyPreview, setStoryPreview] = useState(null);
  const [storybookId, setStorybookId] = useState(null);

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 主题示例
  const themeExamples = [
    '小兔子去森林探险',
    '小猫咪学游泳',
    '小熊和蜜蜂交朋友',
    '小鸟学飞翔',
    '小狗找回家的路',
  ];

  // 生成故事（不画图）
  const handleGenerateStory = async () => {
    if (!theme.trim()) {
      setError('请输入绘本主题');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await storybookApi.generate(theme.trim(), sceneCount, style, provider);

      if (!result.success) {
        throw new Error(result.error || '生成故事失败');
      }

      // 获取完整的绘本信息（包含文字内容）
      setStorybookId(result.data.id);

      // 轮询获取故事内容
      await pollForStory(result.data.id);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 轮询获取故事内容
  const pollForStory = async (id) => {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const result = await storybookApi.get(id);
      if (result.success && result.data?.pages?.length > 0) {
        setStoryPreview(result.data);
        setStep('preview');
        setLoading(false);
        return;
      }
    }

    setError('获取故事超时，请重试');
    setLoading(false);
  };

  // 开始画图（故事已有，继续生成图片）
  const handleStartDrawing = () => {
    setStep('generating');
    // 图片其实已经在后台生成了，这里只是切换显示状态
    if (onCreated && storyPreview) {
      onCreated({ id: storyPreview.id, ...storyPreview });
    }
  };

  // 重新开始
  const handleReset = () => {
    setStep('input');
    setTheme('');
    setStoryPreview(null);
    setStorybookId(null);
    setError(null);
  };

  // 输入阶段
  if (step === 'input') {
    return (
      <div className="storybook-creator">
        <div className="page-title">
          <h1>✨ 创作绘本</h1>
          <p>输入一个主题，AI 帮你生成完整的绘本故事</p>
        </div>

        <div className="card">
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
            <div className="option-group">
              {[2, 3, 4, 5, 6, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`option-btn ${sceneCount === count ? 'active' : ''}`}
                  onClick={() => setSceneCount(count)}
                  disabled={loading}
                >
                  {count} 页
                </button>
              ))}
            </div>
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
            <div className="option-group">
              {providers.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`option-btn ${provider === p.id ? 'active' : ''}`}
                  onClick={() => setProvider(p.id)}
                  disabled={loading}
                >
                  {p.icon} {p.name}
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
              className="btn btn-primary btn-lg"
              onClick={handleGenerateStory}
              disabled={!theme.trim() || loading}
            >
              {loading ? (
                <>
                  <span className="loading-icon">⏳</span>
                  正在生成故事...
                </>
              ) : (
                <>
                  <span>📝</span>
                  生成故事
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="loading-hint">
              <p>🤖 AI 正在创作故事中...</p>
              <p>生成后可以预览文字，再决定是否画图</p>
            </div>
          )}
        </div>

        <style>{`${creatorStyles}`}</style>
      </div>
    );
  }

  // 预览阶段
  if (step === 'preview' && storyPreview) {
    return (
      <div className="storybook-creator">
        <div className="page-title">
          <h1>📖 {storyPreview.title}</h1>
          <p>故事已生成！确认后开始画图</p>
        </div>

        <div className="card story-preview">
          {/* 故事内容预览 */}
          <div className="story-pages">
            {storyPreview.pages.map((page, index) => (
              <div key={page.id || index} className="story-page-card">
                <div className="page-number">第 {index + 1} 页</div>
                <p className="page-text">{page.text}</p>
                {page.image_url ? (
                  <div className="page-status completed">✅ 图片已生成</div>
                ) : page.status === 'pending' ? (
                  <div className="page-status pending">🎨 待绘制</div>
                ) : (
                  <div className="page-status generating">⏳ 生成中...</div>
                )}
              </div>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              🔄 重新创作
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleStartDrawing}>
              🎨 查看绘本
            </button>
          </div>

          <p className="preview-hint">
            💡 图片正在后台生成中，点击"查看绘本"可以实时查看进度
          </p>
        </div>

        <style>{`${creatorStyles}`}</style>
      </div>
    );
  }

  return null;
}

// 样式
const creatorStyles = `
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
  
  .option-group {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .option-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--color-primary-light);
    border-radius: var(--radius-md);
    background: white;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-normal);
  }
  
  .option-btn:hover {
    background: var(--color-primary-light);
  }
  
  .option-btn.active {
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
  
  /* 故事预览 */
  .story-preview {
    padding: 2rem;
  }
  
  .story-pages {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .story-page-card {
    background: var(--color-bg);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    position: relative;
  }
  
  .page-number {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: var(--color-primary);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 600;
  }
  
  .page-text {
    font-size: var(--font-size-lg);
    line-height: 1.8;
    margin: 0 0 1rem 0;
    padding-right: 4rem;
  }
  
  .page-status {
    font-size: var(--font-size-sm);
    font-weight: 600;
  }
  
  .page-status.completed { color: var(--color-accent-3); }
  .page-status.pending { color: var(--color-primary); }
  .page-status.generating { color: #E65100; }
  
  .preview-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .preview-hint {
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
  
  @media (max-width: 768px) {
    .option-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
    
    .preview-actions {
      flex-direction: column;
    }
    
    .page-text {
      font-size: var(--font-size-base);
      padding-right: 0;
      padding-top: 2rem;
    }
  }
`;

export default StorybookCreator;
