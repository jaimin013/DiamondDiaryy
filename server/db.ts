import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databaseFile = process.env.DATABASE_FILE ?? "database.db";
const rawDb = new Database(databaseFile);
const db = drizzle(rawDb);

export { rawDb, db };

// Ensure tables exist for existing schema
rawDb.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  language TEXT DEFAULT 'en',
  notification_time TEXT DEFAULT '07:00',
  notifications_enabled TEXT DEFAULT 'true'
);
`);

rawDb.exec(`
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  name TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

rawDb.exec(`
CREATE TABLE IF NOT EXISTS diamonds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  weight_from REAL NOT NULL,
  weight_to REAL NOT NULL,
  price REAL NOT NULL,
  quantity REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
`);

rawDb.exec(`
CREATE TABLE IF NOT EXISTS diamond_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  weight_from REAL NOT NULL,
  weight_to REAL NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

rawDb.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire INTEGER NOT NULL
);
`);

rawDb.exec(`
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
`);

rawDb.exec(`
CREATE TABLE IF NOT EXISTS work_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  is_work_day TEXT NOT NULL DEFAULT 'true',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE (member_id, date)
);
`);

rawDb.exec(`
CREATE INDEX IF NOT EXISTS idx_work_days_user_member ON work_days(user_id, member_id);
CREATE INDEX IF NOT EXISTS idx_work_days_date ON work_days(date);
`);
