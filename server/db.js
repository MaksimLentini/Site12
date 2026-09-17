// ═══════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ SQLite БАЗЫ ДАННЫХ
// Файл БД: ./data/messenger.db
// ═══════════════════════════════════════════════════════════
import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'messenger.db');

// Создаём папку data если не существует
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Открываем/создаём БД
const db = new Database(DB_PATH);

// Настройки производительности
db.pragma('journal_mode = WAL');        // WAL-режим для параллельных чтений
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');       // 64MB кэш
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

console.log(`[DB] База данных: ${DB_PATH}`);

// ═══ МИГРАЦИИ ═══
function runMigrations() {
  // Таблица версий миграций
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const currentVersion = db.prepare('SELECT MAX(version) as v FROM schema_version').get()?.v || 0;

  const migrations = [
    // Миграция 1: Пользователи
    {
      version: 1,
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK(role IN ('user','moderator','admin','superadmin')),
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
        CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
      `
    },
    // Миграция 2: Сессии
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
          revoked INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
      `
    },
    // Миграция 3: Чаты
    {
      version: 3,
      sql: `
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('private','group','channel')),
          title TEXT DEFAULT '',
          avatar TEXT DEFAULT '',
          created_by TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          is_secret INTEGER DEFAULT 0,
          FOREIGN KEY (created_by) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS chat_members (
          chat_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          role TEXT DEFAULT 'member' CHECK(role IN ('owner','admin','member')),
          joined_at INTEGER NOT NULL,
          muted_until INTEGER DEFAULT 0,
          PRIMARY KEY (chat_id, user_id),
          FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
      `
    },
    // Миграция 4: Сообщения
    {
      version: 4,
      sql: `
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          content TEXT DEFAULT '',
          type TEXT DEFAULT 'text' CHECK(type IN ('text','image','video','voice','sticker','file','poll','video_note')),
          reply_to TEXT DEFAULT '',
          forwarded_from TEXT DEFAULT '',
          is_edited INTEGER DEFAULT 0,
          is_deleted INTEGER DEFAULT 0,
          meta_json TEXT DEFAULT '{}',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS message_reads (
          message_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          read_at INTEGER NOT NULL,
          PRIMARY KEY (message_id, user_id),
          FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS reactions (
          message_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          emoji TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (message_id, user_id, emoji),
          FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
      `
    },
    // Миграция 5: Посты
    {
      version: 5,
      sql: `
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT DEFAULT '',
          type TEXT DEFAULT 'text' CHECK(type IN ('photo','video','text','carousel','reel')),
          media_json TEXT DEFAULT '[]',
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          shares_count INTEGER DEFAULT 0,
          is_hidden INTEGER DEFAULT 0,
          location TEXT DEFAULT '',
          hashtags_json TEXT DEFAULT '[]',
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
          created_at INTEGER NOT NULL,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
        CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
      `
    },
    // Миграция 6: Сторис
    {
      version: 6,
      sql: `
        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          media TEXT NOT NULL,
          text_content TEXT DEFAULT '',
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS story_views (
          story_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          viewed_at INTEGER NOT NULL,
          PRIMARY KEY (story_id, user_id),
          FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
      `
    },
    // Миграция 7: Видео
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
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_videos_user ON videos(user_id);
        CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at);
      `
    },
    // Миграция 8: Музыка
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
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `
    },
    // Миграция 9: Подписки и друзья
    {
      version: 9,
      sql: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          follower_id TEXT NOT NULL,
          following_id TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          PRIMARY KEY (follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS friends (
          user_id TEXT NOT NULL,
          friend_id TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accepted','blocked')),
          created_at INTEGER NOT NULL,
          PRIMARY KEY (user_id, friend_id)
        );
        CREATE INDEX IF NOT EXISTS idx_subs_follower ON subscriptions(follower_id);
        CREATE INDEX IF NOT EXISTS idx_subs_following ON subscriptions(following_id);
      `
    },
    // Миграция 10: Уведомления
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
          created_at INTEGER NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at);
      `
    },
    // Миграция 11: Жалобы
    {
      version: 11,
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY,
          reporter_id TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id TEXT NOT NULL,
          reason TEXT NOT NULL,
          status TEXT DEFAULT 'pending' CHECK(status IN ('pending','reviewed','resolved','dismissed')),
          moderator_id TEXT DEFAULT '',
          created_at INTEGER NOT NULL,
          resolved_at INTEGER DEFAULT 0,
          FOREIGN KEY (reporter_id) REFERENCES users(id)
        );
        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      `
    },
    // Миграция 12: Аудит-лог
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
        CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
      `
    },
    // Миграция 13: Настройки сайта
    {
      version: 13,
      sql: `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `
    },
    // Миграция 14: Баны IP
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
        CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts(ip, created_at);
      `
    }
  ];

  // Применяем миграции
  const insertVersion = db.prepare('INSERT INTO schema_version (version) VALUES (?)');
  
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`[DB] Применение миграции ${migration.version}...`);
      db.exec(migration.sql);
      insertVersion.run(migration.version);
    }
  }

  console.log(`[DB] Миграции завершены. Версия схемы: ${migrations[migrations.length - 1].version}`);
}

// Запускаем миграции
runMigrations();

export default db;
