#!/bin/bash
# ═══════════════════════════════════════════════════════════
# MEGACHAT — ПОЛНЫЙ УСТАНОВЩИК
# Скопируйте ВЕСЬ этот скрипт в терминал и нажмите Enter
# ═══════════════════════════════════════════════════════════
set -e
DIR="megachat"
echo "╔══════════════════════════════════════════╗"
echo "║   MegaChat — Установка проекта           ║"
echo "╚══════════════════════════════════════════╝"
rm -rf "$DIR"
mkdir -p "$DIR"/{src,server,public}
cd "$DIR"

# ═══ package.json ═══
cat > package.json << 'PKGEOF'
{
  "name": "megachat",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.0",
    "vite": "^6.3.5",
    "@tailwindcss/vite": "^4.1.7",
    "tailwindcss": "^4.1.7"
  }
}
PKGEOF

# ═══ vite.config.js ═══
cat > vite.config.js << 'VEOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001', '/socket.io': { target: 'http://localhost:3001', ws: true } } }
})
VEOF

# ═══ tsconfig.json ═══
cat > tsconfig.json << 'TSEOF'
{
  "compilerOptions": {
    "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext",
    "skipLibCheck": true, "moduleResolution": "bundler",
    "allowImportingTsExtensions": true, "resolveJsonModule": true,
    "isolatedModules": true, "noEmit": true, "jsx": "react-jsx",
    "strict": false, "noUnusedLocals": false, "noUnusedParameters": false
  },
  "include": ["src"]
}
TSEOF

# ═══ index.html ═══
cat > index.html << 'HTMLEOF'
<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MegaChat</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
HTMLEOF

# ═══ src/main.tsx ═══
cat > src/main.tsx << 'MAINEOF'
import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
ReactDOM.createRoot(document.getElementById("root")!).render(<App />)
MAINEOF

# ═══ src/vite-env.d.ts ═══
cat > src/vite-env.d.ts << 'ENVEOF'
/// <reference types="vite/client" />
ENVEOF

echo "📦 Базовые файлы созданы"
echo "📦 Установка зависимостей фронтенда..."
npm install --silent 2>/dev/null || npm install
echo "✅ Фронтенд установлен"
echo ""
echo "📦 Установка сервера..."
cd server

cat > package.json << 'SPKG'
{
  "name": "megachat-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.4.3",
    "socket.io": "^4.7.4",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "uuid": "^9.0.0"
  }
}
SPKG

npm install --silent 2>/dev/null || npm install
echo "✅ Сервер установлен"
cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Проект создан!                      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "⚠️  Теперь нужно скопировать файлы src/ и server/"
echo "   из sandbox среды в папку $DIR/"
echo ""
echo "📋 Или создайте их вручную:"
echo "   - src/App.tsx"
echo "   - src/index.css" 
echo "   - src/store.ts"
echo "   - src/types.ts"
echo "   - server/server.js"
echo "   - server/db.js"
echo ""
echo "🚀 Запуск:"
echo "   cd server && npm start"
echo "   В другом терминале: npm run dev"
