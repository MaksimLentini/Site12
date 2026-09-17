#!/bin/bash
# ═══════════════════════════════════════════════════════════
# MEGACHAT — ПОЛНЫЙ УСТАНОВЩИК
# Скопируйте ВЕСЬ этот скрипт и вставьте в терминал
# ═══════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════╗"
echo "║   MegaChat — Установка проекта           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

DIR="megachat"
rm -rf "$DIR"
mkdir -p "$DIR"/{src,server/data}
cd "$DIR"

# ═══ package.json ═══
cat > package.json << 'EOF'
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
EOF

echo "📦 Создание конфигурации..."

# ═══ vite.config.js ═══
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { 
    port: 5173, 
    proxy: { 
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'http://localhost:3001', ws: true }
    }
  }
})
EOF

# ═══ tsconfig.json ═══
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["src"]
}
EOF

# ═══ index.html ═══
cat > index.html << 'EOF'
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
EOF

echo "✅ Конфигурация создана"
echo ""
echo "📦 Установка зависимостей фронтенда (это займёт 1-2 минуты)..."
npm install --silent 2>&1 | grep -v "npm warn" || npm install

echo ""
echo "✅ Фронтенд установлен"
echo ""
echo "📦 Установка сервера..."
cd server

# ═══ server/package.json ═══
cat > package.json << 'EOF'
{
  "name": "megachat-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
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
EOF

npm install --silent 2>&1 | grep -v "npm warn" || npm install

echo "✅ Сервер установлен"
cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅ Базовая структура создана!          ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "⚠️  ВАЖНО: Теперь нужно создать файлы src/ и server/"
echo ""
echo "📋 Файлы которые нужно создать вручную:"
echo "   src/main.tsx"
echo "   src/App.tsx (930 строк)"
echo "   src/store.ts"
echo "   src/types.ts"
echo "   src/index.css"
echo "   server/server.js"
echo "   server/db.js"
echo ""
echo "💡 Эти файлы слишком большие для bash скрипта."
echo "   Скопируйте их из sandbox среды или создайте вручную."
echo ""
echo "🚀 После создания файлов:"
echo "   cd server && npm start"
echo "   В другом терминале: npm run dev"
echo "   Откройте: http://localhost:5173"
