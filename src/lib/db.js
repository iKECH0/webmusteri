import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath, { verbose: undefined });
db.pragma('journal_mode = WAL');

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
      email TEXT,
      website TEXT,
      has_website INTEGER DEFAULT 0,
      category TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
      tags TEXT DEFAULT '[]',
      ai_score INTEGER DEFAULT 0,
      rating REAL,
      review_count INTEGER,
      portal_token TEXT UNIQUE,
      portal_viewed INTEGER DEFAULT 0,
      next_followup_date TEXT,
      revenue REAL DEFAULT 0,
      lat REAL,
      lng REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS search_schedules (
      id TEXT PRIMARY KEY,
      queries TEXT NOT NULL,
      schedule_type TEXT DEFAULT 'once',
      schedule_day INTEGER DEFAULT 1,
      last_run TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      campaign_id TEXT,
      email TEXT,
      status TEXT DEFAULT 'pending',
      sent_at DATETIME,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      title TEXT,
      items TEXT NOT NULL,
      total REAL,
      notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
  `);

  // Migrate existing leads table — add new columns if missing
  const cols = db.pragma('table_info(leads)').map(c => c.name);
  const addCol = (col, type) => {
    if (!cols.includes(col)) db.exec(`ALTER TABLE leads ADD COLUMN ${col} ${type};`);
  };
  addCol('email', 'TEXT');
  addCol('tags', "TEXT DEFAULT '[]'");
  addCol('ai_score', 'INTEGER DEFAULT 0');
  addCol('rating', 'REAL');
  addCol('review_count', 'INTEGER');
  addCol('portal_token', 'TEXT');
  addCol('portal_viewed', 'INTEGER DEFAULT 0');
  addCol('next_followup_date', 'TEXT');
  addCol('revenue', 'REAL DEFAULT 0');
  addCol('lat', 'REAL');
  addCol('lng', 'REAL');
}

initDB();
export default db;
