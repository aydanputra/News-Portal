#!/usr/bin/env bash
set -euo pipefail

APP=/srv/pranala/app
BUILD_LOG="$APP/deploy-build.log"
STAGING_NAME=".next-prod-staging"
STAGING="$APP/$STAGING_NAME"
ROLLBACK="$APP/.next-prod-old"
cd "$APP"

echo "=== [1/8] Extract source (preserve uploads & .env) ==="
tar -xzf /tmp/src.tar.gz -C "$APP" \
  --no-same-owner \
  --no-same-permissions \
  --exclude='public/uploads' \
  --exclude='.env' \
  --exclude='.next' \
  --exclude='.next-prod' \
  --exclude='.next-prod-staging' \
  --exclude='.next-prod-old'
echo "extract OK"

for path in "$APP"/* "$APP"/.[!.]*; do
  [ -e "$path" ] || continue
  [ "$path" = "$APP/public/uploads" ] && continue
  chown -R pranala:pranala "$path" 2>/dev/null || true
done
echo "ownership OK"

echo "=== [2/8] Verify file kunci ==="
ls -la "$APP/src/lib/two-factor.ts" \
  "$APP/src/lib/app-version.ts" \
  "$APP/prisma/migrations/20260908000000_add_two_factor_auth/migration.sql"
echo "verify OK"

echo "=== [3/8] npm ci ==="
sudo -u pranala npm ci --no-audit --no-fund
echo "npm ci OK"

echo "=== [4/8] prisma generate ==="
sudo -u pranala npx prisma generate
echo "prisma generate OK"

echo "=== [5/8] prisma migrate deploy ==="
sudo -u pranala npx prisma migrate deploy
echo "migrate OK"

# CATATAN KEAMANAN:
# Build dilakukan SEBELUM menyentuh aplikasi yang sedang live.
# Jika build gagal, script berhenti di sini dan pranala-core tetap melayani
# build lama (.next-prod) -> situs tetap UP.
echo "=== [6/8] build ke staging (app tetap live) ==="
rm -rf "$STAGING"
mkdir -p "$STAGING"
chown pranala:pranala "$STAGING"

rm -f "$BUILD_LOG"
setsid sudo -u pranala env NO_COLOR=1 NEXT_DIST_DIR="$STAGING_NAME" npm run build > "$BUILD_LOG" 2>&1 &
BUILD_PID=$!
echo "build started pid=$BUILD_PID log=$BUILD_LOG"

for i in $(seq 1 180); do
  if ! kill -0 "$BUILD_PID" 2>/dev/null; then
    break
  fi
  sleep 5
done

if kill -0 "$BUILD_PID" 2>/dev/null; then
  echo "=== BUILD TIMEOUT (15m) - killing process group ==="
  kill -9 -"$BUILD_PID" 2>/dev/null || true
  sleep 3
  echo "--- tail build log ---"
  tail -n 60 "$BUILD_LOG"
  echo "=== BUILD GAGAL (timeout) - aplikasi live tidak disentuh ==="
  exit 1
fi

set +e
wait "$BUILD_PID"
BUILD_EXIT=$?
set -e
echo "build exit=$BUILD_EXIT"
echo "--- tail build log ---"
tail -n 40 "$BUILD_LOG"

if [ "$BUILD_EXIT" -ne 0 ]; then
  echo "=== BUILD GAGAL - aplikasi live tidak disentuh, situs tetap UP ==="
  exit 1
fi
[ -f "$STAGING/BUILD_ID" ] || { echo "=== BUILD_ID tidak ditemukan di staging ==="; exit 1; }
echo "build OK ($(cat "$STAGING/BUILD_ID"))"

# Swap cepat: hentikan app hanya setelah build terbukti sukses.
# Downtime = durasi rename direktori (detik), bukan durasi build (menit).
echo "=== [7/8] swap artefak build ==="
sudo -H -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 stop pranala-core || true

rm -rf "$ROLLBACK"
if [ -d "$APP/.next-prod" ]; then
  mv "$APP/.next-prod" "$ROLLBACK"
fi
mv "$STAGING" "$APP/.next-prod"
chown -R pranala:pranala "$APP/.next-prod"
echo "swap OK (build lama disimpan di $ROLLBACK)"

echo "=== [8/8] reload pm2 ==="
if ! sudo -H -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 reload pranala-core; then
  echo "=== RELOAD GAGAL - rollback ke build lama ==="
  rm -rf "$APP/.next-prod-failed"
  mv "$APP/.next-prod" "$APP/.next-prod-failed"
  mv "$ROLLBACK" "$APP/.next-prod"
  chown -R pranala:pranala "$APP/.next-prod"
  sudo -H -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 reload pranala-core || true
  echo "=== ROLLBACK SELESAI - situs kembali ke build lama ==="
  exit 1
fi
echo "reload OK"

echo "--- status pm2 ---"
sudo -H -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 list || true
echo
echo "=== DEPLOY SELESAI (build $(cat "$APP/.next-prod/BUILD_ID")) ==="
echo "Jika ada masalah, rollback manual:"
echo "  sudo -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 stop pranala-core"
echo "  mv $APP/.next-prod ${APP}/.next-prod-failed && mv $ROLLBACK $APP/.next-prod"
echo "  sudo -u pranala env PM2_HOME=/srv/pranala/.pm2 pm2 reload pranala-core"
echo
echo "Hapus build lama (opsional, setelah verifikasi): rm -rf $ROLLBACK"
