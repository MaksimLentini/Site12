# MegaChat — Мессенджер нового поколения

Полноценный веб-мессенджер с реальной базой данных SQLite на вашем ПК.

## 🚀 Быстрый старт

### 1. Установите зависимости сервера:
```bash
cd server
npm install
```

### 2. Запустите сервер:
```bash
npm start
```

Сервер запустится на `http://localhost:3001`

### 3. Откройте приложение:
Откройте `http://localhost:3001` в браузере.

### 4. Создайте аккаунт:
Первый зарегистрированный пользователь автоматически получает роль **superadmin**.

---

## 📁 Структура проекта

```
megachat/
├── server/              # Backend (Node.js + Express + SQLite)
│   ├── server.js        # Главный сервер
│   ├── db.js            # Инициализация SQLite + миграции
│   ├── package.json     # Зависимости сервера
│   └── data/            # Автоматически создаётся
│       └── messenger.db # SQLite база данных
├── src/                 # Frontend (React + Vite)
│   ├── App.tsx          # Главный компонент
│   ├── store.ts         # API клиент
│   ├── types.ts         # TypeScript типы
│   └── index.css        # Стили
├── dist/                # Собранный фронтенд (после npm run build)
└── README.md
```

---

## 🗄️ База данных

- **Тип:** SQLite (better-sqlite3)
- **Файл:** `./server/data/messenger.db`
- **Режим:** WAL (Write-Ahead Logging) для параллельных чтений
- **Миграции:** 14 автоматических миграций при первом запуске

### Таблицы:
- `users` — пользователи
- `sessions` — JWT сессии
- `chats` / `chat_members` — чаты и участники
- `messages` / `message_reads` / `reactions` — сообщения
- `posts` / `likes` / `comments` — посты и лента
- `stories` / `story_views` — истории
- `videos` — видео
- `music` — музыка
- `subscriptions` / `friends` — подписки
- `notifications` — уведомления
- `reports` — жалобы
- `audit_log` — лог действий админов
- `settings` — настройки сайта
- `ip_bans` / `login_attempts` — безопасность

---

## 🔐 Безопасность

- ✅ bcrypt(12) для паролей
- ✅ JWT токены (7 дней)
- ✅ Helmet (HTTP заголовки)
- ✅ CORS
- ✅ Prepared statements (защита от SQL-инъекций)
- ✅ Role-based access control
- ✅ Audit log для всех админских действий
- ✅ Блокировка забаненных пользователей

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/logout` — выход
- `GET /api/auth/me` — текущий пользователь

### Users
- `GET /api/users` — список пользователей
- `GET /api/users/:id` — профиль
- `PUT /api/users/me` — обновить профиль
- `POST /api/users/:id/follow` — подписаться
- `DELETE /api/users/:id/follow` — отписаться

### Chats & Messages
- `GET /api/chats` — мои чаты
- `POST /api/chats` — создать чат
- `GET /api/chats/:id/messages` — сообщения чата
- `POST /api/chats/:id/messages` — отправить сообщение
- `POST /api/messages/:id/react` — реакция

### Posts
- `GET /api/posts` — лента
- `POST /api/posts` — создать пост
- `POST /api/posts/:id/like` — лайк/анлайк
- `DELETE /api/posts/:id` — удалить

### Stories / Videos / Music
- `GET /api/stories` — активные сторис
- `POST /api/stories` — создать сторис
- `GET /api/videos` — видео
- `POST /api/videos` — загрузить видео
- `GET /api/music` — треки
- `POST /api/music` — загрузить трек

### Admin (требует роль admin/superadmin)
- `GET /api/admin/stats` — статистика
- `GET /api/admin/users` — все пользователи
- `PUT /api/admin/users/:id/ban` — заблокировать
- `PUT /api/admin/users/:id/unban` — разблокировать
- `PUT /api/admin/users/:id/role` — сменить роль
- `DELETE /api/admin/users/:id` — удалить (только superadmin)
- `GET /api/admin/reports` — жалобы
- `PUT /api/admin/reports/:id` — обработать жалобу
- `GET /api/admin/audit-log` — лог действий
- `GET /api/admin/settings` — настройки
- `PUT /api/admin/settings` — обновить настройки

### Search
- `GET /api/search?q=...` — поиск

---

## 🛠 Роли

| Роль | Права |
|------|-------|
| `user` | Обычный пользователь |
| `moderator` | + модерация жалоб, бан |
| `admin` | + управление пользователями, настройки |
| `superadmin` | + удаление пользователей, смена ролей |

---

## ⚙️ Настройки

Переменные окружения (опционально):
```env
PORT=3001
JWT_SECRET=your-secret-key
```

---

## 📝 Команды

```bash
# Сервер
cd server && npm install && npm start

# Разработка фронтенда
npm run dev

# Сборка фронтенда
npm run build
```

---

## 💾 Резервное копирование

База данных хранится в одном файле: `./server/data/messenger.db`

Для бэкапа просто скопируйте этот файл:
```bash
cp server/data/messenger.db backups/messenger-$(date +%Y%m%d).db
```

---

## 🔧 Технологии

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)
- Socket.IO (WebSocket)
- JWT + bcrypt
- Helmet + CORS

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide Icons

---

© MegaChat 2024
