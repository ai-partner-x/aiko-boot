/**
 * Initialize a clean database for api-clean template.
 * Run: pnpm init-db
 */
import 'reflect-metadata';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { createKyselyDatabase, getKyselyDatabase } from '@ai-partner-x/aiko-boot-starter-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/app.db');
const dir = dirname(dbPath);

if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

await createKyselyDatabase({
  type: 'sqlite',
  filename: dbPath,
});

const db = getKyselyDatabase();
await db.schema
  .createTable('app_health')
  .ifNotExists()
  .addColumn('id', 'integer', (col: any) => col.primaryKey().autoIncrement())
  .addColumn('status', 'varchar(32)', (col: any) => col.notNull())
  .addColumn('created_at', 'datetime', (col: any) => col.notNull())
  .execute();

const exists = await db
  .selectFrom('app_health')
  .selectAll()
  .where('status', '=', 'ok')
  .executeTakeFirst();

if (!exists) {
  await db
    .insertInto('app_health')
    .values({
      status: 'ok',
      created_at: new Date().toISOString(),
    })
    .execute();
}

console.log('Database initialized at:', dbPath);
process.exit(0);
