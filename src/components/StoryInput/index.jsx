// 故事输入组件
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getStyleList } from '../../config/styles';
import { useImageGenerator } from '../../hooks/useImageGenerator';

export function StoryInput() {
    const [story, setStory] = useState('');
    const { settings, setStyle, generation } = useAppStore();
    const { generate, isConfigured } = useImageGenerator();
    const styles = getStyleList();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!story.trim()) return;
        await generate(story);
    };

    const progressText = {
        enhancing: '正在理解故事...',
        generating: '正在画画，请稍候...',
        saving: '正在保存...',
        done: '完成！'
    };

    return (
        <div className="story-input-container">
            <div className="page-title">
                <h1>✨ 讲个故事给我听</h1>
                <p>输入故事，我来画出美丽的图画</p>
            </div>

            <form className="card" onSubmit={handleSubmit}>
                <textarea
                    className="textarea"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="从前有一只可爱的小兔子，住在一片美丽的森林里..."
                    disabled={generation.isLoading}
                />

                <div className="style-section">
                    <label className="style-label">选择画风：</label>
                    <div className="style-selector">
                        {styles.map((style) => (
                            <button
                                key={style.id}
                                type="button"
                                className={`style-option ${settings.style === style.id ? 'active' : ''}`}
                                onClick={() => setStyle(style.id)}
                                disabled={generation.isLoading}
                            >
                                <span className="style-icon">{style.icon}</span>
                                <span className="style-name">{style.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {generation.error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        <span>{generation.error}</span>
                    </div>
                )}

                {!isConfigured && (
                    <div className="error-message" style={{ background: '#FFF3E0', borderColor: '#FFB74D', color: '#E65100' }}>
                        <span className="error-icon">🔑</span>
                        <span>请先在设置页面配置 API Key</span>
                    </div>
                )}

                <div className="submit-section">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={!story.trim() || generation.isLoading || !isConfigured}
                    >
                        {generation.isLoading ? (
                            <>
                                <span className="btn-loading">⏳</span>
                                {progressText[generation.progress] || '生成中...'}
                            </>
                        ) : (
                            <>
                                <span>🎨</span>
                                开始画画
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style>{`
        .story-input-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .style-section {
          margin: 1.5rem 0;
        }
        
        .style-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--color-text-light);
        }
        
        .submit-section {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .btn-loading {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
      `}</style>
        </div>
    );
}

export default StoryInput;
