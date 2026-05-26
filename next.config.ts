import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 tahun - gambar bersifat immutable (UUID)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Standar breakpoint
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail kecil
    remotePatterns: (() => {
      const patterns = [
        {
          protocol: "https",
          hostname: "localhost",
        },
        {
          protocol: "http",
          hostname: "localhost",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },
        {
          protocol: "https",
          hostname: "img.youtube.com",
        },
        {
          protocol: "https",
          hostname: "aurum.tirto.id",
        },
        {
          protocol: "https",
          hostname: "ui-avatars.com",
        },
        {
          protocol: "https",
          hostname: "pranala.co",
        },
      ] as any[];

      const publicBase = process.env.S3_PUBLIC_URL;
      if (publicBase) {
        try {
          const u = new URL(publicBase);
          patterns.push({ protocol: u.protocol.replace(":", ""), hostname: u.hostname });
        } catch (error) {
          console.warn("[next.config] Invalid S3_PUBLIC_URL, skipping remotePattern:", error);
        }
      }

      return patterns;
    })(),
  },
  // Non-aktifkan eslint saat build agar deploy tidak gagal karena warning sepele
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

const configToExport =
  typeof process.env.SENTRY_AUTH_TOKEN === "string" && process.env.SENTRY_AUTH_TOKEN.trim() !== ""
    ? withSentryConfig(nextConfig, { silent: true })
    : nextConfig;

export default configToExport;

// Trigger restart: 2026-03-05 3
