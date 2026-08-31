# Deploy VPS

Panduan ini menyiapkan project agar jalan di VPS dengan:

- PostgreSQL yang sudah ada di server
- upload/media disimpan ke disk lokal VPS
- aplikasi Next.js dijalankan via PM2

## 1. Persiapan server

Pastikan VPS sudah memiliki:

- Node.js 20+
- npm
- PostgreSQL aktif
- Nginx
- PM2 (`npm i -g pm2`)

Direktori upload aplikasi akan berada di:

- `public/uploads/`

Karena itu, folder project harus berada di storage persisten VPS, bukan folder temporary.

## 2. Siapkan database PostgreSQL

Buat database dan user khusus aplikasi:

```sql
CREATE USER news_portal_user WITH PASSWORD 'strong_password';
CREATE DATABASE news_portal_db OWNER news_portal_user;
GRANT ALL PRIVILEGES ON DATABASE news_portal_db TO news_portal_user;
```

Jika PostgreSQL berada di VPS yang sama, gunakan host:

- `127.0.0.1`
- port `5432`

## 3. Siapkan environment

Salin file contoh:

```bash
cp .env.example .env
```

Lalu isi minimal bagian ini:

```env
DATABASE_URL="postgresql://news_portal_user:strong_password@127.0.0.1:5432/news_portal_db"
DIRECT_URL="postgresql://news_portal_user:strong_password@127.0.0.1:5432/news_portal_db"
NEXT_PUBLIC_SITE_URL="https://domain-anda.com"
JWT_SECRET="secret-panjang-acak"
MASTER_KEY="master-key-panjang-acak"
CRON_SECRET="cron-secret-panjang-acak"
STORAGE_PROVIDER="local"
PORT="3000"
NEXT_DIST_DIR=".next"
PM2_INSTANCES="1"
```

Penting:

- `STORAGE_PROVIDER="local"` memastikan aplikasi tidak memakai storage lama berbasis S3/Cloudinary-compatible bila ada env sisa.
- Jangan isi variabel `S3_*` bila target deploy adalah local filesystem VPS.

## 4. Install dependency dan build

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
```

Jika ingin seed awal:

```bash
npx prisma db seed
```

## 5. Pastikan folder upload tersedia

```bash
mkdir -p public/uploads/imported
mkdir -p public/uploads/$(date +%Y)/$(date +%m)
```

Folder ini harus ikut di-backup karena semua media upload tersimpan di sana.

## 6. Jalankan dengan PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Catatan:

- `ecosystem.config.js` sekarang default ke build output `.next`, jadi cocok untuk `npm run build` biasa.
- Jika ingin multi-instance, ubah `PM2_INSTANCES`, tetapi untuk VPS 2 core sebaiknya mulai dari `1`.

## 7. Reverse proxy Nginx

Contoh konfigurasi:

```nginx
server {
    listen 80;
    server_name domain-anda.com www.domain-anda.com;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Setelah itu aktifkan SSL dengan Certbot.

## 8. Backup yang wajib

Backup rutin:

- database PostgreSQL
- folder `public/uploads`
- file `.env`

## 9. Yang tidak dipakai untuk mode VPS ini

Untuk deploy VPS lokal, abaikan:

- Neon
- Cloudinary
- semua env `S3_*`

Project sekarang sudah dipersiapkan agar default ke PostgreSQL biasa + local storage.
