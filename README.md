# 🚀 MegaChat — Полноценный мессенджер с реальной базой данных

## ⚡ БЫСТРЫЙ СТАРТ (3 минуты)

### 1. Установи Node.js
Скачай с https://nodejs.org (версия 18 или выше)

### 2. Открой терминал в папке проекта
```bash
cd путь/к/папке/megachat
```

### 3. Установи зависимости фронтенда
```bash
npm install
```

### 4. Установи зависимости сервера
```bash
cd server
npm install
```

### 5. Запусти сервер
```bash
npm start
```
Сервер запустится на `http://localhost:3001`  
База данных создастся автоматически: `server/data/messenger.db`

### 6. В ДРУГОМ терминале запусти фронтенд
```bash
cd ..
npm run dev
```
Фронтенд запустится на `http://localhost:5173`

### 7. Открой в браузере
```
http://localhost:5173
```

### 8. Зарегистрируйся
**Первый зарегистрированный пользователь автоматически получает роль superadmin!**

---

## 📦 ЧТО ВКЛЮЧЕНО

### ✅ Мессенджер (Telegram-стиль)
- Личные чаты, группы, каналы
- Отправка сообщений в реальном времени
- Реакции на сообщения
- Статусы прочитано/доставлено
- Индикатор "печатает..."

### ✅ Лента (Instagram-стиль)
- Создание постов с хэштегами
- Лайки, комментарии
- Фото/видео в постах
- Stories (24 часа)

### ✅ Видео (YouTube-стиль)
- Загрузка видео
- Просмотр с плеером
- Лайки, счётчик просмотров
- Теги и описание

### ✅ Shorts (TikTok-стиль)
- Вертикальная лента коротких видео
- Свайп вверх/вниз
- Лайки, комментарии

### ✅ Музыка (VK-стиль)
- Загрузка треков
- Плейлисты
- Плеер с контролами
- Обложки альбомов

### ✅ Профиль
- Аватар, био, статус
- Статистика (подписчики, подписки, посты)
- Посты пользователя

### ✅ Админ-панель
- **Дашборд** — статистика в реальном времени
- **Пользователи** — бан/разбан, удаление, смена ролей
- **Жалобы** — модерация контента
- **Безопасность** — просмотр логов безопасности
- **Audit Log** — все действия админов

---

## 🗄️ БАЗА ДАННЫХ

**Тип:** SQLite (better-sqlite3)  
**Файл:** `server/data/messenger.db`  
**Режим:** WAL (Write-Ahead Logging) для параллельных чтений

### Таблицы:
- `users` — пользователи (bcrypt пароли)
- `chats` / `chat_members` — чаты и участники
- `messages` / `reactions` — сообщения и реакции
- `posts` / `likes` / `comments` — посты и лента
- `stories` — истории (24 часа)
- `videos` — видео
- `music` — музыка
- `subscriptions` / `friends` — подписки
- `notifications` — уведомления
- `reports` — жалобы
- `audit_log` — лог действий админов
- `settings` — настройки сайта

**Все данные хранятся на твоём ПК в одном файле БД!**

---

## 🔐 БЕЗОПАСНОСТЬ

- ✅ bcrypt(12) для хэширования паролей
- ✅ JWT токены (7 дней)
- ✅ Helmet (HTTP заголовки безопасности)
- ✅ CORS
- ✅ Prepared statements (защита от SQL-инъекций)
- ✅ Role-based access control (user/moderator/admin/superadmin)
- ✅ Audit log для всех админских действий
- ✅ Блокировка забаненных пользователей

---

## 📡 API ENDPOINTS

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

---

## 🛠 РОЛИ

| Роль | Права |
|------|-------|
| `user` | Обычный пользователь |
| `moderator` | + модерация жалоб, бан |
| `admin` | + управление пользователями, настройки |
| `superadmin` | + удаление пользователей, смена ролей |

**Первый зарегистрированный = superadmin**

---

## 📂 СТРУКТУРА ПРОЕКТА

```
megachat/
├── server/              # Backend (Node.js + Express + SQLite)
│   ├── server.js        # Главный сервер + API
│   ├── db.js            # Инициализация SQLite + миграции
│   ├── package.json     # Зависимости сервера
│   └── data/            # Автоматически создаётся
│       └── messenger.db # SQLite база данных
├── src/                 # Frontend (React + TypeScript)
│   ├── App.tsx          # Главный компонент
│   ├── store.ts         # API клиент
│   ├── types.ts         # TypeScript типы
│   └── index.css        # Стили (Tailwind)
├── dist/                # Собранный фронтенд (после npm run build)
├── package.json         # Зависимости фронтенда
├── vite.config.js       # Конфигурация Vite
├── tsconfig.json        # Конфигурация TypeScript
└── README.md            # Этот файл
```

---

## 🌐 ХОСТИНГ В ИНТЕРНЕТЕ

### Вариант 1 — Vercel (рекомендую)
1. Зайди на https://vercel.com
2. Войди через GitHub
3. Загрузи проект
4. Получишь ссылку типа: `https://megachat.vercel.app`

### Вариант 2 — Netlify
1. Зайди на https://netlify.com
2. Перетащи папку `dist/` в браузер
3. Получишь ссылку типа: `https://megachat.netlify.app`

### Вариант 3 — Свой сервер
```bash
npm run build
# Загрузи папку dist/ на любой хостинг
# Запусти сервер на VPS: cd server && npm start
```

---

## 💾 РЕЗЕРВНОЕ КОПИРОВАНИЕ

База данных хранится в одном файле: `server/data/messenger.db`

Для бэкапа просто скопируй этот файл:
```bash
cp server/data/messenger.db backups/messenger-$(date +%Y%m%d).db
```

---

## 🔧 ТЕХНОЛОГИИ

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

## ❓ ПРОБЛЕМЫ И РЕШЕНИЯ

### "Cannot find module"
```bash
npm install
cd server && npm install
```

### "Port already in use"
Измени порт в `server/server.js`:
```javascript
const PORT = process.env.PORT || 3002; // измени 3001 на 3002
```

### "Database error"
Удали `server/data/messenger.db` и перезапусти сервер — БД создастся заново

### "Cannot connect to server"
Убедись что сервер запущен:
```bash
cd server && npm start
```

---

## 📝 КОМАНДЫ

```bash
# Разработка
npm run dev              # Frontend (port 5173)
cd server && npm start   # Backend (port 3001)

# Сборка
npm run build            # Собрать frontend в dist/

# Продакшн
cd server && npm start   # Запустит и API и раздаст dist/
```

---

## 🎯 ИТОГО

✅ Полностью рабочий мессенджер  
✅ Реальная SQLite база данных на твоём ПК  
✅ Без фейковых данных — всё настоящее  
✅ Все функции работают через API  
✅ Админ-панель с полным контролем  
✅ Безопасность (bcrypt, JWT, Helmet)  
✅ Готов к хостингу  

**Запускай и пользуйся!** 🚀

---

© MegaChat 2024 — Мессенджер нового поколения
