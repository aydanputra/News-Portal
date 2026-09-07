#!/usr/bin/env bash
set -euo pipefail

APP=/srv/pranala/app
cd "$APP"

echo "=== [1/6] Extract source (preserve uploads & .env) ==="
sudo -u pranala tar -xzf /tmp/src.tar.gz -C "$APP" \
  --exclude='public/uploads' \
  --exclude='.env' \
  --exclude='.next' \
  --exclude='.next-prod'
echo "extract OK"

echo "=== [2/6] Verify file kunci 2FA & versi ==="
ls -la "$APP/src/lib/two-factor.ts" \
  "$APP/src/lib/app-version.ts" \
  "$APP/prisma/migrations/20260908000000_add_two_factor_auth/migration.sql"
echo "verify OK"

echo "=== [3/6] npm ci ==="
sudo -u pranala npm ci --no-audit --no-fund
echo "npm ci OK"

echo "=== [4/6] prisma generate ==="
sudo -u pranala npx prisma generate
echo "prisma generate OK"

echo "=== [5/6] prisma migrate deploy ==="
sudo -u pranala npx prisma migrate deploy
echo "migrate OK"

echo "=== [6/6] build:prod ==="
sudo -u pranala npm run build:prod
echo "build OK"

echo "=== reload pm2 ==="
sudo -H -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 reload pranala-core
echo "reload OK"

echo "=== DEPLOY SELESAI ==="
