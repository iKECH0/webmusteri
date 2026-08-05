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
      website TEXT,
      has_website INTEGER DEFAULT 0,
      category TEXT,
      status TEXT DEFAULT 'new',
      notes TEXT,
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
  `);

  // Add new columns to existing leads table if they don't exist
  const columns = db.pragma('table_info(leads)').map(c => c.name);
  if (!columns.includes('next_followup_date')) db.exec("ALTER TABLE leads ADD COLUMN next_followup_date TEXT;");
  if (!columns.includes('revenue')) db.exec("ALTER TABLE leads ADD COLUMN revenue REAL DEFAULT 0;");
  if (!columns.includes('lat')) db.exec("ALTER TABLE leads ADD COLUMN lat REAL;");
  if (!columns.includes('lng')) db.exec("ALTER TABLE leads ADD COLUMN lng REAL;");
}

initDB();

export default db;
