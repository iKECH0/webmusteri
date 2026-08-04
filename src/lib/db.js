import Database from 'better-sqlite3';
import path from 'path';

// Define DB path
const dbPath = path.join(process.cwd(), 'crm.db');

// Connect to SQLite
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      place_id TEXT UNIQUE,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      website TEXT,
      has_website INTEGER DEFAULT 0,
      category TEXT,
      status TEXT DEFAULT 'new', -- new, contacted, interested, closed, rejected
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Database initialized.");
}

initDB();

export default db;
