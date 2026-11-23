@echo off
chcp 65001 >nul
title Tienda Chevere (local)
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Falta instalar Node.js. Descargalo de https://nodejs.org (version LTS^), instalalo y vuelve a abrir este archivo.
  echo.
  pause
  exit /b
)
if not exist node_modules (
  echo  Instalando la tienda por primera vez. Puede tardar unos minutos...
  call npm install
)
echo.
echo  Abriendo la tienda en http://localhost:3210  (panel: http://localhost:3210/admin^)
echo  Para apagarla, cierra esta ventana.
echo.
start "" http://localhost:3210
call npm run dev -- -p 3210
pause
