-- 数据库迁移脚本
-- 为 api_keys 表添加 base_url 和 model_name 字段

-- 检查并添加 base_url 列
ALTER TABLE api_keys ADD COLUMN base_url TEXT;

-- 检查并添加 model_name 列
ALTER TABLE api_keys ADD COLUMN model_name TEXT;
