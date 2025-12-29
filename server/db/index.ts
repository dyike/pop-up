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

// 初始化数据库结构
function initDatabase(): void {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    console.log('✅ 数据库初始化完成:', dbPath);
}

// 导出数据库实例和初始化函数
export { db, initDatabase, dbPath };
export default db;
