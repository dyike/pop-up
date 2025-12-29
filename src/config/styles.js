// 绘画风格配置
// 可在此添加更多风格，会自动出现在风格选择器中

export const ILLUSTRATION_STYLES = {
  cartoon: {
    id: 'cartoon',
    name: '可爱卡通',
    nameEn: 'Cute Cartoon',
    prompt: 'cute cartoon style, bright vivid colors, simple rounded shapes, child-friendly, kawaii, adorable characters, soft lighting',
    icon: '🎨',
    description: '明亮可爱的卡通风格'
  },
  watercolor: {
    id: 'watercolor',
    name: '水彩绘本',
    nameEn: 'Watercolor Storybook',
    prompt: 'watercolor illustration, soft pastel colors, storybook style, gentle brushstrokes, dreamy atmosphere, children book illustration',
    icon: '🖌️',
    description: '柔和梦幻的水彩画风'
  },
  sketch: {
    id: 'sketch',
    name: '简笔画',
    nameEn: 'Simple Sketch',
    prompt: 'simple line drawing, minimal colors, black outline, easy to understand, clean design, children doodle style',
    icon: '✏️',
    description: '简单清晰的线条画'
  },
  pixar: {
    id: 'pixar',
    name: '3D动画',
    nameEn: '3D Animation',
    prompt: 'pixar style 3D render, colorful, friendly characters, high quality, smooth textures, disney-like animation style',
    icon: '🎬',
    description: '精美的3D动画风格'
  },
  ghibli: {
    id: 'ghibli',
    name: '吉卜力',
    nameEn: 'Ghibli Style',
    prompt: 'studio ghibli style, anime illustration, warm colors, detailed background, magical atmosphere, miyazaki style',
    icon: '🏯',
    description: '温暖治愈的吉卜力风格'
  }
};

// 默认风格
export const DEFAULT_STYLE = 'cartoon';

// 获取风格列表
export const getStyleList = () => Object.values(ILLUSTRATION_STYLES);

// 根据ID获取风格
export const getStyleById = (id) => ILLUSTRATION_STYLES[id] || ILLUSTRATION_STYLES[DEFAULT_STYLE];
