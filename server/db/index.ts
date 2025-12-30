// SQLite 数据库连接
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');
const dataDir = join(projectRoot, 'data');
const dbPath = join(dataDir, 'popup.sqlite');

// 确保 data 目录存在
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 启用 WAL 模式以提高性能
db.pragma('journal_mode = WAL');

// 检查表是否有某个列
function hasColumn(tableName: string, columnName: string): boolean {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
    return columns.some(col => col.name === columnName);
}

// 检查表是否存在
function tableExists(tableName: string): boolean {
    const result = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
    ).get(tableName);
    return !!result;
}

// 数据库迁移 - 确保所有表和字段存在
function migrateDatabase(): void {
    // 1. api_keys 表迁移
    if (!hasColumn('api_keys', 'base_url')) {
        db.exec('ALTER TABLE api_keys ADD COLUMN base_url TEXT');
        console.log('✅ 已添加 api_keys.base_url 列');
    }

    if (!hasColumn('api_keys', 'model_name')) {
        db.exec('ALTER TABLE api_keys ADD COLUMN model_name TEXT');
        console.log('✅ 已添加 api_keys.model_name 列');
    }

    // 2. llm_config 表迁移 - 确保表结构正确
    if (tableExists('llm_config')) {
        // 检查是否需要重建表（如果 api_key 列有 NOT NULL 约束）
        // 简单起见，直接尝试插入一条空记录来测试
        try {
            // 如果表为空，插入一条默认配置
            const count = db.prepare('SELECT COUNT(*) as count FROM llm_config').get() as { count: number };
            if (count.count === 0) {
                // 尝试插入默认配置
                db.prepare(`
                    INSERT INTO llm_config (id, base_url, model_name) 
                    VALUES (1, 'https://api.openai.com/v1', 'gpt-4o-mini')
                `).run();
                console.log('✅ 已初始化 llm_config 默认配置');
            }
        } catch (e) {
            // 如果插入失败（可能是 NOT NULL 约束），重建表
            console.log('⚠️ llm_config 表需要重建...');
            db.exec('DROP TABLE IF EXISTS llm_config');
            db.exec(`
                CREATE TABLE llm_config (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    api_key TEXT,
                    base_url TEXT DEFAULT 'https://api.openai.com/v1',
                    model_name TEXT DEFAULT 'gpt-4o-mini',
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            db.prepare(`
                INSERT INTO llm_config (id, base_url, model_name) 
                VALUES (1, 'https://api.openai.com/v1', 'gpt-4o-mini')
            `).run();
            console.log('✅ llm_config 表已重建');
        }
    }
}

// 初始化数据库结构
function initDatabase(): void {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);

    // 运行迁移以确保所有字段存在
    migrateDatabase();

    console.log('✅ 数据库初始化完成:', dbPath);
}

// 导出数据库实例和初始化函数
export { db, initDatabase, dbPath };
export default db;

