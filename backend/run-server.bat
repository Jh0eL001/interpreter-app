@off
:: Cambiar al directorio del backend para asegurar que las rutas relativas funcionen
cd /d "C:\Users\Legion\Desktop\backend-dev\misc\interpreter-app\backend"

:: Iniciar el servidor Node.js
start "" node src/server.js

:: Esperar 1 segundo a que el servidor levante antes de abrir el navegador
timeout /t 1 /nobreak >nul

:: Abrir Chrome en la dirección local de la app
start chrome "http://localhost:3000/index.html"

node src/server.js