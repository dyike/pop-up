-- Pop-Up 数据库结构

-- 设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Keys 表
CREATE TABLE IF NOT EXISTS api_keys (
  provider TEXT PRIMARY KEY,
  api_key TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 图片历史表
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story TEXT NOT NULL,
  style TEXT NOT NULL,
  provider TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_data BLOB,
  enhanced_prompt TEXT,
  revised_prompt TEXT,
  is_favorite INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_is_favorite ON images(is_favorite);

-- 插入默认设置
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_provider', 'openai');
INSERT OR IGNORE INTO settings (key, value) VALUES ('default_style', 'cartoon');
