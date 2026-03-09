/**
 * 初始化 SQLite 数据库表结构（用户 + 登录）
 * 使用 sql.js（纯 JS，无需编译 better-sqlite3）便于直接运行 init-db
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
// @ts-expect-error sql.js has no types
import initSqlJs from 'sql.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/app.db');

console.log('📁 Database path:', dbPath);

const SQL = await initSqlJs();
const db = new SQL.Database();

db.run(`
  CREATE TABLE IF NOT EXISTS sys_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('✅ Created table: sys_user');

const defaultUsers = [
  { user_name: 'admin', password_hash: 'admin123', email: 'admin@example.com' },
];

for (const u of defaultUsers) {
  try {
    db.run(
      'INSERT OR IGNORE INTO sys_user (user_name, password_hash, email) VALUES (?, ?, ?)',
      [u.user_name, u.password_hash, u.email]
    );
    console.log(`✅ Inserted user: ${u.user_name}`);
  } catch {
    console.log(`⏭️  User exists: ${u.user_name}`);
  }
}

const data = db.export();
db.close();

const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}
writeFileSync(dbPath, Buffer.from(data));

console.log('\n🎉 Database initialization complete!');
