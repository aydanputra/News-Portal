#!/usr/bin/env bash
set -euo pipefail

TS=$(date +%Y%m%d-%H%M%S)
BK="/srv/pranala/backups/predeploy-${TS}"
mkdir -p "$BK"

echo "=== Backup DB pranala_db -> $BK/pranala_db.dump ==="
cd /
runuser -u postgres -- pg_dump -Fc pranala_db > "$BK/pranala_db.dump"
echo "db dump OK"

echo "=== Backup .env ==="
cp /srv/pranala/app/.env "$BK/.env"
echo "env backup OK"

echo "=== Catat ukuran uploads (tidak ditarik) ==="
du -sh /srv/pranala/app/public/uploads > "$BK/uploads-size.txt" 2>/dev/null || true

echo "=== Hasil backup ==="
du -sh "$BK"
ls -la "$BK"
echo "BACKUP_DIR=$BK"
