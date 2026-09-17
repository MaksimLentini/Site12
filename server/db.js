// ═══════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ SQLite БАЗЫ ДАННЫХ (sql.js — WebAssembly)
// Работает на Windows без компиляции C++
// Файл БД: ./data/messenger.db
// ═══════════════════════════════════════════════════════════
import initSqlJs from 'sql.js';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'messenger.db');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ═══ WRAPPER КЛАСС — имитирует better-sqlite3 API ═══
class DatabaseWrapper {
  constructor(sqlDb) {
    this.db = sqlDb;
    this.saveInterval = null;
  }

  // Сохранение БД на диск
  save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }

  // Авто-сохранение каждые 5 секунд
  startAutoSave() {
    this.saveInterval = setInterval(() => this.save(), 5000);
  }

  // Выполнение SQL без результата
  exec(sql) {
    this.db.run(sql);
    this.save();
  }

  // Prepare statement (возвращает объект с методами get/run/all)
  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        try {
          self.db.run(sql, params);
          const results = self._extractResults();
          return results[0] || undefined;
        } catch (e) {
          console.error('[DB] Error in get:', e.message, sql, params);
          return undefined;
        }
      },
      all(...params) {
        try {
          self.db.run(sql, params);
          return self._extractResults();
        } catch (e) {
          console.error('[DB] Error in all:', e.message, sql, params);
          return [];
        }
      },
      run(...params) {
        try {
          self.db.run(sql, params);
          self.save();
          const changes = self.db.getRowsModified();
          const lastId = self.db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
          return { changes, lastInsertRowid: lastId };
        } catch (e) {
          console.error('[DB] Error in run:', e.message, sql, params);
          return { changes: 0, lastInsertRowid: 0 };
        }
      },
      // Внутренний метод для извлечения результатов
      _extractResults: function() {
        // sql.js сохраняет результат последнего запроса
        // Нужно использовать exec для получения данных
        return [];
      }
    };
  }

  // Переопределим prepare чтобы правильно работать с результатами
  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        try {
          const stmt = self.db.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        } catch (e) {
          console.error('[DB] get error:', e.message);
          return undefined;
        }
      },
      all(...params) {
        try {
          const stmt = self.db.prepare(sql);
          if (params.length > 0) stmt.bind(params);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        } catch (e) {
          console.error('[DB] all error:', e.message);
          return [];
        }
      },
      run(...params) {
        try {
          self.db.run(sql, params);
          self.save();
          const changes = self.db.getRowsModified();
          return { changes };
        } catch (e) {
          console.error('[DB] run error:', e.message, sql, params);
          return { changes: 0 };
        }
      }
    };
  }

  // pragma
  pragma(str) {
    try { this.db.run(`PRAGMA ${str}`); } catch {}
  }

  // transaction
  transaction(fn) {
    return (...args) => {
      this.db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        this.db.run('COMMIT');
        this.save();
        return result;
      } catch (e) {
        this.db.run('ROLLBACK');
        throw e;
      }
    };
  }
}

// ═══ ИНИЦИАЛИЗАЦИЯ ═══
let db = null;

export async function initDatabase() {
  console.log('[DB] Инициализация SQLite (sql.js)...');
  
  const SQL = await initSqlJs();
  
  // Загружаем существующую БД или создаём новую
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new DatabaseWrapper(new SQL.Database(fileBuffer));
    console.log(`[DB] Загружена существующая БД: ${DB_PATH}`);
  } else {
    db = new DatabaseWrapper(new SQL.Database());
    console.log(`[DB] Создана новая БД: ${DB_PATH}`);
  }

  // Настройки
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Запуск миграций
  runMigrations();

  // Авто-сохранение
  db.startAutoSave();

  console.log(`[DB] ✅ База данных готова`);
  return db;
}

// ═══ МИГРАЦИИ ═══
function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
  const currentVersion = row?.v || 0;

  const migrations = [
    {
      version: 1,
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          avatar TEXT DEFAULT '',
          cover TEXT DEFAULT '',
          bio TEXT DEFAULT '',
          status TEXT DEFAULT '',
          is_online INTEGER DEFAULT 0,
          last_seen INTEGER DEFAULT 0,
          is_banned INTEGER DEFAULT 0,
          ban_reason TEXT DEFAULT '',
          twofa_secret TEXT DEFAULT '',
          twofa_enabled INTEGER DEFAULT 0,
          privacy_json TEXT DEFAULT '{}',
          settings_json TEXT DEFAULT '{}',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `
    },
    {
      version: 2,
      sql: `
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token_hash TEXT NOT NULL,
          ip TEXT DEFAULT '',
          user_agent TEXT DEFAULT '',
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL,
          revoked INTEGER DEFAULT 0
        );
      `
    },
    {
      version: 3,
      sql: `
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          title TEXT DEFAULT '',
          avatar TEXT DEFAULT '',
          created_by TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          is_secret INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS chat_members (
          chat_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          joined_at INTEGER NOT NULL,
          muted_until INTEGER DEFAULT 0,
          PRIMARY KEY (chat_id, user_id)
        );
      `
    },
    {
      version: 4,
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT DEFAULT '',
          type TEXT DEFAULT 'text',
          reply_to TEXT DEFAULT '',
          forwarded_from TEXT DEFAULT '',
          is_edited INTEGER DEFAULT 0,
          is_deleted INTEGER DEFAULT 0,
          meta_json TEXT DEFAULT '{}',
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS message_reads (
          message_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          read_at INTEGER NOT NULL,
          PRIMARY KEY (message_id, user_id)
        );
        CREATE TABLE IF NOT EXISTS reactions (
          message_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          emoji TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (message_id, user_id, emoji)
        );
        CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);
      `
    },
    {
      version: 5,
      sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT DEFAULT '',
          type TEXT DEFAULT 'text',
          media_json TEXT DEFAULT '[]',
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          shares_count INTEGER DEFAULT 0,
          is_hidden INTEGER DEFAULT 0,
          location TEXT DEFAULT '',
          hashtags_json TEXT DEFAULT '[]',
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS likes (
          user_id TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, target_type, target_id)
        );
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          post_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          parent_id TEXT DEFAULT '',
          content TEXT NOT NULL,
          is_hidden INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at);
      `
    },
    {
      version: 6,
      sql: `
        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          media TEXT NOT NULL,
          text_content TEXT DEFAULT '',
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS story_views (
          story_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          viewed_at INTEGER NOT NULL,
          PRIMARY KEY (story_id, user_id)
        );
      `
    },
    {
      version: 7,
      sql: `
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT DEFAULT '',
          file_path TEXT DEFAULT '',
          thumbnail TEXT DEFAULT '',
          duration INTEGER DEFAULT 0,
          views_count INTEGER DEFAULT 0,
          likes_count INTEGER DEFAULT 0,
          tags_json TEXT DEFAULT '[]',
          is_short INTEGER DEFAULT 0,
          is_hidden INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
      `
    },
    {
      version: 8,
      sql: `
        CREATE TABLE IF NOT EXISTS music (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          artist TEXT DEFAULT '',
          file_path TEXT DEFAULT '',
          duration INTEGER DEFAULT 0,
          cover TEXT DEFAULT '',
          plays_count INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
      `
    },
    {
      version: 9,
      sql: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          follower_id TEXT NOT NULL,
          following_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (follower_id, following_id)
        );
        CREATE TABLE IF NOT EXISTS friends (
          user_id TEXT NOT NULL,
          friend_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, friend_id)
        );
      `
    },
    {
      version: 10,
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT DEFAULT '',
          body TEXT DEFAULT '',
          link TEXT DEFAULT '',
          is_read INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);
      `
    },
    {
      version: 11,
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          reporter_id TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          moderator_id TEXT DEFAULT '',
          created_at INTEGER NOT NULL,
          resolved_at INTEGER DEFAULT 0
        );
      `
    },
    {
      version: 12,
      sql: `
        CREATE TABLE IF NOT EXISTS audit_log (
          id TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL,
          action TEXT NOT NULL,
          target_type TEXT DEFAULT '',
          target_id TEXT DEFAULT '',
          details TEXT DEFAULT '',
          ip TEXT DEFAULT '',
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
      `
    },
    {
      version: 13,
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `
    },
    {
      version: 14,
      sql: `
        CREATE TABLE IF NOT EXISTS ip_bans (
          id TEXT PRIMARY KEY,
          ip_cidr TEXT NOT NULL,
          reason TEXT DEFAULT '',
          until INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS login_attempts (
          id TEXT PRIMARY KEY,
          ip TEXT NOT NULL,
          username TEXT DEFAULT '',
          success INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );
      `
    }
  ];

  for (const m of migrations) {
    if (m.version > currentVersion) {
      console.log(`[DB] Миграция ${m.version}...`);
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(m.version);
    }
  }

  console.log(`[DB] Миграции завершены`);
}

export function getDb() {
  if (!db) throw new Error('База данных не инициализирована. Вызовите initDatabase()');
  return db;
}

export default { initDatabase, getDb };
