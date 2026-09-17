# 📦 Как получить ZIP архив MegaChat

## Вариант 1: Через браузер (РЕКОМЕНДУЕТСЯ)

1. **Запустите dev-сервер в sandbox:**
   ```bash
   npm run dev
   ```

2. **Откройте в браузере:**
   ```
   http://localhost:5173/download.html
   ```

3. **Нажмите кнопку "📦 Скачать megachat.zip"**

4. **Распакуйте архив на вашем компьютере**

5. **Следуйте инструкции:**
   ```bash
   cd megachat
   npm install
   cd server && npm install && npm start
   cd .. && npm run dev
   ```

---

## Вариант 2: Ручное копирование файлов

Если вариант 1 не работает, создайте файлы вручную:

### Структура проекта:
```
megachat/
├── package.json
├── vite.config.js
├── tsconfig.json
├── index.html
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── store.ts
│   ├── types.ts
│   ├── index.css
│   └── vite-env.d.ts
└── server/
    ├── package.json
    ├── server.js
    └── db.js
```

### Содержимое файлов:

Все файлы уже созданы в sandbox среде. Вы можете:
1. Открыть каждый файл через интерфейс sandbox
2. Скопировать содержимое
3. Создать файлы на вашем компьютере

**Или используйтеVariant 1 (через браузер) — это намного проще!**

---

## 🚀 Запуск проекта

После получения файлов:

```bash
# 1. Установите зависимости фронтенда
npm install

# 2. Установите зависимости сервера
cd server
npm install

# 3. Запустите сервер (в одном терминале)
npm start
# Сервер запустится на http://localhost:3001

# 4. В ДРУГОМ терминале запустите фронтенд
cd ..
npm run dev
# Фронтенд запустится на http://localhost:5173

# 5. Откройте http://localhost:5173 в браузере
# Зарегистрируйтесь — первый пользователь = superadmin
```

---

## 📊 Что входит в проект

### Frontend (React + TypeScript):
- ✅ Мессенджер (Telegram-стиль)
- ✅ Лента постов (Instagram-стиль)
- ✅ Видео (YouTube-стиль)
- ✅ Shorts (TikTok-стиль)
- ✅ Музыка (VK-стиль)
- ✅ Сторис
- ✅ Профили
- ✅ Админ-панель
- ✅ Уведомления
- ✅ Темы (dark/light)

### Backend (Node.js + Express + SQLite):
- ✅ Реальная база данных SQLite
- ✅ JWT авторизация
- ✅ bcrypt для паролей
- ✅ REST API
- ✅ WebSocket (Socket.IO)
- ✅ Роли пользователей
- ✅ Модерация
- ✅ Audit log

### Безопасность:
- ✅ Helmet (HTTP заголовки)
- ✅ CORS
- ✅ Prepared statements (защита от SQL-инъекций)
- ✅ Rate limiting готовность
- ✅ Role-based access control

---

## 💾 База данных

- **Файл:** `server/data/messenger.db`
- **Тип:** SQLite (better-sqlite3)
- **Режим:** WAL (Write-Ahead Logging)
- **Создаётся автоматически** при первом запуске сервера

---

## 🔐 Первый вход

1. Запустите сервер и фронтенд
2. Откройте http://localhost:5173
3. Нажмите "Регистрация"
4. Создайте аккаунт — **первый пользователь автоматически получает роль superadmin**
5. Войдите в систему
6. Доступна админ-панель (иконка щита в sidebar)

---

## 📝 Команды

```bash
# Разработка
npm run dev          # Frontend (port 5173)
cd server && npm start  # Backend (port 3001)

# Сборка
npm run build        # Собрать frontend в dist/

# Скачать ZIP
# Откройте http://localhost:5173/download.html
```

---

## ❓ Проблемы и решения

### "Cannot find module"
```bash
npm install
cd server && npm install
```

### "Port already in use"
Измените порт в `vite.config.js` или `server/server.js`

### "Database error"
Удалите `server/data/messenger.db` и перезапустите сервер

### "Cannot download ZIP"
Убедитесь что вы открыли `download.html` через веб-сервер (npm run dev), а не напрямую из файловой системы

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте что Node.js 18+ установлен
2. Убедитесь что все зависимости установлены (npm install)
3. Проверьте что сервер запущен (npm start в папке server)
4. Проверьте консоль браузера на ошибки (F12)

---

**© MegaChat 2024 — Мессенджер нового поколения**
