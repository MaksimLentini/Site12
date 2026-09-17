// ═══════════════════════════════════════════════════════════
// MEGACHAT SERVER — Express + Socket.IO + SQLite (sql.js)
// Работает на Windows без компиляции C++
// Запуск: cd server && npm install && npm start
// ═══════════════════════════════════════════════════════════
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getDb } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'megachat-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ═══ MIDDLEWARE ═══
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Статика (dist фронтенда)
app.use(express.static(join(__dirname, '..', 'dist')));

// ═══ УТИЛИТЫ ═══
function generateId() { return uuidv4(); }
function now() { return Date.now(); }

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    req.user = db.prepare('SELECT id, username, email, role, avatar, bio, is_banned FROM users WHERE id = ?').get(decoded.userId);
    if (!req.user) return res.status(401).json({ error: 'Пользователь не найден' });
    if (req.user.is_banned) return res.status(403).json({ error: 'Аккаунт заблокирован' });
    next();
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Недостаточно прав' });
    next();
  };
}

function addAuditLog(adminId, action, targetType = '', targetId = '', details = '', ip = '') {
  const db = getDb();
  db.prepare('INSERT INTO audit_log (id, admin_id, action, target_type, target_id, details, ip, created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(generateId(), adminId, action, targetType, targetId, details, ip, now());
}

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════

app.post('/api/auth/register', (req, res) => {
  const db = getDb();
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Заполните все поля' });
  if (username.length < 3) return res.status(400).json({ error: 'Имя минимум 3 символа' });
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) return res.status(409).json({ error: 'Имя или email уже заняты' });

  const id = generateId();
  const passwordHash = bcrypt.hashSync(password, 12);
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const userCount = countRow?.count || 0;
  
  const role = userCount === 0 ? 'superadmin' : 'user';
  
  db.prepare('INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, username, email, passwordHash, role, now(), now());

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  const user = db.prepare('SELECT id, username, email, role, avatar, bio, status FROM users WHERE id = ?').get(id);
  
  console.log(`[AUTH] Регистрация: ${username} (${role})`);
  res.json({ token, user });
});

app.post('/api/auth/login', (req, res) => {
  const db = getDb();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
  if (user.is_banned) return res.status(403).json({ error: `Аккаунт заблокирован: ${user.ban_reason}` });
  
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
  }

  db.prepare('UPDATE users SET is_online = 1, last_seen = ? WHERE id = ?').run(now(), user.id);
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  const safeUser = { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio, status: user.status };
  
  console.log(`[AUTH] Вход: ${username}`);
  res.json({ token, user: safeUser });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?').run(now(), req.user.id);
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, email, role, avatar, cover, bio, status, is_online, last_seen, settings_json, privacy_json, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ═══════════════════════════════════════════════════════════
// USERS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/users', authenticate, (req, res) => {
  const db = getDb();
  const { search, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT id, username, email, role, avatar, bio, is_online, last_seen, is_banned, created_at FROM users';
  const params = [];
  if (search) { query += ' WHERE username LIKE ? OR email LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  const users = db.prepare(query).all(...params);
  res.json({ users, total: users.length });
});

app.get('/api/users/:id', authenticate, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, username, avatar, cover, bio, status, is_online, last_seen, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
  const followers = db.prepare('SELECT COUNT(*) as count FROM subscriptions WHERE following_id = ?').get(req.params.id)?.count || 0;
  const following = db.prepare('SELECT COUNT(*) as count FROM subscriptions WHERE follower_id = ?').get(req.params.id)?.count || 0;
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND is_hidden = 0').get(req.params.id)?.count || 0;
  res.json({ ...user, followers, following, postsCount });
});

app.put('/api/users/me', authenticate, (req, res) => {
  const db = getDb();
  const { bio, status, avatar, cover, settings } = req.body;
  const updates = [];
  const params = [];
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
  if (cover !== undefined) { updates.push('cover = ?'); params.push(cover); }
  if (settings) { updates.push('settings_json = ?'); params.push(JSON.stringify(settings)); }
  if (updates.length === 0) return res.status(400).json({ error: 'Нет данных для обновления' });
  updates.push('updated_at = ?'); params.push(now());
  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  res.json({ success: true });
});

app.post('/api/users/:id/follow', authenticate, (req, res) => {
  const db = getDb();
  const targetId = req.params.id;
  if (targetId === req.user.id) return res.status(400).json({ error: 'Нельзя подписаться на себя' });
  try {
    db.prepare('INSERT INTO subscriptions (follower_id, following_id, created_at) VALUES (?,?,?)').run(req.user.id, targetId, now());
    res.json({ success: true });
  } catch { res.json({ success: true }); }
});

app.delete('/api/users/:id/follow', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM subscriptions WHERE follower_id = ? AND following_id = ?').run(req.user.id, req.params.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// CHATS & MESSAGES ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/chats', authenticate, (req, res) => {
  const db = getDb();
  const chats = db.prepare(`
    SELECT c.* FROM chats c 
    JOIN chat_members cm ON c.id = cm.chat_id 
    WHERE cm.user_id = ? 
    ORDER BY c.created_at DESC
  `).all(req.user.id);
  
  const result = chats.map(chat => {
    const lastMsg = db.prepare('SELECT * FROM messages WHERE chat_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT 1').get(chat.id);
    const members = db.prepare('SELECT user_id FROM chat_members WHERE chat_id = ?').all(chat.id).map(m => m.user_id);
    return { ...chat, members, lastMessage: lastMsg };
  });
  res.json(result);
});

app.post('/api/chats', authenticate, (req, res) => {
  const db = getDb();
  const { type, title, members } = req.body;
  const chatId = generateId();
  const allMembers = [req.user.id, ...(members || [])];
  
  db.prepare('INSERT INTO chats (id, type, title, created_by, created_at) VALUES (?,?,?,?,?)')
    .run(chatId, type || 'private', title || '', req.user.id, now());
  
  allMembers.forEach((mId, i) => {
    db.prepare('INSERT INTO chat_members (chat_id, user_id, role, joined_at) VALUES (?,?,?,?)')
      .run(chatId, mId, i === 0 ? 'owner' : 'member', now());
  });
  
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
  res.json({ ...chat, members: allMembers });
});

app.get('/api/chats/:id/messages', authenticate, (req, res) => {
  const db = getDb();
  const { limit = 100, before } = req.query;
  let query = 'SELECT * FROM messages WHERE chat_id = ? AND is_deleted = 0';
  const params = [req.params.id];
  if (before) { query += ' AND created_at < ?'; params.push(Number(before)); }
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));
  const messages = db.prepare(query).all(...params).reverse();
  
  const msgIds = messages.map(m => m.id);
  if (msgIds.length > 0) {
    const placeholders = msgIds.map(() => '?').join(',');
    const reactions = db.prepare(`SELECT message_id, user_id, emoji FROM reactions WHERE message_id IN (${placeholders})`).all(...msgIds);
    messages.forEach(m => {
      m.reactions = {};
      reactions.filter(r => r.message_id === m.id).forEach(r => {
        if (!m.reactions[r.emoji]) m.reactions[r.emoji] = [];
        m.reactions[r.emoji].push(r.user_id);
      });
    });
  }
  res.json(messages);
});

app.post('/api/chats/:id/messages', authenticate, (req, res) => {
  const db = getDb();
  const { content, type = 'text', reply_to } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Пустое сообщение' });
  
  const membership = db.prepare('SELECT * FROM chat_members WHERE chat_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!membership) return res.status(403).json({ error: 'Вы не участник этого чата' });

  const msgId = generateId();
  db.prepare('INSERT INTO messages (id, chat_id, user_id, content, type, reply_to, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(msgId, req.params.id, req.user.id, content, type, reply_to || '', now());
  
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(msgId);
  io.to(`chat_${req.params.id}`).emit('new_message', msg);
  
  res.json(msg);
});

app.post('/api/messages/:id/react', authenticate, (req, res) => {
  const db = getDb();
  const { emoji } = req.body;
  const msgId = req.params.id;
  const existing = db.prepare('SELECT * FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').get(msgId, req.user.id, emoji);
  if (existing) {
    db.prepare('DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').run(msgId, req.user.id, emoji);
  } else {
    db.prepare('INSERT INTO reactions (message_id, user_id, emoji, created_at) VALUES (?,?,?,?)').run(msgId, req.user.id, emoji, now());
  }
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// POSTS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/posts', authenticate, (req, res) => {
  const db = getDb();
  const { limit = 50, offset = 0 } = req.query;
  const posts = db.prepare('SELECT * FROM posts WHERE is_hidden = 0 ORDER BY created_at DESC LIMIT ? OFFSET ?').all(Number(limit), Number(offset));
  const result = posts.map(p => {
    const likes = db.prepare('SELECT user_id FROM likes WHERE target_type = ? AND target_id = ?').all('post', p.id).map(l => l.user_id);
    return { ...p, media: JSON.parse(p.media_json || '[]'), hashtags: JSON.parse(p.hashtags_json || '[]'), likes };
  });
  res.json(result);
});

app.post('/api/posts', authenticate, (req, res) => {
  const db = getDb();
  const { content, type = 'text', media = [], hashtags = [] } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Пустой пост' });
  
  const id = generateId();
  db.prepare('INSERT INTO posts (id, user_id, content, type, media_json, hashtags_json, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.user.id, content, type, JSON.stringify(media), JSON.stringify(hashtags), now());
  
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.json({ ...post, media, hashtags, likes: [] });
});

app.post('/api/posts/:id/like', authenticate, (req, res) => {
  const db = getDb();
  const postId = req.params.id;
  const existing = db.prepare('SELECT * FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').get(req.user.id, 'post', postId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND target_type = ? AND target_id = ?').run(req.user.id, 'post', postId);
    db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
  } else {
    db.prepare('INSERT INTO likes (user_id, target_type, target_id, created_at) VALUES (?,?,?,?)').run(req.user.id, 'post', postId, now());
    db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
  }
  const count = db.prepare('SELECT likes_count FROM posts WHERE id = ?').get(postId)?.likes_count || 0;
  res.json({ likes: count });
});

app.delete('/api/posts/:id', authenticate, (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Пост не найден' });
  if (post.user_id !== req.user.id && !['admin', 'superadmin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Нет прав' });
  }
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// STORIES ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/stories', authenticate, (req, res) => {
  const db = getDb();
  const stories = db.prepare('SELECT * FROM stories WHERE expires_at > ? ORDER BY created_at DESC').all(now());
  res.json(stories);
});

app.post('/api/stories', authenticate, (req, res) => {
  const db = getDb();
  const { media, text } = req.body;
  if (!media) return res.status(400).json({ error: 'Укажите медиа' });
  const id = generateId();
  const expiresAt = now() + 24 * 60 * 60 * 1000;
  db.prepare('INSERT INTO stories (id, user_id, media, text_content, expires_at, created_at) VALUES (?,?,?,?,?,?)')
    .run(id, req.user.id, media, text || '', expiresAt, now());
  res.json({ id, media, text, expires_at: expiresAt, created_at: now() });
});

// ═══════════════════════════════════════════════════════════
// VIDEOS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/videos', authenticate, (req, res) => {
  const db = getDb();
  const { short } = req.query;
  let query = 'SELECT * FROM videos WHERE is_hidden = 0';
  if (short === 'true') query += ' AND is_short = 1';
  else if (short === 'false') query += ' AND is_short = 0';
  query += ' ORDER BY created_at DESC';
  const videos = db.prepare(query).all();
  res.json(videos.map(v => ({ ...v, tags: JSON.parse(v.tags_json || '[]') })));
});

app.post('/api/videos', authenticate, (req, res) => {
  const db = getDb();
  const { title, description, thumbnail, duration, tags = [], is_short = false } = req.body;
  if (!title) return res.status(400).json({ error: 'Укажите название' });
  const id = generateId();
  db.prepare('INSERT INTO videos (id, user_id, title, description, thumbnail, duration, tags_json, is_short, created_at) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, req.user.id, title, description || '', thumbnail || '', duration || 0, JSON.stringify(tags), is_short ? 1 : 0, now());
  res.json({ id, title, description, thumbnail, duration, tags, is_short });
});

app.post('/api/videos/:id/view', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE videos SET views_count = views_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// MUSIC ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/music', authenticate, (req, res) => {
  const db = getDb();
  const tracks = db.prepare('SELECT * FROM music ORDER BY created_at DESC').all();
  res.json(tracks);
});

app.post('/api/music', authenticate, (req, res) => {
  const db = getDb();
  const { title, artist, duration, cover } = req.body;
  if (!title) return res.status(400).json({ error: 'Укажите название' });
  const id = generateId();
  db.prepare('INSERT INTO music (id, user_id, title, artist, duration, cover, created_at) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.user.id, title, artist || '', duration || 0, cover || '', now());
  res.json({ id, title, artist, duration, cover });
});

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/notifications', authenticate, (req, res) => {
  const db = getDb();
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  res.json(notifs);
});

app.put('/api/notifications/read', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════

app.get('/api/admin/stats', authenticate, requireRole('admin', 'superadmin', 'moderator'), (req, res) => {
  const db = getDb();
  const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  const postsCount = db.prepare('SELECT COUNT(*) as count FROM posts').get()?.count || 0;
  const videosCount = db.prepare('SELECT COUNT(*) as count FROM videos').get()?.count || 0;
  const messagesCount = db.prepare('SELECT COUNT(*) as count FROM messages').get()?.count || 0;
  const reportsCount = db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get()?.count || 0;
  const onlineCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_online = 1').get()?.count || 0;
  res.json({ users: usersCount, posts: postsCount, videos: videosCount, messages: messagesCount, reports: reportsCount, online: onlineCount });
});

app.get('/api/admin/users', authenticate, requireRole('admin', 'superadmin'), (req, res) => {
  const db = getDb();
  const { search, limit = 100, offset = 0 } = req.query;
  let query = 'SELECT id, username, email, role, avatar, bio, is_online, last_seen, is_banned, ban_reason, created_at FROM users';
  const params = [];
  if (search) { query += ' WHERE username LIKE ? OR email LIKE ?'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  const users = db.prepare(query).all(...params);
  res.json(users);
});

app.put('/api/admin/users/:id/ban', authenticate, requireRole('admin', 'superadmin', 'moderator'), (req, res) => {
  const db = getDb();
  const { reason } = req.body;
  db.prepare('UPDATE users SET is_banned = 1, ban_reason = ? WHERE id = ?').run(reason || '', req.params.id);
  addAuditLog(req.user.id, 'ban_user', 'user', req.params.id, reason || '', req.ip);
  res.json({ success: true });
});

app.put('/api/admin/users/:id/unban', authenticate, requireRole('admin', 'superadmin', 'moderator'), (req, res) => {
  const db = getDb();
  db.prepare('UPDATE users SET is_banned = 0, ban_reason = ? WHERE id = ?').run('', req.params.id);
  addAuditLog(req.user.id, 'unban_user', 'user', req.params.id, '', req.ip);
  res.json({ success: true });
});

app.put('/api/admin/users/:id/role', authenticate, requireRole('superadmin'), (req, res) => {
  const db = getDb();
  const { role } = req.body;
  if (!['user', 'moderator', 'admin', 'superadmin'].includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  addAuditLog(req.user.id, 'change_role', 'user', req.params.id, `Роль: ${role}`, req.ip);
  res.json({ success: true });
});

app.delete('/api/admin/users/:id', authenticate, requireRole('superadmin'), (req, res) => {
  const db = getDb();
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Нельзя удалить себя' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  addAuditLog(req.user.id, 'delete_user', 'user', req.params.id, '', req.ip);
  res.json({ success: true });
});

app.get('/api/admin/reports', authenticate, requireRole('admin', 'superadmin', 'moderator'), (req, res) => {
  const db = getDb();
  const reports = db.prepare('SELECT * FROM reports ORDER BY created_at DESC LIMIT 100').all();
  res.json(reports);
});

app.put('/api/admin/reports/:id', authenticate, requireRole('admin', 'superadmin', 'moderator'), (req, res) => {
  const db = getDb();
  const { status } = req.body;
  db.prepare('UPDATE reports SET status = ?, moderator_id = ?, resolved_at = ? WHERE id = ?')
    .run(status, req.user.id, now(), req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/audit-log', authenticate, requireRole('admin', 'superadmin'), (req, res) => {
  const db = getDb();
  const logs = db.prepare('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200').all();
  res.json(logs);
});

app.get('/api/admin/settings', authenticate, requireRole('admin', 'superadmin'), (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

app.put('/api/admin/settings', authenticate, requireRole('superadmin'), (req, res) => {
  const db = getDb();
  const updates = req.body;
  for (const [key, value] of Object.entries(updates)) {
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
  }
  addAuditLog(req.user.id, 'update_settings', 'settings', '', JSON.stringify(Object.keys(updates)), req.ip);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════

app.get('/api/search', authenticate, (req, res) => {
  const db = getDb();
  const { q, type } = req.query;
  if (!q) return res.json({ users: [], posts: [] });
  
  const users = type !== 'posts' ? db.prepare('SELECT id, username, avatar, bio FROM users WHERE username LIKE ? LIMIT 10').all(`%${q}%`) : [];
  const posts = type !== 'users' ? db.prepare('SELECT id, content, user_id, created_at FROM posts WHERE content LIKE ? AND is_hidden = 0 LIMIT 10').all(`%${q}%`) : [];
  
  res.json({ users, posts });
});

// ═══════════════════════════════════════════════════════════
// SOCKET.IO
// ═══════════════════════════════════════════════════════════

io.on('connection', (socket) => {
  console.log(`[WS] Подключение: ${socket.id}`);

  socket.on('join_chat', (chatId) => socket.join(`chat_${chatId}`));
  socket.on('leave_chat', (chatId) => socket.leave(`chat_${chatId}`));
  socket.on('typing', (data) => socket.to(`chat_${data.chatId}`).emit('user_typing', { userId: data.userId, chatId: data.chatId }));
  
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
    } catch {}
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      try {
        const db = getDb();
        db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?').run(now(), socket.userId);
      } catch {}
    }
  });
});

// ═══════════════════════════════════════════════════════════
// SPA FALLBACK
// ═══════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// ═══════════════════════════════════════════════════════════
// ЗАПУСК
// ═══════════════════════════════════════════════════════════

async function start() {
  try {
    await initDatabase();
    
    server.listen(PORT, () => {
      console.log(`\n╔══════════════════════════════════════════╗`);
      console.log(`║   MegaChat Server v1.0                   ║`);
      console.log(`║   http://localhost:${PORT}                  ║`);
      console.log(`║   DB: ./data/messenger.db                ║`);
      console.log(`╚══════════════════════════════════════════╝\n`);
    });
  } catch (err) {
    console.error('[FATAL] Ошибка запуска:', err);
    process.exit(1);
  }
}

start();
