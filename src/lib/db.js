import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = {
  query: async (text, params) => {
    return await pool.query(text, params);
  }
};

export async function initDB() {
  await db.query(`
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
      desktop_mockup_url TEXT,
      mobile_mockup_url TEXT,
      assigned_to TEXT,
      lat REAL,
      lng REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portal_notes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS search_schedules (
      id TEXT PRIMARY KEY,
      queries TEXT NOT NULL,
      schedule_type TEXT DEFAULT 'once',
      schedule_day INTEGER DEFAULT 1,
      last_run TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      campaign_id TEXT,
      email TEXT,
      status TEXT DEFAULT 'pending',
      sent_at TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      title TEXT,
      items TEXT NOT NULL,
      total REAL,
      notes TEXT,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolio_references (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      image_url TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.query(`ALTER TABLE leads ADD COLUMN desktop_mockup_url TEXT;`);
  } catch (e) { /* Ignore if exists */ }
  
  try {
    await db.query(`ALTER TABLE leads ADD COLUMN mobile_mockup_url TEXT;`);
  } catch (e) { /* Ignore if exists */ }

  try {
    await db.query(`ALTER TABLE leads ADD COLUMN assigned_to TEXT;`);
  } catch (e) { /* Ignore if exists */ }
}

// We don't auto-call initDB here because top-level await is tricky in Next.js edge/serverless without strict configs.
// Instead, we can call it inside the API routes if necessary, or let the user hit an init endpoint.
// But for now, we'll expose a wrapper.

export default db;
