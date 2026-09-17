# 🚀 MegaChat — Мессенджер нового поколения

Полнофункциональный мессенджер с реальной базой данных SQLite.

## ⚡ БЫСТРЫЙ СТАРТ (Windows)

### Способ 1: Одним кликом
```
Дважды кликните на start.bat
```

### Способ 2: Вручную
```cmd
# 1. Установить зависимости фронтенда
npm install

# 2. Собрать фронтенд
npm run build

# 3. Установить зависимости сервера
cd server
npm install

# 4. Запустить сервер
npm start
```

### 5. Открыть в браузере
```
http://localhost:3001
```

### 6. Зарегистрироваться
Первый пользователь автоматически получает роль **superadmin**!

---

## 🌐 ХОСТИНГ В ИНТЕРНЕТЕ

### LocalTunnel (проще всего)
В **новой консоли**:
```cmd
npx localtunnel --port 3001
```

Получите публичную ссылку типа `https://xxx.loca.lt`

### Pinggy
```cmd
ssh -p 443 -R0:localhost:3001 pinggy@a.pinggy.io
```

---

## 📦 ЧТО ВКЛЮЧЕНО

### ✅ Мессенджер (Telegram-стиль)
- Личные чаты, группы, каналы
- Отправка сообщений
- Реакции (❤️ и др.)
- Статусы прочитано/доставлено

### ✅ Лента (Instagram-стиль)
- Создание постов с хэштегами
- Лайки, комментарии
- Фото/видео в постах

### ✅ Видео (YouTube-стиль)
- Загрузка видео
- Просмотр с плеером
- Лайки, счётчик просмотров

### ✅ Shorts (TikTok-стиль)
- Вертикальная лента
- Свайп вверх/вниз

### ✅ Музыка (VK-стиль)
- Загрузка треков
- Плеер с контролами

### ✅ Сторис
- Создание сторис (24 часа)
- Просмотр

### ✅ Профиль
- Кастомизация (аватар, обложка, био, статус)
- Статистика
- Мои посты

### ✅ Админ-панель
- Дашборд со статистикой
- Управление пользователями (бан/разбан/удаление)
- Модерация жалоб
- Audit log

---

## 🗄️ БАЗА ДАННЫХ

**Тип:** SQLite (sql.js — WebAssembly)  
**Файл:** `server/data/messenger.db`  
**Режим:** WAL для производительности

### Таблицы:
- `users` — пользователи (bcrypt пароли)
- `chats` / `chat_members` — чаты
- `messages` / `reactions` — сообщения
- `posts` / `likes` — посты
- `stories` — истории
- `videos` — видео
- `music` — музыка
- `subscriptions` — подписки
- `notifications` — уведомления
- `reports` — жалобы
- `audit_log` — лог действий

---

## 🔐 БЕЗОПАСНОСТЬ

- ✅ bcrypt(12) для паролей
- ✅ JWT токены (7 дней)
- ✅ CORS
- ✅ Prepared statements (защита от SQL-инъекций)
- ✅ Role-based access control
- ✅ Audit log

---

## 📡 API ENDPOINTS

### Auth
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `POST /api/auth/logout` — выход

### Users
- `GET /api/users/:id` — профиль
- `PUT /api/users/me` — обновить профиль

### Chats
- `GET /api/chats` — мои чаты
- `POST /api/chats` — создать чат
- `GET /api/chats/:id/messages` — сообщения
- `POST /api/chats/:id/messages` — отправить
- `POST /api/messages/:id/react` — реакция

### Posts
- `GET /api/posts` — лента
- `POST /api/posts` — создать пост
- `POST /api/posts/:id/like` — лайк

### Stories / Videos / Music
- `GET /api/stories` — сторис
- `POST /api/stories` — создать
- `GET /api/videos` — видео
- `POST /api/videos` — загрузить
- `GET /api/music` — треки
- `POST /api/music` — загрузить

### Admin
- `GET /api/admin/stats` — статистика
- `GET /api/admin/users` — пользователи
- `PUT /api/admin/users/:id/ban` — бан
- `PUT /api/admin/users/:id/unban` — разбан
- `DELETE /api/admin/users/:id` — удалить
- `GET /api/admin/reports` — жалобы
- `GET /api/admin/audit-log` — логи

---

## 🛠 РОЛИ

| Роль | Права |
|------|-------|
| `user` | Обычный пользователь |
| `moderator` | + модерация |
| `admin` | + управление |
| `superadmin` | полный доступ |

**Первый зарегистрированный = superadmin**

---

## 📂 СТРУКТУРА

```
megachat/
├── start.bat              # Запуск одним кликом (Windows)
├── server/
│   ├── server.js          # Express + Socket.IO
│   ├── db.js              # SQLite (sql.js)
│   ├── package.json
│   └── data/
│       └── messenger.db   # База данных
├── src/
│   ├── App.tsx            # Фронтенд
│   ├── store.ts           # API клиент
│   ├── types.ts           # Типы
│   └── index.css          # Стили
├── dist/                  # Собранный фронтенд
├── package.json
└── README.md
```

---

## ❓ ПРОБЛЕМЫ

### "Cannot find module"
```cmd
npm install
cd server && npm install
```

### "Port already in use"
Измените порт в `server/server.js`:
```javascript
const PORT = 3002; // вместо 3001
```

### "Database error"
Удалите `server/data/messenger.db` и перезапустите сервер.

---

## 🎯 ИТОГО

✅ Полностью рабочий мессенджер  
✅ Реальная SQLite база данных  
✅ Загрузка контента (посты, видео, музыка, сторис)  
✅ Кастомизация профиля  
✅ Админ-панель  
✅ Безопасность  
✅ Запуск одним кликом (start.bat)  

**Запускайте и пользуйтесь!** 🚀

---

© MegaChat 2024
