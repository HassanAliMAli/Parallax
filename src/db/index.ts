import Database from 'better-sqlite3';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../../data');
const DB_PATH = path.join(DATA_DIR, 'perplex_bridge.db');

export const db = new Database(DB_PATH, { verbose: console.log });

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`Database connected at ${DB_PATH}`);
