@echo off
chcp 65001 >nul
title MegaChat Server
echo.
echo ╔══════════════════════════════════════════╗
echo ║   MegaChat — Запуск сервера...           ║
echo ╚══════════════════════════════════════════╝
echo.

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте с https://nodejs.org
    pause
    exit /b 1
)

REM Переход в папку сервера
cd /d "%~dp0server"

REM Проверка node_modules
if not exist "node_modules" (
    echo [INFO] Установка зависимостей сервера...
    call npm install
    echo.
)

REM Проверка dist
if not exist "..\dist" (
    echo [INFO] Сборка фронтенда...
    cd /d "%~dp0"
    call npm run build
    cd /d "%~dp0server"
    echo.
)

echo [INFO] Запуск сервера...
echo.
echo ╔══════════════════════════════════════════╗
echo ║   MegaChat Server                        ║
echo ║   http://localhost:3001                  ║
echo ║   Откройте в браузере!                   ║
echo ╚══════════════════════════════════════════╝
echo.
echo Нажмите любую клавишу для остановки...
echo.

start http://localhost:3001
call npm start

pause
