import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

export const dynamic = "force-dynamic";

const PRIVATE_IP_PATTERNS: RegExp[] = [
  /^127\./,
  /^10\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
  /^::ffff:127\./i,
  /^::ffff:10\./i,
  /^::ffff:169\.254\./i,
  /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./i,
  /^::ffff:192\.168\./i,
];

function isPrivateOrReservedIp(ip: string): boolean {
  const normalized = ip.trim().replace(/^\[|\]$/g, "");
  if (isIP(normalized) === 0) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(normalized));
}

async function hostIsBlocked(hostname: string): Promise<boolean> {
  const trimmed = hostname.trim().replace(/^\[|\]$/g, "");
  if (isIP(trimmed) !== 0) {
    return isPrivateOrReservedIp(trimmed);
  }
  try {
    const addresses = await lookup(trimmed, { all: true });
    if (!addresses || addresses.length === 0) return true;
    return addresses.some((entry) => isPrivateOrReservedIp(entry.address));
  } catch {
    return true;
  }
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function clampPosition(value: unknown) {
  const normalized = String(value || "center").trim().toLowerCase();
  return normalized === "top" || normalized === "bottom" || normalized === "left" || normalized === "right"
    ? normalized
    : "center";
}

async function readInputBuffer(input: string): Promise<Buffer | null> {
  try {
    const value = String(input || "").trim();
    if (!value) return null;

    if (value.startsWith("/")) {
      const cleanPath = value.split("?")[0].replace(/^\/+/, "");
      if (cleanPath.includes("..") || !cleanPath.startsWith("uploads/")) return null;
      const absolutePath = path.join(process.cwd(), "public", cleanPath);
      return await fs.readFile(absolutePath);
    }

    if (!/^https?:\/\//i.test(value)) return null;

    const url = new URL(value);
    if (await hostIsBlocked(url.hostname)) return null;

    const response = await fetch(value, { redirect: "follow", cache: "force-cache" });
    if (!response.ok) return null;

    const finalUrl = new URL(response.url);
    if (await hostIsBlocked(finalUrl.hostname)) return null;

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

function buildOverlaySvg(params: {
  canvasWidth: number;
  canvasHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  watermarkPngBase64: string;
}) {
  const { canvasWidth, canvasHeight, x, y, width, height, opacity, watermarkPngBase64 } = params;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">
      <image href="data:image/png;base64,${watermarkPngBase64}" x="${x}" y="${y}" width="${width}" height="${height}" opacity="${opacity}" />
    </svg>`,
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceUrl = searchParams.get("src") || "";
    const watermarkUrl = searchParams.get("wm") || "";

    if (!sourceUrl || !watermarkUrl) {
      return NextResponse.json({ error: "Parameter watermark tidak lengkap" }, { status: 400 });
    }

    const [sourceBuffer, watermarkBuffer] = await Promise.all([
      readInputBuffer(sourceUrl),
      readInputBuffer(watermarkUrl),
    ]);

    if (!sourceBuffer || !watermarkBuffer) {
      return NextResponse.redirect(new URL(sourceUrl, request.url).toString(), 307);
    }

    const sourceImage = sharp(sourceBuffer, { failOn: "none" });
    const sourceMetadata = await sourceImage.metadata();
    const sourceWidth = Math.max(1, sourceMetadata.width || 0);
    const sourceHeight = Math.max(1, sourceMetadata.height || 0);

    if (!sourceWidth || !sourceHeight) {
      return NextResponse.redirect(new URL(sourceUrl, request.url).toString(), 307);
    }

    const sizePercent = clamp(searchParams.get("sz"), 5, 80, 24);
    const opacity = clamp(searchParams.get("op"), 0, 100, 35) / 100;
    const paddingTop = clamp(searchParams.get("pt"), 0, 240, 24);
    const paddingRight = clamp(searchParams.get("pr"), 0, 240, 24);
    const paddingBottom = clamp(searchParams.get("pb"), 0, 240, 24);
    const paddingLeft = clamp(searchParams.get("pl"), 0, 240, 24);
    const position = clampPosition(searchParams.get("pos"));

    const watermarkPng = await sharp(watermarkBuffer, { failOn: "none" }).png().toBuffer();
    const watermarkMetadata = await sharp(watermarkPng).metadata();
    const watermarkSourceWidth = Math.max(1, watermarkMetadata.width || 1);
    const watermarkSourceHeight = Math.max(1, watermarkMetadata.height || 1);
    const targetWidth = Math.max(1, Math.round((sourceWidth * sizePercent) / 100));
    const targetHeight = Math.max(1, Math.round((targetWidth * watermarkSourceHeight) / watermarkSourceWidth));

    const resizedWatermarkPng = await sharp(watermarkPng)
      .resize({ width: targetWidth, height: targetHeight, fit: "contain" })
      .png()
      .toBuffer();

    const actualWatermarkMetadata = await sharp(resizedWatermarkPng).metadata();
    const watermarkWidth = Math.max(1, actualWatermarkMetadata.width || targetWidth);
    const watermarkHeight = Math.max(1, actualWatermarkMetadata.height || targetHeight);

    const centeredX = Math.round((sourceWidth - watermarkWidth + paddingLeft - paddingRight) / 2);
    const centeredY = Math.round((sourceHeight - watermarkHeight + paddingTop - paddingBottom) / 2);

    let left = centeredX;
    let top = centeredY;

    switch (position) {
      case "top":
        left = centeredX;
        top = paddingTop;
        break;
      case "bottom":
        left = centeredX;
        top = sourceHeight - watermarkHeight - paddingBottom;
        break;
      case "left":
        left = paddingLeft;
        top = centeredY;
        break;
      case "right":
        left = sourceWidth - watermarkWidth - paddingRight;
        top = centeredY;
        break;
      default:
        left = centeredX;
        top = centeredY;
        break;
    }

    left = Math.max(0, Math.min(sourceWidth - watermarkWidth, left));
    top = Math.max(0, Math.min(sourceHeight - watermarkHeight, top));

    const overlay = buildOverlaySvg({
      canvasWidth: sourceWidth,
      canvasHeight: sourceHeight,
      x: left,
      y: top,
      width: watermarkWidth,
      height: watermarkHeight,
      opacity,
      watermarkPngBase64: resizedWatermarkPng.toString("base64"),
    });

    const outputFormat = sourceMetadata.format === "png" ? "png" : sourceMetadata.format === "jpeg" ? "jpeg" : "webp";
    const pipeline = sourceImage.composite([{ input: overlay, blend: "over" }]);
    let renderedImage: Buffer;
    if (outputFormat === "png") {
      renderedImage = await pipeline.png().toBuffer();
    } else if (outputFormat === "jpeg") {
      renderedImage = await pipeline.jpeg({ quality: 92 }).toBuffer();
    } else {
      renderedImage = await pipeline.webp({ quality: 92 }).toBuffer();
    }

    const contentType =
      outputFormat === "png" ? "image/png" : outputFormat === "jpeg" ? "image/jpeg" : "image/webp";

    return new NextResponse(new Uint8Array(renderedImage), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("GET /api/watermark-image error:", error);
    return NextResponse.json({ error: "Gagal membuat gambar watermark" }, { status: 500 });
  }
}
