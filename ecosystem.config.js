const port = Number(process.env.PORT || 3000);
const distDir = process.env.NEXT_DIST_DIR || ".next";
const instances = Number(process.env.PM2_INSTANCES || 1);

module.exports = {
  apps: [
    {
      name: "news-portal-core", // Ganti dengan nama unik per klien (misal: client-a-news)
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances, // Atau 'max' jika ingin memanfaatkan semua core
      exec_mode: instances === 1 ? "fork" : "cluster",
      watch: false, // Jangan restart otomatis jika file berubah di production
      env: {
        NODE_ENV: "production",
        PORT: port, // Ganti port unik per klien (3001, 3002, dst)
        NEXT_DIST_DIR: distDir,
        // DATABASE_URL akan diambil dari .env file
      },
    },
  ],
};
