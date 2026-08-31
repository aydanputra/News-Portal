// Validasi magic bytes (server-side) untuk upload file.
// MIME dari client tidak bisa dipercaya; validasi memakai byte awal file.

export type DetectedImageType = "jpeg" | "png" | "webp" | "gif";
export type DetectedDocType = "pdf" | "zip" | "ole";

export const IMAGE_EXTENSION_BY_TYPE: Record<DetectedImageType, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  gif: ".gif",
};

export const DOC_EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
};

export function detectImageType(buffer: Buffer): DetectedImageType | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return "png";

  // GIF: "GIF8"
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return "gif";

  // WebP: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "webp";

  return null;
}

export function detectDocType(buffer: Buffer): DetectedDocType | null {
  if (!buffer || buffer.length < 8) return null;

  // PDF: "%PDF"
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "pdf";

  // ZIP family (docx/xlsx/zip): "PK"
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) return "zip";

  // OLE2 (doc/xls): D0 CF 11 E0 A1 B1 1A E1
  if (
    buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0 &&
    buffer[4] === 0xa1 && buffer[5] === 0xb1 && buffer[6] === 0x1a && buffer[7] === 0xe1
  ) return "ole";

  return null;
}

export function docMagicMatches(mime: string, magic: DetectedDocType | null): boolean {
  if (mime === "application/pdf") return magic === "pdf";
  if (mime === "application/msword" || mime === "application/vnd.ms-excel") return magic === "ole";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/zip" ||
    mime === "application/x-zip-compressed"
  ) {
    return magic === "zip";
  }
  return false;
}
