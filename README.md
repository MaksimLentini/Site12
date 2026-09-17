# MegaChat - Мессенджер

Полнофункциональный мессенджер с лентой, чатами, видео, музыкой и админ-панелью.

## 🚀 Быстрый запуск

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

- **Лента** - создание постов с хэштегами и изображениями, лайки
- **Мессенджер** - создание чатов, отправка сообщений, реакции
- **Видео** - загрузка и просмотр видео
- **Shorts** - короткие видео в вертикальной ленте
- **Музыка** - загрузка и прослушивание треков
- **Сторис** - создание и просмотр историй
- **Профиль** - редактирование аватара, обложки, био, статуса
- **Админ-панель** - управление пользователями, жалобами, просмотр логов

## 🔧 Технологии

- **Frontend**: React 18, TypeScript, Tailwind CSS 4, Vite
- **Backend**: Node.js, Express, SQLite (sql.js), Socket.IO
- **Авторизация**: JWT токены, bcrypt
- **База данных**: SQLite (WebAssembly)

## 📂 Структура

```
megachat/
├── src/                 # Frontend
│   ├── App.tsx         # Главный компонент
│   ├── store.ts        # API клиент
│   └── types.ts        # TypeScript типы
├── server/             # Backend
│   ├── server.js       # Express сервер
│   ├── db.js           # SQLite база данных
│   └── package.json
└── dist/               # Собранный frontend
```

## 🌐 Хостинг

### LocalTunnel (проще всего)

```bash
npx localtunnel --port 3001
```

### Pinggy

```bash
ssh -p 443 -R0:localhost:3001 pinggy@a.pinggy.io
```

## 🔐 Безопасность

- bcrypt(12) для хэширования паролей
- JWT токены (7 дней)
- CORS настроен
- Prepared statements (защита от SQL-инъекций)
- Role-based access control
- Audit log для админских действий

## 📝 Роли

- **user** - обычный пользователь
- **moderator** - модерация контента
- **admin** - управление пользователями
- **superadmin** - полный доступ (первый зарегистрированный)

---

Создано с ❤️
