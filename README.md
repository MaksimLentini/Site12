# 🚀 MegaChat — Мессенджер нового поколения

Полностью переработанный мессенджер с **неоновым дизайном** и **real-time** функциональностью.

## ✨ Новый дизайн

### 🎨 Визуальный стиль
- **Неоновая цветовая схема** — cyan, pink, purple градиенты
- **Glassmorphism** — стеклянные карточки с blur эффектом
- **Анимированный логотип** — пульсирующее свечение
- **Горизонтальная навигация** — сверху вместо боковой панели
- **Неоновые свечения** — на кнопках, карточках, аватарах

### 🎯 Основные изменения
- ✅ Новая цветовая палитра (cyan #00f0ff, pink #ff00aa, purple #7b00ff)
- ✅ Горизонтальная навигация вверху страницы
- ✅ Glass-карточки с backdrop-filter blur
- ✅ Анимированный логотип с пульсацией
- ✅ Неоновые свечения на интерактивных элементах
- ✅ Градиентные кнопки с эффектом блика
- ✅ Аватарки с неоновой обводкой

## 🚀 Быстрый старт

### 1. Установите зависимости

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Соберите frontend

```bash
npm run build
```

### 3. Запустите сервер

```bash
cd server
npm start
```

Сервер запустится на `http://localhost:3001`

### 4. Откройте в браузере

```
http://localhost:3001
```

Первый зарегистрированный пользователь автоматически получает роль **superadmin**.

## 📱 Функции

### 💬 Мессенджер
- Создание чатов (личные, группы, каналы)
- Отправка сообщений в реальном времени
- Реакции на сообщения
- Статусы прочитано/доставлено
- GIF поддержка с полноэкранным просмотром

### 📝 Лента
- Создание постов с хэштегами
- Загрузка изображений по URL
- Лайки в реальном времени
- Просмотр профилей других пользователей

### 🎬 Видео
- Загрузка видео с превью
- Полноэкранный просмотр
- Теги и описание
- Счётчик просмотров

### 📸 Shorts
- Вертикальная лента коротких видео
- Навигация стрелками

### 🎵 Музыка
- Загрузка треков с обложками
- Плеер с контролами
- Real-time обновления

### 📸 Сторис
- Создание историй (24 часа)
- Просмотр с текстом

### 👤 Профиль
- Кастомизация (аватар, обложка, био, статус)
- Статистика (подписчики, подписки, посты)
- Онлайн статус

### 🛡 Админ-панель
- Дашборд со статистикой
- Управление пользователями
- Просмотр профилей
- Видеозвонки пользователям
- IP баны
- Управление сессиями
- Audit log

## 🔄 Real-Time функциональность

Все изменения мгновенно отображаются у всех пользователей:

- ✅ Новые посты появляются сразу
- ✅ Лайки обновляются в реальном времени
- ✅ Сообщения доставляются мгновенно
- ✅ Реакции видны всем сразу
- ✅ Новые видео/музыка/сторис появляются автоматически
- ✅ Чаты обновляются без перезагрузки

## 🎨 Дизайн-система

### Цвета
```css
--accent: #00f0ff (cyan)
--accent2: #ff00aa (pink)
--accent3: #7b00ff (purple)
--success: #00ff88 (green)
--warning: #ffaa00 (orange)
--danger: #ff3355 (red)
```

### Градиенты
```css
--gradient-main: linear-gradient(135deg, #00f0ff 0%, #7b00ff 50%, #ff00aa 100%)
--gradient-warm: linear-gradient(135deg, #ff00aa 0%, #ffaa00 100%)
--gradient-cool: linear-gradient(135deg, #00f0ff 0%, #00ff88 100%)
--gradient-deep: linear-gradient(135deg, #7b00ff 0%, #00f0ff 100%)
```

### Эффекты
- **Glassmorphism** — `backdrop-filter: blur(20px)`
- **Neon Glow** — `box-shadow: 0 0 10px rgba(0, 240, 255, 0.5)`
- **Анимации** — fade-in, slide-up, scale-in, glow-pulse, float

## 🗄️ База данных

**Тип:** SQLite (sql.js — WebAssembly)  
**Файл:** `server/data/messenger.db`  
**Режим:** WAL для производительности

### Таблицы
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
- `ip_bans` — баны IP адресов
- `active_sessions` — активные сессии
- `system_settings` — системные настройки

## 🔐 Безопасность

- ✅ bcrypt(12) для хэширования паролей
- ✅ JWT токены (7 дней)
- ✅ CORS настроен
- ✅ Prepared statements (защита от SQL-инъекций)
- ✅ Role-based access control
- ✅ Audit log для админских действий
- ✅ Rate limiting (100 запросов / 5 минут)
- ✅ IP баны
- ✅ Helmet (HTTP заголовки)

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
- `GET /api/admin/ip-bans` — IP баны
- `POST /api/admin/ip-bans` — заблокировать IP
- `DELETE /api/admin/ip-bans/:id` — разблокировать IP
- `GET /api/admin/sessions` — активные сессии
- `DELETE /api/admin/sessions/:id` — завершить сессию
- `POST /api/admin/call` — видеозвонок пользователю
- `GET /api/admin/settings` — настройки
- `PUT /api/admin/settings` — обновить настройки

## 🛠 Роли

| Роль | Права |
|------|-------|
| `user` | Обычный пользователь |
| `moderator` | + модерация жалоб, бан |
| `admin` | + управление пользователями, IP баны, сессии, видеозвонки |
| `superadmin` | + удаление пользователей, смена ролей, системные настройки |

**Первый зарегистрированный = superadmin**

## 📂 Структура проекта

```
megachat/
├── server/              # Backend (Node.js + Express + SQLite)
│   ├── server.js        # Главный сервер + API + Socket.IO
│   ├── db.js            # Инициализация SQLite + миграции
│   ├── package.json     # Зависимости сервера
│   └── data/            # Автоматически создаётся
│       ├── messenger.db # SQLite база данных
│       └── accounts.json # Файл аккаунтов
├── src/                 # Frontend (React + TypeScript)
│   ├── App.tsx          # Главный компонент (новый дизайн)
│   ├── store.ts         # API клиент
│   ├── types.ts         # TypeScript типы
│   ├── socket.ts        # Socket.IO клиент
│   └── index.css        # Стили (неон + glassmorphism)
├── dist/                # Собранный фронтенд (после npm run build)
├── package.json         # Зависимости фронтенда
├── vite.config.js       # Конфигурация Vite
├── tsconfig.json        # Конфигурация TypeScript
└── README.md            # Этот файл
```

## 🌐 Хостинг

### LocalTunnel (проще всего)

В **новой консоли** (не закрывая сервер):

```bash
npx localtunnel --port 3001
```

Получите публичную ссылку типа `https://xxx-xxx-xxx.loca.lt`

### VPS (постоянно)

1. Купи VPS (Aeza.net, Timeweb, FirstVDS) с Ubuntu 22.04
2. Подключись: `ssh root@IP`
3. Установи Node.js: `curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs`
4. Загрузи проект через Git или SCP
5. Установи зависимости: `npm install && cd server && npm install`
6. Собери: `npm run build`
7. Запусти через PM2: `npm install -g pm2 && cd server && pm2 start server.js --name megachat`
8. Открой порт: `ufw allow 3001`

## ❓ Проблемы и решения

### "Cannot find module"
```bash
npm install
cd server && npm install
```

### "Port already in use"
Измените порт в `server/server.js`:
```javascript
const PORT = process.env.PORT || 3002; // измени 3001 на 3002
```

### "Database error"
Удалите `server/data/messenger.db` и перезапустите сервер — БД создастся заново

### "Cannot connect to server"
Убедитесь что сервер запущен:
```bash
cd server && npm start
```

### "Rate limit exceeded"
Подождите 5 минут или измените лимит в `server/server.js` (строка 72)

## 🎯 Особенности нового дизайна

### 🎨 Визуальные эффекты
- **Неоновые свечения** на кнопках и карточках
- **Glassmorphism** — стеклянные элементы с blur
- **Градиентные фоны** с анимированными частицами
- **Пульсирующий логотип** с эффектом свечения
- **Плавные анимации** — fade-in, slide-up, scale-in

### 🖱 Интерактивность
- **Hover эффекты** — увеличение, свечение, изменение цвета
- **Click анимации** — нажатие с обратной связью
- **Плавные переходы** — между страницами и состояниями
- **Real-time обновления** — без перезагрузки страницы

### 📱 Адаптивность
- **Responsive дизайн** — работает на всех устройствах
- **Mobile-first** — оптимизирован для мобильных
- **Touch-friendly** — удобные кнопки для сенсорных экранов

## 📝 Команды

```bash
# Разработка
npm run dev              # Frontend (port 5173)
cd server && npm start   # Backend (port 3001)

# Сборка
npm run build            # Собрать frontend в dist/

# Продакшн
cd server && npm start   # Запустит и API и раздаст dist/
```

## 🔧 Технологии

**Backend:**
- Node.js + Express
- SQLite (sql.js — WebAssembly, работает без компиляции C++)
- Socket.IO (WebSocket для real-time)
- JWT + bcrypt
- Helmet + CORS
- Rate limiting

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide Icons
- Socket.IO Client

## 🎉 Итого

✅ Полностью переработанный неоновый дизайн  
✅ Real-time функциональность через Socket.IO  
✅ Реальная SQLite база данных на твоём ПК  
✅ Без фейковых данных — всё настоящее  
✅ Все функции работают через API  
✅ Данные хранятся в БД (не в localStorage)  
✅ Защита от DDoS (rate limiting, IP баны)  
✅ Расширенная админ-панель  
✅ Видеозвонки пользователям  
✅ Управление сессиями  
✅ Audit log для всех действий  
✅ Безопасность (bcrypt, JWT, Helmet)  
✅ Готов к хостингу  

**Запускай и наслаждайся новым дизайном!** 🚀✨

---

© MegaChat 2024 — Мессенджер нового поколения с неоновым дизайном
