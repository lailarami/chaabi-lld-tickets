@echo off
REM Script pour démarrer tous les services Chaabi LLD

echo.
echo ============================================
echo   Chaabi LLD - Démarrage des services
echo ============================================
echo.

REM Vérifier les prérequis
echo 🔍 Vérification des prérequis...
where php >nul 2>nul || (echo ❌ PHP non trouvé & exit /b 1)
where node >nul 2>nul || (echo ❌ Node.js non trouvé & exit /b 1)
where npm >nul 2>nul || (echo ❌ npm non trouvé & exit /b 1)
echo ✅ Tous les prérequis sont présents

echo.
echo 📝 Ce script va démarrer:
echo   1. Service mail (Node.js) sur le port 3001
echo   2. Backend Laravel sur le port 8000
echo   3. Frontend Vite sur le port 3000
echo.

echo Appuyez sur ENTER pour continuer...
pause

REM Démarrer le service mail dans une nouvelle fenêtre
echo 📧 Démarrage du service mail...
start cmd /k "cd mail-service && npm start"
timeout /t 3 /nobreak

REM Démarrer le backend Laravel dans une nouvelle fenêtre
echo 🔧 Démarrage du backend Laravel...
start cmd /k "cd backend && php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak

REM Démarrer le frontend dans une nouvelle fenêtre
echo 🎨 Démarrage du frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Tous les services sont en cours de démarrage!
echo.
echo 📍 Adresses:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000
echo   - Mail:     http://localhost:3001
echo.
echo Pour arrêter les services, fermez chaque fenêtre ou utilisez Ctrl+C
echo.
pause
