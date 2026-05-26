import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY && process.env.NODE_ENV === "production") {
  throw new Error("FATAL: JWT_SECRET environment variable is not set in production!");
}

const ACTUAL_SECRET = SECRET_KEY || "rahasia-default-dev-only";

// 1. Fungsi Mengacak Password (Hashing)
// Mengubah "rahasia123" menjadi "$2a$10$XyZ..."
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 2. Fungsi Cek Password
// Membandingkan password ketikan user dengan password acak di DB
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 3. Fungsi Membuat Tiket (Sign JWT)
// Tiket berisi: ID User, Email, dan Role
export function createToken(payload: object): string {
  return jwt.sign(payload, ACTUAL_SECRET, { expiresIn: "1d" }); // Tiket berlaku 1 hari
}

// 4. Fungsi Cek Tiket (Verify JWT)
// Memastikan tiket asli dan belum kadaluarsa
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, ACTUAL_SECRET);
  } catch {
    return null; // Tiket palsu/expired
  }
}
