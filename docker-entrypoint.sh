#!/bin/sh
set -e

# Применяем миграции к БД (db уже healthy благодаря depends_on в docker-compose).
echo "==> prisma migrate deploy"
npx prisma migrate deploy

# Идемпотентный сид: все операции — upsert, повторный запуск безопасен.
# SKIP_SEED=1 отключает сид на последующих перезапусках, если он не нужен.
if [ "$SKIP_SEED" != "1" ]; then
  echo "==> seeding database"
  npx tsx prisma/seed.ts
else
  echo "==> SKIP_SEED=1, пропускаем сид"
fi

echo "==> starting app: $*"
exec "$@"
