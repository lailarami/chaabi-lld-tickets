@echo off
REM Script d'installation/configuration Chaabi LLD

echo.
echo ============================================
echo   Chaabi LLD - Installation
echo ============================================
echo.

setlocal enabledelayedexpansion

REM Vérifier les prérequis
echo 🔍 Vérification des prérequis...
where php >nul 2>nul || (echo ❌ PHP non trouvé & exit /b 1)
where node >nul 2>nul || (echo ❌ Node.js non trouvé & exit /b 1)
where npm >nul 2>nul || (echo ❌ npm non trouvé & exit /b 1)
echo ✅ Tous les prérequis trouvés

REM Installation du backend Laravel
echo.
echo 📦 Installation du backend Laravel...
cd backend
if exist "vendor" (
    echo ✅ Backend déjà installé
) else (
    echo ⏳ Installation des dépendances...
    call composer install
    call php artisan key:generate
    echo ✅ Backend installé
)
cd ..

REM Installation du frontend
echo.
echo 📦 Installation du frontend...
cd frontend
if exist "node_modules" (
    echo ✅ Frontend déjà installé
) else (
    echo ⏳ Installation des dépendances...
    call npm install
    echo ✅ Frontend installé
)
cd ..

REM Installation du service mail
echo.
echo 📦 Installation du service mail...
cd mail-service
if exist "node_modules" (
    echo ✅ Service mail déjà installé
) else (
    echo ⏳ Installation des dépendances...
    call npm install
    echo ✅ Service mail installé
)
cd ..

REM Configuration des fichiers .env
echo.
echo ⚙️  Vérification des fichiers .env...

if exist "backend\.env" (
    echo ✅ backend/.env existe
) else (
    echo ⚠️  Création de backend/.env...
    copy backend\.env.example backend\.env 2>nul || (
        echo ⚠️  backend/.env.example non trouvé, création manuelle requise
    )
)

if exist "mail-service\.env" (
    echo ✅ mail-service/.env existe
) else (
    echo ⚠️  Création de mail-service/.env...
    echo # Email Configuration > mail-service\.env
    echo EMAIL_USER=votre-email@gmail.com >> mail-service\.env
    echo EMAIL_PASS=votre-mot-de-passe-app >> mail-service\.env
    echo EMAIL_FROM="Chaabi LLD - Support IT <votre-email@gmail.com>" >> mail-service\.env
    echo MAIL_SERVICE_PORT=3001 >> mail-service\.env
    echo NODE_ENV=development >> mail-service\.env
    echo MAIL_HOST=smtp.gmail.com >> mail-service\.env
    echo MAIL_PORT=587 >> mail-service\.env
    echo ⚠️  mail-service/.env créé - MODIFIER LES CREDENTIALS GMAIL!
)

REM Tests
echo.
echo 🧪 Tests...
echo.

echo 1. Test de connexion mail-service...
cd mail-service
call npm start >nul 2>&1 &
timeout /t 3
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:3001/health' -Method Get -UseBasicParsing).StatusCode"
if !ERRORLEVEL! equ 200 (
    echo ✅ Service mail fonctionne
) else (
    echo ⚠️  Service mail peut nécessiter une configuration
)
cd ..

echo.
echo ============================================
echo   ✅ Installation terminée!
echo ============================================
echo.
echo 📋 Prochaines étapes:
echo.
echo 1. ⚙️  Configuration Gmail:
echo    - Activer 2FA sur https://myaccount.google.com
echo    - Générer app password sur https://myaccount.google.com/apppasswords
echo    - Mettre à jour mail-service/.env
echo.
echo 2. 🗄️  Préparation de la base de données:
echo    cd backend
echo    php artisan migrate
echo    php artisan db:seed
echo.
echo 3. 🚀 Démarrage des services:
echo    Exécuter start-all.bat
echo.
echo ============================================
echo.
pause
