#!/bin/bash
# ============================================================
# Chaabi LLD — Script d'installation automatique
# ============================================================

set -e

echo ""
echo "=========================================="
echo "  🏦 Chaabi LLD — Installation"
echo "=========================================="
echo ""

# ─── BACKEND ──────────────────────────────────────────────
echo "📦 Installation du backend Laravel..."
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✅ Fichier .env créé (pensez à le configurer !)"
fi

composer install --no-interaction --prefer-dist
php artisan key:generate --ansi

echo ""
echo "  ⚠️  Configurez votre .env (DB, MAIL) avant de continuer."
echo "  Appuyez sur ENTRÉE pour lancer les migrations..."
read -r

php artisan migrate --seed --ansi
echo "  ✅ Base de données initialisée."

cd ..

# ─── FRONTEND ─────────────────────────────────────────────
echo ""
echo "📦 Installation du frontend React..."
cd frontend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✅ Fichier .env frontend créé."
fi

npm install
echo "  ✅ Dépendances frontend installées."

cd ..

echo ""
echo "=========================================="
echo "  ✅ Installation terminée !"
echo "=========================================="
echo ""
echo "  Pour démarrer l'application :"
echo ""
echo "  Terminal 1 (Backend — Port 8000) :"
echo "    cd backend && php artisan serve --port=8000"
echo ""
echo "  Terminal 2 (Frontend — Port 3000) :"
echo "    cd frontend && npm run dev"
echo ""
echo "  🌐 Accès : http://localhost:3000"
echo ""
echo "  Comptes demo :"
echo "    Admin      : admin@chaabilld.ma       / Admin@2024"
echo "    Traiteur   : traiteur@chaabilld.ma    / Traiteur@2024"
echo "    Validateur : validateur@chaabilld.ma  / Validateur@2024"
echo "    User       : user@chaabilld.ma        / User@2024"
echo ""
