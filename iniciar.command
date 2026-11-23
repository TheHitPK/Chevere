#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null; then echo "Falta instalar Node.js: descárgalo de https://nodejs.org (versión LTS) y vuelve a abrir este archivo."; read -r; exit 1; fi
[ -d node_modules ] || { echo "Instalando la tienda por primera vez. Puede tardar unos minutos..."; npm install; }
echo "Abriendo la tienda en http://localhost:3210 (panel: http://localhost:3210/admin). Para apagarla, cierra esta ventana."
(sleep 8; open http://localhost:3210 2>/dev/null || xdg-open http://localhost:3210 2>/dev/null) &
npm run dev -- -p 3210
