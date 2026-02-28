#!/bin/sh
set -e

echo "========================================="
echo "=== Iniciando contenedor Node con PHP ==="
echo "========================================="

echo "Versión de PHP:"
php -v | head -n 1

echo "Versión de Composer:"
composer --version | head -n 1

echo "Versión de Node:"
node -v

echo "Versión de npm:"
npm -v

echo "========================================="
echo "=== Creando directorios de Laravel ==="
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p bootstrap/cache
chmod -R 775 storage bootstrap/cache
echo "Directorios creados y permisos asignados"

echo "========================================="
echo "=== Verificando archivo .env ==="
if [ ! -f .env ]; then
    echo "⚠️  Archivo .env no encontrado, copiando desde .env.example"
    cp .env.example .env || echo "No se pudo copiar .env.example"
fi

echo "========================================="
echo "=== Instalando dependencias de Composer (solo para wayfinder) ==="
if [ ! -d vendor ]; then
    echo "Instalando composer dependencies..."
    composer install --no-interaction --no-progress --no-suggest || echo "⚠️  Composer install falló, pero continuamos..."
fi

echo "========================================="
echo "=== Generando tipos de Wayfinder ==="
echo "Ejecutando: php artisan wayfinder:generate --form-variants --force"
if php artisan wayfinder:generate --form-variants --force; then
    echo "✅ Wayfinder generado correctamente"
else
    echo "⚠️  Wayfinder falló, pero continuamos..."
    echo "Para debuggear, ejecuta manualmente:"
    echo "APP_DEBUG=true php artisan wayfinder:generate --form-variants --force -vvv"
fi

echo "========================================="
echo "=== Instalando dependencias Node ==="
npm install

echo "========================================="
echo "=== Iniciando Vite ==="
echo "Vite estará disponible en http://localhost:5173"
echo "========================================="

exec npm run dev