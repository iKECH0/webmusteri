import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

let isInitialized = false;
let initPromise = null;

export async function initDB() {
  // 1. Settings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // 2. Agents (Temsilciler)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'agent',
      is_active INTEGER DEFAULT 1,
      avatar_url TEXT,
      session_token TEXT,
      session_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const agentColumns = [
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS session_token TEXT;`,
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS session_expires TIMESTAMP;`,
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS phone TEXT;`,
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'agent';`,
    `ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;`
  ];

  for (const colQuery of agentColumns) {
    try {
      await pool.query(colQuery);
    } catch (e) {
      // Ignore if already exists
    }
  }

  // 3. Leads (Müşteriler)
  await pool.query(`
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
      referred_by TEXT,
      lat REAL,
      lng REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Column migrations for leads
  const leadColumns = [
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS desktop_mockup_url TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS mobile_mockup_url TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS referred_by TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_token TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS portal_viewed INTEGER DEFAULT 0;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS rating REAL;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS review_count INTEGER;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup_date TEXT;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS revenue REAL DEFAULT 0;`,
    `ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]';`
  ];

  for (const colQuery of leadColumns) {
    try {
      await pool.query(colQuery);
    } catch (e) {
      // Ignore if already exists
    }
  }

  // 4. Activity Logs (İletişim Takip Günlüğü)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      agent_id TEXT NOT NULL,
      type TEXT NOT NULL,
      note TEXT,
      duration_seconds INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Message Templates (Mesaj Şablonları)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      channel TEXT NOT NULL,
      content TEXT NOT NULL,
      variables TEXT DEFAULT '[]',
      is_global INTEGER DEFAULT 1,
      created_by TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Referrals (Referans Linkleri)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Call Logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS call_logs (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Portal Notes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portal_notes (
      id TEXT PRIMARY KEY,
      lead_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Search Schedules
  await pool.query(`
    CREATE TABLE IF NOT EXISTS search_schedules (
      id TEXT PRIMARY KEY,
      queries TEXT NOT NULL,
      schedule_type TEXT DEFAULT 'once',
      schedule_day INTEGER DEFAULT 1,
      schedule_time TEXT DEFAULT '09:00',
      is_active INTEGER DEFAULT 1,
      last_run_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  isInitialized = true;
}

export async function ensureInit() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = initDB().catch(err => {
      console.error("Auto DB Init error:", err);
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

export const db = {
  query: async (text, params) => {
    // Auto initialize if not initialized yet
    if (!isInitialized) {
      try {
        await ensureInit();
      } catch (err) {
        console.error("DB init failed before query, attempting direct query:", err);
      }
    }
    return await pool.query(text, params);
  }
};

export default db;
