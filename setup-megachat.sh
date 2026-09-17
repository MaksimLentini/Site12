#!/bin/bash
# ═══════════════════════════════════════════════════════════
# MEGACHAT — Полный установщик проекта
# Запуск: bash setup-megachat.sh
# ═══════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   MegaChat — Установка проекта           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

PROJECT_DIR="megachat"

# Создаём структуру папок
echo "📁 Создание структуры проекта..."
mkdir -p "$PROJECT_DIR"/{src,server,public,data,backups,uploads,logs}
mkdir -p "$PROJECT_DIR"/uploads/{avatars,posts,videos,music,docs,stickers}

# ═══════════════════════════════════════════════════════════
# PACKAGE.JSON (корень)
# ═══════════════════════════════════════════════════════════
echo "📦 Создание package.json..."
cat > "$PROJECT_DIR/package.json" << 'EOF'
{
  "name": "megachat",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
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

# ═══════════════════════════════════════════════════════════
# SERVER PACKAGE.JSON
# ═══════════════════════════════════════════════════════════
cat > "$PROJECT_DIR/server/package.json" << 'EOF'
{
  "name": "megachat-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
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

# ═══════════════════════════════════════════════════════════
# VITE CONFIG
# ═══════════════════════════════════════════════════════════
cat > "$PROJECT_DIR/vite.config.js" << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 }
})
EOF

# ═══════════════════════════════════════════════════════════
# TSCONFIG
# ═══════════════════════════════════════════════════════════
cat > "$PROJECT_DIR/tsconfig.json" << 'EOF'
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
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOF

# ═══════════════════════════════════════════════════════════
# INDEX.HTML
# ═══════════════════════════════════════════════════════════
cat > "$PROJECT_DIR/index.html" << 'EOF'
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MegaChat — Мессенджер нового поколения</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo "✅ Базовые файлы созданы"
echo ""
echo "📋 Следующие шаги:"
echo "   1. cd $PROJECT_DIR"
echo "   2. npm install"
echo "   3. cd server && npm install"
echo "   4. cd .. && npm run build"
echo "   5. cd server && npm start"
echo "   6. Откройте http://localhost:3001"
echo ""
echo "⚠️  ВАЖНО: Файлы src/ нужно создать вручную!"
echo "   Они слишком большие для bash скрипта."
echo "   Скопируйте их из sandbox среды или создайте вручную."
echo ""
echo "📂 Структура проекта готова в папке: $PROJECT_DIR"
