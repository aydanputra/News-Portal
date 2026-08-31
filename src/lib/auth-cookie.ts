// Konfigurasi cookie auth. Edge-safe (tanpa import next/headers) agar bisa
// dipakai di middleware. Prefix __Host- hanya dipakai di production karena
// browser menolak cookie __Host- tanpa flag Secure (HTTPS).

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_NAME = IS_PRODUCTION ? "__Host-auth_token" : "auth_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "strict" as const,
  path: "/",
};
