const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'streetfood.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      choice TEXT NOT NULL CHECK(choice IN ('yes', 'no')),
      decision_time_ms INTEGER DEFAULT 0,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, item_id),
      FOREIGN KEY(item_id) REFERENCES items(id)
    );

    CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
    CREATE INDEX IF NOT EXISTS idx_votes_item ON votes(item_id);
  `);
};

// Initialize schema on load
initSchema();

module.exports = db;
