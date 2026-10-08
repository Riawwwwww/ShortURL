@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
if not exist .env (
  copy .env.example .env >nul
  echo Created .env. Please edit DB_PASSWORD before using the app.
  notepad .env
)
call npm run build
call npm start
