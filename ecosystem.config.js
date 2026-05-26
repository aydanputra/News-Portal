module.exports = {
  apps: [
    {
      name: "news-portal-core", // Ganti dengan nama unik per klien (misal: client-a-news)
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1, // Atau 'max' jika ingin memanfaatkan semua core
      exec_mode: "cluster", // Gunakan 'fork' jika instances = 1
      watch: false, // Jangan restart otomatis jika file berubah di production
      env: {
        NODE_ENV: "production",
        PORT: 3000, // Ganti port unik per klien (3001, 3002, dst)
        NEXT_DIST_DIR: ".next-prod",
        // DATABASE_URL akan diambil dari .env file
      },
    },
  ],
};
