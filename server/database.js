const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const initialize = () => {
  db.serialize(() => {
    // Leads table
    db.run(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        email TEXT,
        company TEXT,
        notes TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Campaigns table
    db.run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        assistant_id TEXT,
        telnyx_assistant_id TEXT,
        phone_number TEXT,
        connection_id TEXT,
        status TEXT DEFAULT 'draft',
        total_leads INTEGER DEFAULT 0,
        called_leads INTEGER DEFAULT 0,
        successful_appointments INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Campaign leads (many-to-many relationship)
    db.run(`
      CREATE TABLE IF NOT EXISTS campaign_leads (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        lead_id TEXT NOT NULL,
        call_status TEXT DEFAULT 'pending',
        call_id TEXT,
        call_duration INTEGER,
        call_recording_url TEXT,
        appointment_set BOOLEAN DEFAULT 0,
        notes TEXT,
        called_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
      )
    `);

    // Appointments table
    db.run(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        campaign_lead_id TEXT NOT NULL,
        lead_id TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        appointment_date DATETIME NOT NULL,
        status TEXT DEFAULT 'scheduled',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_lead_id) REFERENCES campaign_leads (id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE
      )
    `);

    // AI Assistants configuration table
    db.run(`
      CREATE TABLE IF NOT EXISTS assistants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        telnyx_assistant_id TEXT,
        voice TEXT DEFAULT 'alloy',
        language TEXT DEFAULT 'it',
        prompt TEXT NOT NULL,
        max_duration INTEGER DEFAULT 300,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully');
  });
};

module.exports = {
  db,
  initialize
};
